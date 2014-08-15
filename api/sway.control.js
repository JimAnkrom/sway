/**
 * Created by cosinezero on 8/14/2014.
 */
module.exports = (function (){
    var sway = {};

    // Sway state management - leave private for now.
    sway.state = {
        control: [],
        settings: {}
    };

    // Sway Services
    sway.server = {
        calibration: function (data) {
            sway.state.settings.calibration = data;
        },
        control: function (data) {
            sway.state.control.push(data);
        },
        clear: function () {
            sway.state.control = [];
            sway.state.settings = {};
        },
        debug: function () {
            return sway.state;
        }
    };

    return sway.server;
}());