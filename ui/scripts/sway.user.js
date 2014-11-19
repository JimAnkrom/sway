/**
 * Created by Jim Ankrom on 8/16/2014.
 *
 * sway.user is the library which will control client authorization, establish server connections
 *
 * It requires the existence of global a config variable 'sway'
 *
 * sway.config
 * sway.templates
 * sway.plugins
 * sway.user
 * sway.api
 * sway.sockets
 *
 */
var sway = sway || {};

// default config. Note that these values can be overwritten at any time by a message from sway
//sway.hostname = "http://sway.videobleep.tv";
sway.debugPanel = null;
sway.outputPanel = null;
sway.alertCount = 0;

/**
 *
 * sway.config
 *
 */
sway.config = {
    "debug": "verbose",
    "url": 'http://127.0.0.1:1000',
    "ui": {
        // maximum alert messages allowed
        "maxAlerts": 10
    },
    "user": {
        heartbeatInterval: 250,
        // interval, in milliseconds, that motion control messages are sent
        controlInterval: 50,
        // time, in milliseconds, before an idle user times out
        idleTimeout: 10000
    },
    "api": {
        "heartbeat": "/pulse",
        "users": "/users",
        "control": "/control",
        "osc": "/osc",
        "deleteUser": "/delete",
        "monitor": "/monitor"
    },
    update: function (config)  {
        if (!config) return;
        if (config.heartbeatInterval) sway.config.user.heartbeatInterval = config.heartbeatInterval;
        if (config.idleTimeout) sway.config.user.idleTimeout = config.idleTimeout;
        if (config.controlInterval) sway.config.user.controlInterval = config.controlInterval;
        if (config.serverUrl) sway.config.url = config.serverUrl;
        if (config.api) sway.config.api = config.api;
    }
};

sway.plugins = {
    getList: function () {
        if (sway.plugins.list == null)
        { sway.plugins.list = []; }
        return sway.plugins.list;
    },
    register: function (plugin) {
        this.getList().push(plugin);
        plugin.init.call(plugin);
    }
};

sway.templates = {
    dataRow: function (label, value) {
        return '<tr><td>' + label + '</td><td>' + value + '</td></tr>';
    },
    message: function (message) {
        return '<div>' + message + '</div>';
    }
};

/**
 *
 * Sway bootstrapping
 *
 */
sway.oninitialized = function () {
    // initialize plugins here or override this
    sway.motion.init();
};

sway.init = function () {

    if (sway.hostname) {
        if (window.location.origin != sway.hostname) {
            window.location.href = sway.hostname;
            return;
        }
    }

    if (!(sway.config.url)) return sway.debug('sway.config.url is not set!');
    sway.user.authorize();

    sway.outputPanel = document.createElement('div');
    document.body.appendChild(sway.outputPanel);
};

// Sway User Module
sway.user = {
    token: {},
    channel: {},
    user: {},
    setHeartbeat: function () {
        // set a value to compare to in setInterval closure
        var timestamp = Date.now();

        sway.user.idleTimestamp = timestamp;

        // Set up a heartbeat to ensure that if we're in an idle queue we still can get a channel update.
        if (!sway.heartbeat) {
            sway.heartbeat = window.setInterval(function () {
                // if there has been no change in the timestamp, we are idle
                var isIdle = (sway.user.idleTimestamp == timestamp);

                if (sway.motion.idle(isIdle)) {
                    window.clearInterval(sway.poll);
                    return;
                }

                sway.api.post( sway.config.url + sway.config.api.heartbeat, {}, {});
            }, sway.config.user.heartbeatInterval);
        }
    },
    authorize: function (callback) {
        // post to url/users
        sway.api.post(sway.config.url + "/users", sway.user.user, {
                success: function (req, res) {
                    //alert('Authorized! - ' + JSON.stringify(res.channel));
                    if (callback) callback.call(sway, res);
                    if (sway.oninitialized) { sway.oninitialized.call(sway, res); }
                },
                error: function (err, res) {
                    sway.alert('error ' + JSON.stringify(err));
                }
            }
        );
    }
};

sway.sockets = {
    init: function () {
        sway.sockets.socket = io.connect(sway.config.socketAddress);
        socket.on('user-update', sway.sockets.handleUpdate);
    },
    // handle updates from the server
    handleUpdate: function (data) {},
    emit: function () {}
};

// Sway API calls and utilities
sway.api = {
    // Handles standard Sway Server return messages (non-request specific)
    processResponse: function (data) {
        sway.config.update(data.config);
        //console.log(JSON.stringify(data.token));
        if (data.user) sway.user.user = data.user;
        if (data.token) sway.user.token = data.token;
        if (data.channel) {
            sway.user.channel = data.channel;
            sway.config.channel = data.channel;
        }
        if (data.messages) sway.alert(data.messages);
        if (data.redirect) {
            document.location.href = data.redirect;
        }
    },
    addTokenToParams: function (params) {
        if (sway.user) {
            if (sway.user.token) {
                params.token = sway.user.token;
            }
        }
    },
    delete: function (url, params, options) {
        sway.api.addTokenToParams(params);
        return sway.api.request(url, 'DELETE', params, options);
    },
    get: function (url, params, options) {
        sway.api.addTokenToParams(params);
        return sway.api.request(url, 'GET', params, options);
    },
    post: function (url, params, options) {
        sway.api.addTokenToParams(params);
        return sway.api.request(url, 'POST', params, options);
    },
    request: function (url, verb, params, options) {
        var ooptions = options || {};
        if (window.XMLHttpRequest) {
            var http = new XMLHttpRequest();
            http.withCredentials = true;
            options.responseType = options.responseType || "json";
            if (http.responseType) http.responseType = options.responseType;

            http.onreadystatechange = function () {
                if (http.readyState == 4) {
                    if (http.status == 200) {
                        var response;
                        if (!http.responseType) {
                            if (options.responseType == 'json') {
                                response = JSON.parse(http.responseText);
                            } else {
                                response = http.responseText;
                            }
                        }
                        sway.api.processResponse(response);
                        if (options.success) {
                            options.success(http, response);

                        }
                    } else {
                        sway.alert('Error: Response status ' + http.status + ' returned for ' + http.url + ' URL: ' + url);
                        if (options.error) {
                            options.error(http, http.response);
                        }
                        sway.debug('Error: Response status ' + http.status + ' returned for ' + http.url + ' URL: ' + url);
                    }
                }
            };
            var message = JSON.stringify(params);
            //console.log(url);
            http.open(verb, url, true);
            http.setRequestHeader('Accept','*/*');
            http.setRequestHeader('Content-Type', 'application/json');

            //http.setRequestHeader("Content-Length", message.length);
            //http.send(params);
            http.send(message);
            return http;
        }
        // because IE5&6 needs to go away
        return sway.debug('You are using a browser that does not support required technology for Sway!');
    }
};

sway.debug = function (message) {
    if (console && console.log) {
        console.log(message)
    } else {
        sway.alert(message);
    }
};

sway.alert = function (message) {
    if (message.isArray && message.isArray()) {
        for (var i=0; i < message.length; i++)
        {
            sway.addMessage(message);
        }
    }
    else
        sway.addMessage(message);
};

sway.addMessage = function (message){
    sway.alertCount++;
    if (sway.alertCount > sway.config.ui.maxAlerts) return;
    var p = document.createElement('p');
    var t = document.createTextNode(message);
    p.appendChild(t);
    sway.outputPanel.appendChild(p);
};

sway.renderDebugEvent = function (panel, e) {
    var c = this.calibration;
    if (!c) return;
    var o = c.orientation,
        m = c.motion,
        r = c.rotation,
        i = c.motionInterval,
        p = c.position,
        t = sway.templates;

    var output = "<table>";
    if (sway.user) {
        output += t.dataRow('User Id', sway.user.token.uid);
        output += t.dataRow('Channel', sway.user.channel.display || sway.user.channel.name);
        output += t.dataRow('Description', sway.user.channel.description);
    }
    if (c.compassHeading) {
        output += t.dataRow('Compass', c.compassHeading);

    }
    if (o) {
        output += t.dataRow('Corrected', c.correctAlpha);
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
    // position.coords.latitude
    // position.coords.longitude
    // position.coords.accuracy
    // position.coords.altitude
    // position.coords.altitudeAccuracy
    // position.coords.heading
    // position.coords.speed
    if (p) {
        output +=
        t.dataRow('latitude', p.coords.latitude)
        + t.dataRow('longitude', p.coords.longitude)
        + t.dataRow('accuracy', p.coords.accuracy)
            + t.dataRow('altitude', p.coords.altitude)
            + t.dataRow('altitudeAccuracy', p.coords.altitudeAccuracy)
        + t.dataRow('accuracy', p.coords.heading)
        + t.dataRow('altitude', p.coords.speed);
    }
    if (sway.motion.icon) {
        var ic = sway.motion.icon.style;
        output +=
            t.dataRow('Left', ic.left)
            + t.dataRow('Top', ic.top)

    }

    output += "</table>";
    sway.debugPanel.innerHTML = output;
};

window.addEventListener('load', function () {
    var element = document.getElementById('debugPanel');
    if (element) {
        sway.debugPanel = element;
    }
});
