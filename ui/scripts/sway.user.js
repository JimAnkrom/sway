/**
 * Created by Jim Ankrom on 8/16/2014.
 *
 * sway.user is the library which will control client authorization, establish server connections
 *
 * It requires the existence of global a config variable 'sway', which must have a value 'controlUrl'
 */
//var sway = sway || {test: true};
sway.serverUrl = 'http://192.168.1.100:1333';
(function () {
    sway.user = {
        token: {},
        channel: {},
        user: {},
        oninitialized: null,
        init: function () {
            if (!(sway.serverUrl)) return sway.user.debug('sway.controlUrl is not set!');
            this.authorize();
        },
        authorize: function (callback) {
            // post to url/users
            this.post(sway.serverUrl + "/users", sway.user.user, {
                    success: function (req, res) {
                        sway.user.token = res.token;
                        sway.user.channel = res.channel;
                        //alert('Authorized! - ' + JSON.stringify(res.channel));
                        if (callback) callback.call(sway, res);
                        if (sway.user.oninitialized) sway.user.oninitialized.call(sway, res);
                    },
                    error: function (err, res) {
                        alert('error ' + JSON.stringify(err));
                    }
                }
            );
        },
        get: function (url, params, options) {
            return this.request(url, 'GET', params, options);
        },
        post: function (url, params, options) {
            return this.request(url, 'POST', params, options);
        },
        request: function (url, verb, params, options) {
            var ooptions = options || {};
            if (window.XMLHttpRequest) {
                var http = new XMLHttpRequest();
                options.responseType = options.responseType || "json";
                if (http.responseType) http.responseType = options.responseType;

                http.onreadystatechange = function () {
                    if (http.readyState==4) {
                        if (http.status==200) {
                            var response;
                            if (options.success) {
                                if (!http.responseType) {
                                    if (options.responseType == 'json') {
                                        response = JSON.parse(http.responseText);
                                    } else {
                                        response = http.responseText;
                                    }
                                }
                                options.success(http, response);
                            }
                        }
                        else {
                            alert('Error: Response status ' + http.status + ' returned for ' + http.url);
                            if (options.error) {
                                options.error(http, http.response);
                            }
                            sway.user.debug('Error: Response status ' + http.status + ' returned for ' + http.url);
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
            return sway.user.debug('You are using a browser that does not support required technology for Sway!');
        },
        debug: function (message) {
            if (console && console.log) {
                console.log(message)
            } else {
                alert(message);
            }
        }
    };
    return sway.user;
}());
