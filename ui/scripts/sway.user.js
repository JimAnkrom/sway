/**
 * Created by Jim Ankrom on 8/16/2014.
 *
 * sway.user is the library which will control client authorization, establish server connections
 *
 * It requires the existence of global a config variable 'sway', which must have a value 'controlUrl'
 */
var sway = sway || {test: true};

(function () {
    sway.user = {
        token: {},
        user: {},
        oninitialized: null,
        init: function () {
            if (!(sway.serverUrl)) return sway.user.debug('sway.controlUrl is not set!');
            this.user.agent = navigator.userAgent;
            this.authorize();
        },
        authorize: function (callback) {
            // post to url/users
            this.post(sway.serverUrl + "/users", this.user, {
                    success: function (req, res) {
                        sway.user.user = res.user;
                        sway.user.token = res.token;
                        if (callback)
                        { callback.call(sway, res); }
                        if (sway.user.oninitialized)  {
                            sway.user.oninitialized.call(sway, res);
                        }
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
                if (http.responseType) {
                    http.responseType = options.responseType;
                }
                http.onreadystatechange = function () {
                    if (http.readyState==4) {
                        if (http.status== 200) {
                            if (options.success) {
                                if (!http.responseType)
                                {
                                    if (options.responseType == 'json')
                                    {
                                        http.response = JSON.parse(http.responseText);
                                    } else {
                                        http.response = http.responseText;
                                    }
                                }
                                options.success(http, http.response);
                            }
                        }
                        else {
                            if (options.error)
                            {
                                options.error(http, http.response);
                            }
                            sway.user.debug('Error: Response status ' + http.status + ' returned for ' + http.url);
                        }
                    }
                };
                http.open(verb, url, true);
                http.send();
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
