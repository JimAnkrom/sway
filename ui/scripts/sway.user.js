/**
 * Created by Jim Ankrom on 8/16/2014.
 *
 * sway.user is the library which will control client authorization, establish server connections
 *
 * It requires the existence of global a config variable 'sway', which must have a value 'controlUrl'
 */
var sway = sway || {};
// default config. Note that these values can be overwritten at any time by a message from sway
sway.config = {
    "debug": "verbose",
    "url": 'http://192.168.1.200:1333',
    "ui": {
        // maximum alert messages allowed
        "maxAlerts": 10
    },
    "user": {
        // interval, in milliseconds, that motion control messages are sent
        controlInterval: 50,
        // time, in milliseconds, before an idle user times out
        idleTimeout: 10000
    },
    "api": {
        "users": "/users",
        "control": "/control",
        "osc": "/osc",
        "deleteUser": "/delete"
    },
    update: function (config)  {
        if (!config) return;
        if (config.idleTimeout) sway.config.user.idleTimeout = config.idleTimeout;
        if (config.controlInterval) sway.config.user.controlInterval = config.controlInterval;
        if (config.serverUrl) sway.config.url = config.serverUrl;
        if (config.api) sway.config.api = config.api;
    }
};

sway.oninitialized = function () {
    // initialize plugins here or override this
    sway.motion.init();
};
sway.debugPanel = null;
sway.outputPanel = null;
sway.alertCount = 0;
sway.templates = {
    dataRow: function (label, value) {
        return '<tr><td>' + label + '</td><td>' + value + '</td></tr>';
    },
    message: function (message) {
        return '<div>' + message + '</div>';
    }
};
sway.init = function () {
    if (!(sway.config.url)) return sway.debug('sway.config.url is not set!');
    sway.user.authorize();

    sway.outputPanel = document.createElement('div');
    document.body.appendChild(sway.outputPanel);
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

// Sway User Module
sway.user = {
    token: {},
    channel: {},
    user: {},
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

// Sway API calls and utilities
sway.api = {
    // Handles standard Sway Server return messages (non-request specific)
    processResponse: function (data) {
        if (data.redirect) document.location.href = data.redirect;
        if (data.user) sway.user.user = data.user;
        if (data.token) sway.user.token = data.token;
        if (data.channel) sway.user.channel = data.channel;
        if (data.messages) sway.alert(data.messages);

        sway.config.update(data.config);
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
                    }
                    else {
                        sway.alert('Error: Response status ' + http.status + ' returned for ' + http.url);
                        if (options.error) {
                            options.error(http, http.response);
                        }
                        sway.debug('Error: Response status ' + http.status + ' returned for ' + http.url);
                    }
                }
            };
            var message = JSON.stringify(params);

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
    if (sway.user) {
        output += t.dataRow('User Id', sway.user.token.uid);
        output += t.dataRow('Channel', sway.user.channel.display || sway.user.channel.name);
        output += t.dataRow('Description', sway.user.channel.description);
    }
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
    var element = document.getElementById('debugPanel');
    if (element) {
        sway.debugPanel = element;
    }
});
