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
        settings: {}
    };

    // Sway Services
    sway.server = {
        calibration: function (data) {
            sway.state.settings.calibration = data;
            //console.log('Calibration Received - ' + JSON.stringify(data));
        },
        control: function (channel, control) {
            // we only care about the channel configuration, so use that
            this.processMotion(channel, control, 'rotation');
            this.processMotion(channel, control, 'orientation');
            this.processLocation(channel, control, 'location');
        },
        processMotion: function (channel, control, inputType) {
            var cRoute = channel[inputType]
            if (cRoute) {
                var cInput = control[inputType];
                if (cInput) {

                    // Currently - Yaw, Pitch, Roll (alpha, beta, gamma)
                    sway.osc.send(cRoute, cInput.alpha, cInput.beta, cInput.gamma);
                }
            }
        },
        processLocation: function (channel, control, inputType) {
            var cRoute = channel[inputType]
            if (cRoute) {
                var cInput = control[inputType];
                if (cInput) {
                    // TODO: what do we want to do with location...?
                }
            }
        },
        clear: function () {
            sway.state.settings = {};
        },
        debug: function () {
            return sway.state;
        },
        send: function (address) {
            if (address) sway.osc.send.apply(sway.osc, arguments);// sway.osc, address, arguments);
            return null;
        },
        shutdown: function () {
            sway.osc.close();
        }
    };

    return sway.server;
}());