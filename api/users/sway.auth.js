/**
 * Created by Jim Ankrom on 9/7/2014.
 *
 * Authentication and Authorization Middleware for Sway
 *
 */
//var sway = sway || {};
//sway.users = require('./sway.users');
//sway.channels = require('./sway.channels.js');
//sway.userCookie = 'swayuser';

module.exports = function (sway) {

    function log (message) {
        sway.log(message, 'sway.auth');
    }

    if (!sway.users) log('sway.users not found');
    if (!sway.channels) log('sway.channels not found');
    if (!sway.users.cookie) log('sway.users.cookie is null');

    sway.auth = {
        // Authenticate should validate and retrieve the user
        "authenticate": function (req, res, next) {
            // ensure user is valid
            var auth = req.body.token || req.body.user || {};
            var cookie = sway.auth.getCookie(req);
            //console.log('cookie - ' + JSON.stringify(cookie));
            if (cookie && cookie.uid) {
                if (auth.uid) {
                    if (auth.uid != cookie.uid) {
                        // TODO : When would this be true?
                        sway.auth.setErrorMessage(res, 'UID match failure!');
                    }
                } else {
                    auth.uid = cookie.uid;
                }
            }
            if (req.body.user) {
                // TODO: When should this be true?
                req.body.user.lastLogin = Date.now();
                if (auth.uid != req.body.user.uid) {
                    sway.auth.setErrorMessage(res, 'UID match failure!');
                }
            } else {
                if (auth) {
                    //console.log()
                    // lookup the user and append to the request
                    if (!auth.uid) {
                        sway.auth.setErrorMessage(res, 'Authentication Error: User UID Not Found!');
                        req.runslashdie = true;
                    }
                    else {
                        var user = sway.users.findByUid(auth.uid);
                        if (user) {
                            user.lastLogin = Date.now();
                            req.user = user;
                        } else {
                            req.runslashdie = true;
                            // sway.auth.setErrorMessage(res, 'Authentication Error: User Not Found! Creating new user!');
                            //TODO: res.clearCookie(sway.users.cookie);
                            // TODO: sway.auth.createUser(req, res, next);
                        }
                    }
                }
            }
            next();
        },
        "authAdmin": function (req, res, next) {
            // determine if the user is an admin
            if (req.body && req.body.user && req.body.user.isAdmin) next();
            // FAIL RIGHT NOW
            this.setErrorMessage(res, 'Authentication Failure!');
        },
        // Get auth status & channel, set into body
        "authUser": function (req, res, next) {
            var user = req.user;
            //console.log('authUser');
            // Update the user channel info
            sway.channelControl.update(user);
            next();
        },
        // User Services
        createUser: function (req, res, next) {
            // TODO: leaving this commented and in place for now, not certain if we no longer need or not
//            var user = req.body;
//            if (user && user.uid) {
//                return auth.setUserMessage(res, 'User.uid already exists!');
//            }

            // Check for previous sway cookie
            var cookie = sway.auth.getCookie(req);
            if (cookie) {
                if (cookie.uid) {
                    req.body.token = cookie;
                    var user = sway.users.findByUid(cookie.uid);
                    if (user) {
                        // TODO: Probably want to do something else here rather than a reassign
                        // reassign the user to a new channel
                        sway.channelControl.reassign(user);
                        if (user.channel && user.channel.redirect) {
                            console.log("assigning redirect to req");
                            req.redirect = user.channel.redirect;
                        }
                        req.user = user;
                        req.token = {
                            uid: user.uid,
                            stamp: Date.now()
                        };
                        next();
                        return;
                    }
                }
            }
            // create the user.
            var user = sway.users.createUser(req.body);
            // set user agent... for, like, later.
            user.agent = req.headers['user-agent'];
            // Create our token and add it to req (it's later applied correctly to response)
            req.token = {
                uid: user.uid,
                stamp: Date.now()
            };
            // Yes, re-baking the cookie. For some reason this makes sense.
            cookie = {
                uid: user.uid
            };
            if (user.name) cookie.name = user.name;

            // TODO: Future. Because tracking MAC would be awesome
            //if (user.mac)  cookie.mac = user.mac;

            sway.auth.setCookie(res, cookie);
            sway.channelControl.assign(user);
            if (user.channel) {
                if (user.channel.redirect) {
                    req.redirect = user.channel.redirect;
                }
            }
            req.user = user;
            next();
        },
        setErrorMessage: function (res, message) {
            sway.log('User Error Message: ' + message, 'sway.auth', 6);
            //res.json({message: message});
            //res.end();
        },
        setCookie: function (res, userCookie) {
            res.cookie(sway.users.cookie, userCookie);
            //console.log('Cookie Set: ' + JSON.stringify(userCookie));
        },
        getCookie: function (req) {
            if (req.cookies) {
                var cookie = req.cookies[sway.users.cookie];
                //console.log('Cookie found! ' + JSON.stringify(cookie));
                return cookie;
            }
        }
// ,
//    getAuthorization: function (user) {
//        var defaultAuth = "queued";
//        if (user) {
//            var userList = sway.users.findAll();
//            if (user.auth) {
//                switch (user.auth.value) {
//                    case defaultAuth:
//                        if (userList.length == 1) {
//                            return this.setAuthorization(user, "control");
//                        }
//                        // else request control?
//                        break;
//                    case "banned":
//                        return user.auth;
//                }
//            }
//            if (userList.length == 1) {
//                return this.setAuthorization(user, "control");
//            }
//            return this.setAuthorization(user, defaultAuth);
//        } else {
//            console.log('User Not Found!');
//        }
//    },
//    setAuthorization: function (user, auth) {
//        if (user) {
//            var auth = {
//                uid: user.uid,
//                value: auth,
//                stamp: Date.now()
//            };
//            user.auth = auth;
//            return auth;
//        }
//    }
    };
};