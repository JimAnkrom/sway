/**
 * Created by Jim Ankrom on 8/16/2014.
 *
 * sway.user is the library which will control client authorization, establish server connections
 *
 * It requires the existence of global a config variable 'sway', which must have a value 'controlUrl'
 */
var sway = sway || {};
sway.oninitialized = null;
sway.init = function () {
    if (!(sway.config.url)) return sway.debug('sway.config.url is not set!');
    sway.user.authorize();
};
sway.debug = function (message) {
    if (console && console.log) {
        console.log(message)
    } else {
        sway.alert(message);
    }
}
sway.alert = function (message) {
    window.alert(message);
}

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

// default config. Note that these values can be overwritten at any time by a message from sway
sway.config = {
    "url": 'http://192.168.1.100:1333',
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
        "delete": "/delete"
    },
    update: function (config)  {
        if (!config) return;
        if (config.idleTimeout) sway.config.user.idleTimeout = config.idleTimeout;
        if (config.controlInterval) sway.config.user.controlInterval = config.controlInterval;
        if (config.serverUrl) sway.config.url = config.serverUrl;
        if (config.api) sway.config.api = config.api;
    }
};

// Sway API calls and utilities
sway.api = {
    processResponse: function (data) {
        if (data.redirect) document.location.href = data.redirect;
        if (data.token) sway.user.user = data.user;
        if (data.token) sway.user.token = data.token;
        if (data.channel) sway.user.channel = data.channel;
        if (data.message) sway.alert(data.message);
        sway.config.update(data.config);
    },
    delete: function (url, params, options) {
        return sway.api.request(url, 'DELETE', params, options);
    },
    get: function (url, params, options) {
        return sway.api.request(url, 'GET', params, options);
    },
    post: function (url, params, options) {
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
            //http.setRequestHeader('Content-type', 'application/json"');
            //http.setRequestHeader("Content-Length", message.length);
            http.send(message);
            return http;
        }
        // because IE5&6 needs to go away
        return sway.debug('You are using a browser that does not support required technology for Sway!');
    }
};
