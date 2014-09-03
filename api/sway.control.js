/**
 * Created by Jim Ankrom on 8/14/2014.
 */
var sway = sway || {};
sway.config = require('./sway.config.json');
sway.osc = require('./sway.osc');
sway.osc.open();

module.exports = (function (){

    // Sway state management - leave private for now.
    sway.state = {
        control: [],
        settings: {}
    };

    // Sway Services
    sway.server = {
        calibration: function (data) {
            sway.state.settings.calibration = data;
            console.log('Calibration Received - ' + JSON.stringify(data));
        },
        control: function (control) {
            sway.state.control.push(control);
            // map control to OSC messages
            var cfg = sway.config;
            if (control.rotation) {
                var r = control.rotation;
                var cr = cfg.rotation;
                if (r.alpha!=null) sway.server.send(cr.alpha, r.alpha);
                if (r.beta!=null) sway.server.send(cr.beta, r.beta);
                if (r.gamma!=null) sway.server.send(cr.gamma, r.gamma);
            }
            if (control.orientation) {
                var o = control.orientation;
                var co = cfg.orientation;
                if (o.alpha!=null) sway.server.send(co.alpha, o.alpha);
                if (o.beta!=null) sway.server.send(co.beta, o.beta);
                if (o.gamma!=null) sway.server.send(co.gamma, o.gamma);
            }
        },
        clear: function () {
            sway.state.control = [];
            sway.state.settings = {};
        },
        debug: function () {
            return sway.state;
        },
        send: function (address, value) {
            console.log(address + ' ' + value);
            if (address) sway.osc.send(address, value);
            return null;
        },
        shutdown: function () {
            sway.osc.close();
        }
    };

    return sway.server;
}());