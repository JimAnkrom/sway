/**
 * Created by Jim Ankrom on 9/14/2014.
 */


var sway = sway || {};
// Handle location events
sway.location = {
    init: function () {
        if (navigator.geolocation) {
            var options = {
                enableHighAccuracy: false,
                timeout: 5000,
                maximumAge: 0
            };

            navigator.geolocation.getCurrentPosition(sway.location.handlePosition, function () {}, options);
            navigator.geolocation.watchPosition(sway.location.handlePosition, function () {}, options);
        }
    },
    handlePosition: function (position) {
        sway.motion.calibration.position = position;

        if (sway.debugPanel) {
            sway.renderDebugEvent.call(sway, sway.debugPanel, position);
        }
        // position.coords.latitude
        // position.coords.longitude
        // position.coords.accuracy
        // position.coords.altitude
        // position.coords.altitudeAccuracy
        // position.coords.heading
        // position.coords.speed
    }
};

var oninitOld = sway.oninitialized;
sway.oninitialized = function () {
    sway.location.init();
    oninitOld();
};