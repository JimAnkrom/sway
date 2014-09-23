/**
 * Created by Jim Ankrom on 9/14/2014.
 */


var sway = sway || {};
// Handle location events
sway.location = {
    init: function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(sway.location.handlePosition);
            navigator.geolocation.watchPosition(sway.location.handlePosition);
        }
    },
    handlePosition: function (position) {
        // position.coords.latitude
        // position.coords.longitude
        // position.coords.accuracy
        // position.coords.altitude
        // position.coords.altitudeAccuracy
        // position.coords.heading
        // position.coords.speed
    }
}