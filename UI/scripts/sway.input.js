/**
 * Created by Jim Ankrom on 7/30/2014.
 *
 * References:
 * https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Orientation_and_motion_data_explained
 *
 * touchstart, touchmove events
 */
var sway = {
    debugPanel: null,
    input: {
        // TODO: Orientation
        // TODO: Motion
        // TODO: Touch
        capabilities: null,

        // TODO: DeviceOrientationEvent.absolute
        // TODO: DeviceOrientationEvent.alpha
        // TODO: DeviceOrientationEvent.beta
        // TODO: DeviceOrientationEvent.gamma,
        // TODO: Browsers may handle this differently, please test.
        calibration: null,

        // TODO: DeviceMotionEvent.acceleration - if data is missing here, try IncludingGravity
        // TODO: DeviceMotionEvent.accelerationIncludingGravity
        // TODO: DeviceMotionEvent.interval
        // TODO: DeviceMotionEvent.rotationRate
        motion: null,

        // DeviceOrientationEvent handler
        handleOrientationEvent: function (e) {
            if (!calibration) {
                this.calibration = e;
            }
        },
        // DeviceMotionEvent handler
        handleMotionEvent: function (e) {
            this.motion = e;
        },
        handleTouchEvent: function () {

        },
        outputToDebug: function () {
            if (sway.debugPanel) {

            }
        }
    }
};

// Detect Browser Capabilities
if (window.DeviceOrientationEvent) {
    sway.input.capabilities.orientation = true;
    window.ondeviceorientation = function (e) {
        sway.input.handleOrientationEvent.call(sway.input, e);
    }
}
if (window.DeviceMotionEvent) {
    sway.input.capabilities.motion = true;
    window.ondevicemotion = function (e) {
        sway.input.handleMotionEvent.call(sway.input, e);
    }
}

// Set up
window.onload = function () {
  var element = document.getElementById('debugPanel');
    if (element) {
        sway.debugPanel = element;
    }
};


