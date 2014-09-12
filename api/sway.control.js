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
            //console.log('Calibration Received - ' + JSON.stringify(data));
        },
        control: function (channel, control) {
            sway.state.control.push(control);
            // we only care about the channel configuration, so use that
            this.processMotion(channel, control, 'rotation');
            this.processMotion(channel, control, 'orientation');
        },
        processMotion: function (channel, control, inputType) {
            var cRoute = channel[inputType]
            if (cRoute) {
                var cInput = control[inputType];
                if (cInput) {
                    if (cRoute.alpha != null) sway.server.send(cRoute.alpha, cInput.alpha);
                    if (cRoute.beta != null) sway.server.send(cRoute.beta, cInput.beta);
                    if (cRoute.gamma != null) sway.server.send(cRoute.gamma, cInput.gamma);
                }
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
            // console.log(address + ' ' + value);
            if (address) sway.osc.send(address, value);
            return null;
        },
        shutdown: function () {
            sway.osc.close();
        }
    };

    return sway.server;
}());