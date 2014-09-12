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
        },
        processMotion: function (channel, control, inputType) {
            var cRoute = channel[inputType]
            if (cRoute) {
                var cInput = control[inputType];
                if (cInput) {
                    sway.osc.send.apply(sway.osc, cRoute, cInput.alpha, cInput.beta, cInput.gamma);
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
            if (address) sway.osc.send.apply(sway.osc, address, arguments);
            return null;
        },
        shutdown: function () {
            sway.osc.close();
        }
    };

    return sway.server;
}());