/**
 * Created by Jim Ankrom on 7/30/2014.
 *
 * References:
 * http://www.w3.org/TR/orientation-event/
 * https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Orientation_and_motion_data_explained
 *
 * X, Y, Z - East, North, Up (off the device)
 *
 * Device lying flat horizontal pointing west:
 *  {alpha: 90,
       beta: 0,
       gamma: 0};

 * touchstart, touchmove events
 */
var sway = {
    debugPanel: null,
    input: {
        // TODO: Orientation
        // TODO: Motion
        // TODO: Touch
        capabilities: {},
        calibration: {},

        // TODO: DeviceOrientationEvent.absolute
        // TODO: DeviceOrientationEvent.alpha
        // TODO: DeviceOrientationEvent.beta
        // TODO: DeviceOrientationEvent.gamma,
        // TODO: Browsers may handle this differently, please test.

        // TODO: DeviceMotionEvent.acceleration - if data is missing here, try IncludingGravity
        // TODO: DeviceMotionEvent.accelerationIncludingGravity
        // TODO: DeviceMotionEvent.interval
        // TODO: DeviceMotionEvent.rotationRate
        motion: null,

        // DeviceOrientationEvent handler
        handleOrientationEvent: function (e) {
//            if (!calibration) {
//                // This should always be the user pointing towards their desired start point on the screen!
//                // We may be able to have them point to "the djs" first, or even run a system calibration to establish where the compass heading is.
//                this.calibration = e;
//            }
            if (sway.debugPanel) {
                this.renderDebugEvent(sway.debugPanel, e);
            }
            sway.input.calibration.orientation = e;
        },
        // DeviceMotionEvent handler
        handleMotionEvent: function (e) {
            this.calibration.motion = e.acceleration || e.accellerationIncludingGravity || {};
            this.calibration.rotation = e.rotationRate || {};

            if (sway.debugPanel) {
                this.renderDebugEvent.call(this, sway.debugPanel, e);
            }
        },
        handleTouchEvent: function () {
        },
        outputToDebug: function () {
        },
        renderDebugEvent: function (panel, e) {
            var o = this.calibration.orientation;
            var m = this.calibration.motion;
            var r = this.calibration.rotation;
            panel.innerHTML = "absolute: " + o.absolute;
            panel.innerHTML += "<br>alpha: " + o.alpha;
            panel.innerHTML += "<br>beta: " + o.beta;
            panel.innerHTML += "<br>gamma: " + o.gamma;
            panel.innerHTML += "<br>accel X: " + m.x;
            panel.innerHTML += "<br>accel Y: " + m.y;
            panel.innerHTML += "<br>accel Z: " + m.z;
            panel.innerHTML += "<br>rotation alpha: " + r.alpha;
            panel.innerHTML += "<br>rotation beta: " + r.beta;
            panel.innerHTML += "<br>rotation gamma: " + r.gamma;
        }
    }
};

window.addEventListener('load', function () {
    alert("Sway v0.13!");
    var element = document.getElementById('debugPanel');
    if (element) {
        sway.debugPanel = element;
    }
    // Detect Browser Capabilities
    if (window.DeviceOrientationEvent) {
        sway.input.capabilities.orientation = true;
        window.addEventListener('deviceorientation', function (e) {
            sway.input.handleOrientationEvent.call(sway.input, e);
        });
    }
    if (window.DeviceMotionEvent) {
        sway.input.capabilities.motion = true;
        window.addEventListener('devicemotion', function (e) {
            sway.input.handleMotionEvent.call(sway.input, e);
        });
    }
});


