/**
 * Created by Jim Ankrom on 7/30/2014.
 *
 * References:
 * http://www.w3.org/TR/orientation-event/
 * https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Orientation_and_motion_data_explained
 * http://diveintohtml5.info/geolocation.html

 * X, Y, Z - East, North, Up (off the device)
 *
 * Device lying flat horizontal pointing west:
 *  {alpha: 90,
       beta: 0,
       gamma: 0};

 * touchstart, touchmove events
 */
var sway = sway || {};
sway.debugPanel = null;
sway.templates = {
    dataRow: function (label, value) {
        return '<tr><td>' + label + '</td><td>' + value + '</td></tr>';
    }
};

// Handle location events
sway.location = {
    get: function () {
        navigator.geolocation.getCurrentPosition(this.handleGeolocation);
    },
    handleGeolocation: function (pos) {
        sway.location.current = pos;
    }
};

// Handle basic input
sway.input = {
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
    // TODO: touchstart, touchend, touchmove
    handleTouchEvent: function () {
    }
};


// Class to handle all motion events
sway.motion = {
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
    // TODO: Is this needed anymore with channel support?
    handleMapOSC: function (address, value) {
        if (sway.user) {
            if (sway.user.token) {
                var params = {
                    token: sway.user.token,
                    map: {
                        channel: sway.user.token.channel || 'default',
                        address: address,
                        value: value
                    }};
                //directly post the click event
                sway.api.post(sway.config.url + '/maposc', params, {});
            }
        }
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
        sway.motion.calibration.orientation = e;
        if (sway.user) {
            if (sway.user.token) {

                sway.motion.current = {token: sway.user.token, control: { orientation: {
                    alpha: e.alpha, beta: e.beta, gamma: e.gamma, absolute: e.absolute
                }}};
                // set a value to compare to in setInterval closure
                var timestamp = Date.now();
                sway.motion.timestamp = timestamp;

                // Setting a 50ms gate for now... faster later? Who knows. ;)
                if (!sway.poll) {
                    sway.poll = window.setInterval(function () {
                        // if there has been no change in the timestamp, we are idle.
                        if (sway.motion.timestamp == timestamp) {
                            window.clearInterval(sway.poll);
                            // setTimeout for idle expiration
                            sway.idleTimeout = window.setTimeout(function () {
                                sway.api.post(sway.config.url + sway.config.api.delete, sway.motion.current, {});
                            }, sway.config.user.idleTimeout);
                            return;
                        } else {
                            // we are no longer idle, let's remove the idle timeout
                            window.clearTimeout(sway.idleTimeout);
                        }
                        sway.api.post(sway.config.url + sway.config.api.control, sway.motion.current, {})
                    }, sway.config.user.controlInterval);
                }
            }
        } else {
            alert('sway.user not set');
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
    }
};

sway.renderDebugEvent = function (panel, e) {
    var c = this.calibration;
    if (!c) return;
    var o = c.orientation,
        m = c.motion,
        r = c.rotation,
        i = c.motionInterval,
    //l = sway.location.current,
        t = sway.templates;

    var output = "<table>";
    output += t.dataRow('Channel', JSON.stringify(sway.user.channel));
    if (o) {
        output +=
            t.dataRow('absolute', o.absolute)
            + t.dataRow('alpha', o.alpha)
            + t.dataRow('beta', o.beta)
            + t.dataRow('gamma', o.gamma);
    }
    if (m) {
        output +=
            t.dataRow('accel.X', m.x)
            + t.dataRow('accel.Y', m.y)
            + t.dataRow('accel.Z', m.z);

    }
    if (r) {

        output +=
            t.dataRow('rot alpha', r.alpha)
            + t.dataRow('rot beta', r.beta)
            + t.dataRow('rot gamma', r.gamma);
    }
        //+ t.dataRow('interval', i)
        //+ t.dataRow('latitude', l.latitude)
        //+ t.dataRow('longitude', l.longitude)
        //+ t.dataRow('altitude', l.altitude),
        output += "</table>";
    sway.debugPanel.innerHTML = output;
};

window.addEventListener('load', function () {
    alert("Sway v0.21.5!");

    var element = document.getElementById('debugPanel');
    if (element) {
        sway.debugPanel = element;
    }
    // Detect Browser Capabilities
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
});


