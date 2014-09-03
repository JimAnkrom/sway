/**
 * Created by Jim Ankrom on 8/23/2014.
 *
 * Sway.Server is the server facade which handles request information, authentication/authorization, and administration
 *
 * Sway.Server should manage all tokens and authorization checks
 */
var sway = sway || {};
sway.users = require('./sway.users');
sway.control = require('./sway.control');
sway.authorization = {
    // Auth can be one of the following values:
    queued: 0,
    control: 1,
    calibrate: 10,
    banned: 666,
    get: function (uid) {
        return this.control;
    }
};
sway.userCookie = 'sway.user';

sway.authLayer = {
    // general request from any user
    // authorization is the predicate to check for the correct authorization
    request: function (req, res, authorization, success, failure) {
        if (!(req.body)) return failure(res, 'No Request Submitted!' + JSON.stringify(req.params));
        var auth = req.body.token || req.body.user;
        var cookie = this.getCookie(req);
        //if (!(auth||cookie)) return failure(res, 'No Auth Submitted!');
        if (cookie && cookie.uid) {
            if (auth.uid) {
                if (auth.uid != cookie.uid) {
                    return failure(res, 'UID match failure!');
                }
            } else {
                auth.uid = cookie.uid;
            }
        }
        if (this.authorize(req, res, auth, authorization)) {
            return success(req, res);
        }
        return failure();
    },
    setCookie: function (res, user) {
        res.cookie(sway.userCookie, { uid: user.uid, name: user.name });
    },
    getCookie: function (req) {
        if (req.cookies) {
            var cookie = req.cookies[sway.userCookie];
            //.log(cookie);
            if (cookie)
                return JSON.parse(cookie);
        }
    },
    authorize: function (req, res, auth, authorization) {
        if (authorization(auth))
        {
            return true;
        }
        console.log('Authorize failed!' + JSON.stringify(auth));
    },
    isGuest: function () {
        return true;
    },
    isAdmin: function (user) {
        return user.isAdmin;
    },
    isAuthorizedFor: function (authLevel, auth) {
        if (auth) {
            if (!(auth.value == authLevel)) {
                console.log('Authorization Failed for ' + authLevel + ' ' + JSON.stringify(auth));
                return false;
            }
            return true;
        }
    },
    isControlUser: function (user) {
        return true;
    },
    setUserMessage: function (res, message) {
        console.log(message);
        res.json({ message: message});
    },
    authenticationFailure: function (req, res, token) {
        this.setUserMessage(res, 'Authentication Failed. Token: ' + token);
    },
    authorizationFailure: function (req, res, token) {
        this.setUserMessage(res, 'Authentication Failed. Token: ' + token);
    },
    getAuthorization: function (user) {
        var defaultAuth = "queued";
        if (user) {
            var userList = sway.users.findAll();
            if (user.auth) {
                switch (user.auth.value) {
                    case defaultAuth:
                        if (userList.length == 1) {
                            return this.setAuthorization(user, "control");
                        }
                        // else request control?
                        break;
                    case "banned":
                        return user.auth;
                }
            }
            if (userList.length == 1) {
                return this.setAuthorization(user, "control");
            }
            return this.setAuthorization(user, defaultAuth);
        } else {
            console.log('User Not Found!');
        }
    },
    setAuthorization: function (user, auth) {
        if (user) {
            var auth = {
                uid: user.uid,
                value: auth,
                stamp: Date.now()
            };
            user.auth = auth;
            return auth;
        }
    }
};

module.exports = (function () {

    var auth = sway.authLayer;
    var isAuthControl = auth.isAuthorizedFor.bind(auth, 'control');
    var isAuthCalibrate = auth.isAuthorizedFor.bind(auth, 'calibrate');

    var swayServer = {
        // Admin Services
        findAll: function (req, res) {
            auth.request(req, res, auth.isAdmin, sway.users.findAll, function () {
                auth.authorizationFailure(req, res.body.token);
            });
        },
        reset: function () {
            sway.users.clear();
        },
        // User Services
        createUser: function (req, res) {
            // Check for previous sway cookie?
            var user = req.body;
            if (user && user.uid) {
                return auth.setUserMessage(res, 'User.uid already exists!');
            }
            var cookie = auth.getCookie(req);
            if (cookie) {
                if (cookie.uid) {
                    user.uid = cookie.uid;
                }
            }
            auth.request(req, res, auth.isGuest, function () {
                console.log('Creating User');

                user = sway.users.createUser(req.body);

                var token = auth.getAuthorization(user);
                token.uid = user.uid;
                cookie = {
                    uid: user.uid
                };
                if (user.name) {
                    cookie.name = user.name;
                }
                auth.setCookie(res, cookie);

                res.status(200).json({
                    token: token,
                    user: user
                });
            }, auth.setUserMessage);
            res.end();
        },
        control: function (req, res) {
            var body = req.body;
            if (body.control) {
                auth.request(req, res, isAuthControl, sway.control.control.bind(sway.control, body.control), function () {
                    auth.authorizationFailure(req, res, req.body.token);
                });
            }
            res.end();
        },
        sendOsc: function (req, res) {
            var body = req.body;
            if (body.control) {
                auth.request(req, res, isAuthControl, sway.control.send.bind(sway.control, body.control.address, body.control.value), function () {
                    auth.authorizationFailure(req, res, req.body.token);
                });
            }
            res.end();
        },
        calibrate: function () {
            auth.request(req, res, isAuthCalibrate, sway.control.calibrate, function () {
                auth.authorizationFailure(req, res, req.body.token);
            });
        }
//       ,
//        administrate: function (req, res) {
//            auth.request(req, res, isAuthCalibrate, sway.control.calibrate, function () {
//                auth.authorizationFailure(req, res.body.token);
//            });
//        }
    };

    return swayServer;
}());
