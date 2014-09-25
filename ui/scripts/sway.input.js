/**
 * Created by Jim Ankrom on 7/30/2014.
 *
 * sway.input should handle input from html control based input, such as clicks, sliders, knobs, etc.
 *
 */
var sway = sway || {};

// Handle basic input
sway.input = {
    init: function () {},
    handleOSCClick: function (address, value) {
        if (sway.user) {
            if (sway.user.token) {
                var params = {
                    token: sway.user.token,
                    control: {
                        address: address,
                        value: value
                    }};
                //directly post the click event
                sway.api.post(sway.config.url + sway.api.osc, params, {});
            }
        }
    },
    // Sliders are rotary knobs or fader / sliders.
    handleSlider: function (sliderOptions, address, value) {

    }
};


/**
 * Sway.motion - Created by Jim Ankrom on 9/14/2014.
 *
 * References:
 * http://www.w3.org/TR/orientation-event/
 * https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Orientation_and_motion_data_explained
 * http://diveintohtml5.info/geolocation.html

 * X, Y, Z - East, North, Up (off the device)
 * Alpha - Yaw
 * Beta - Pitch
 * Gamma - Roll
 *
 * Alpha 0 is north; compass counts up counter-clockwise
 *
 * Device lying flat horizontal pointing west:
 *  {alpha: 90, beta: 0, gamma: 0};
 *
 */
// Plugin to handle all motion events
sway.motion = {
    init: function () {
        // Detect Browser Capabilities and wire up events for each
        if (window.DeviceOrientationEvent) {
            sway.motion.capabilities.orientation = true;
            window.addEventListener('deviceorientation', function (e) {
                sway.motion.handleOrientationEvent.call(sway.motion, e);
            });
        }
        if (window.DeviceMotionEvent) {
            sway.motion.capabilities.motion = true;
            window.addEventListener('devicemotion', function (e) {
                sway.motion.handleMotionEvent.call(sway.motion, e);
            });
        }
    },
    // TODO: Orientation
    // TODO: Motion
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
    icon: null,
    renderIcon: function (e) {
        if (!sway.motion.icon) {
            var icon = document.createElement('img');
            icon.style.position = 'absolute';
            icon.style.zIndex = 100;
            sway.motion.icon = icon;
            document.body.appendChild(sway.motion.icon);
            icon.src = '/images/videobleepicon.gif';
        }
        // beta - pitch - is -180 upside-down from pointing forward, 180 upsidedown from tilting back (towards user)
        var posTop = Math.round(((e.beta + 180)/360)*100);
        // gamma - roll - is -90 full to left, 90 full to right; or 0 to 180 corrected
        var posLeft = Math.round(((e.gamma + 90)/180)*100);

        sway.motion.icon.style.left = posLeft + '%';

        sway.motion.icon.style.top = posTop + '%';

    },
    // DeviceOrientationEvent handler
    handleOrientationEvent: function (e) {
//            if (!calibration) {
//                // This should always be the user pointing towards their desired start point on the screen!
//                // We may be able to have them point to "the djs" first, or even run a system calibration to establish where the compass heading is.
//                this.calibration = e;
//            }
        if (sway.debugPanel) {

            sway.renderDebugEvent(sway.debugPanel, e);
        }

        sway.motion.renderIcon(e);

        sway.motion.calibration.orientation = e;

        sway.motion.current = { control: { orientation: {
            alpha: e.alpha, beta: e.beta, gamma: e.gamma, absolute: e.absolute
        }}};

        // set a value to compare to in setInterval closure
        var timestamp = Date.now();
        sway.motion.timestamp = timestamp;

        // Setting a 50ms gate for now... faster later? Who knows. ;)
        if (!sway.poll) {
            sway.poll = window.setInterval(function () {
                // if there has been no change in the timestamp, we are idle
                var isIdle = (sway.motion.timestamp == timestamp);
                if (sway.motion.idle(isIdle)) {
                    window.clearInterval(sway.poll);
                    return;
                }
                sway.api.post(sway.config.url + sway.config.api.control, sway.motion.current, {})
            }, sway.config.user.controlInterval);
        }
    },
    // DeviceMotionEvent handler
    handleMotionEvent: function (e) {
        this.calibration.motion = e.acceleration || e.accellerationIncludingGravity || {};
        this.calibration.rotation = e.rotationRate || {};
        this.calibration.motionInterval = e.interval || {};

        if (sway.debugPanel) {
            sway.renderDebugEvent.call(this, sway.debugPanel, e);
        }
    },
    idle: function (isIdle) {
        if (isIdle) {
            // setTimeout for idle expiration
            sway.idleTimeout = window.setTimeout(function () {
                sway.api.post(sway.config.url + sway.config.api.deleteUser, {}, {});
            }, sway.config.user.idleTimeout);
            return true;
        }
        // we are no longer idle, let's remove the idle timeout
        window.clearTimeout(sway.idleTimeout);
        return false;
    }
};


