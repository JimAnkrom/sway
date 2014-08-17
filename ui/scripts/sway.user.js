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
        initialized: null,
        init: function () {
            if (sway.controlUrl) {
                this.user.agent = navigator.userAgent;
                this.authorize();
            }
            return sway.user.debug('sway.controlUrl is not set!');
        },
        authorize: function () {
            // post to url/users
            this.get(sway.controlUrl, this.user, {
                    success: function (req, res) {
                        sway.user = res.user;
                        sway.token = res.token;
                        if (sway.initialized) sway.initialized.call(sway, res);
                    }
                }
            );
        },
        get: function (url, params, options) {
            return request(url, 'GET', params, options);
        },
        request: function (url, verb, params, options) {
            if (window.XMLHttpRequest) {
                var http = new XMLHttpRequest();
                http.responseType = options.responseType || "json";
                http.onreadystatechange = function () {
                    if (http.readyState==4) {
                        if (http.status== 200) {
                            if (options.success) { options.success(http, http.response); }
                        }
                        else {
                            if (options.error)
                            {
                                options.error(http, http.response);
                            }
                            sway.debug('Error: Response status ' + http.status + ' returned for ' + http.url);
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
}());
