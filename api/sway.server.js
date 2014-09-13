/**
 * Created by Jim Ankrom on 8/23/2014.
 *
 * Sway.Server is the server facade which handles request information, authentication/authorization, and administration
 *
 * Sway.Server should manage all tokens and authorization checks
 */

var sway = sway || {};
sway.users = require('./sway.users');
sway.channels = require('./sway.channels');
sway.control = require('./sway.control');
sway.config = require('./sway.config.json');

var _ = require('underscore');

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

module.exports = (function () {
    var auth = sway.authLayer;

    var swayServer = {
        // Admin Services
        findAll: function (req, res) {
            var users = sway.users.findAll();
            res.status(200).json({
                users: users
            });
            res.end();
        },
        reset: function () {
            sway.users.clear();
        },
        expire: function (req, res, next) {
            console.log("Removing user " + req.user.uid + " from channel " + req.user.channel.name);
            sway.channels.remove(req.user.channel, req.user);
            req.message = sway.config.messages.expirationMessage;
            next();
        },
        // Middleware to complete the response format and send it
        finalizeUserResponse: function (req, res) {
            var response = {
                token: req.token
            };
            var chan = req.user.channel || {};
            if (chan.name) {
                response.channel = {
                    name: chan.name,
                    description: chan.description,
                    helpUrl: chan.helpUrl,
                    url: chan.url,
                    ip: chan.ip
                };
            }
            swayServer.addMessages(req.user.message, response);
            swayServer.addMessages(req.message, response);

            // in case we want to pass some config back to the user.
            // if it's attached to req.user.config, it means a system update
            var config = req.user.config;
            if (config) {
                req.user.config = null;
            } else {
                config = req.config;
            }
            if (config) response.config = config;

            // return our response
            res.status(200).json(response);
        },
        updateUserConfig: function (req, res, next) {
            req.config = {
                idleTimeout: sway.config.user.idleTimeout,
                controlInterval: sway.config.user.controlInterval,
                api: sway.config.api
            }
            next();
        },
        addMessages: function (messages, response) {
            if (messages) {
                response.messages = response.messages || [];
                if (messages.isArray && messages.isArray()) {
                    _.union(response.messages, messages);
                } else {
                    response.messages.push(messages);
                }
            }
        },
        // shortcircuit the response IF you don't have a message, config update, or redirect, otherwise next()
        shortResponse: function (req, res, next) {
            if (
                req.message
                || req.config
                || req.redirect
                ) { next(); }
            res.end();
        },
        control: function (req, res, next) {
            var body = req.body;
            var channel = req.user.channel;
            if (channel && body.control) {
                sway.control.control(channel, body.control);
            }
            next();
        },
        sendMapOsc: function (req, res, next) {
            var body = req.body;
            var map = body.map;
            if (map) {
                // { channel, address, value }
                var channelConfig = sway.config[map.channel];
                var address = channelConfig[map.address];

                sway.control.send(address, map.value);
            } else {
                console.log('body.control was null');
            }
        },
        sendOsc: function (req, res, next) {
            var body = req.body;
            if (body.control) {
                sway.control.send(body.control.address, body.control.value);
            } else {
                console.log('body.control was null');
            }
            next();
        },
        calibrate: function (req, res, next) {
            sway.control.calibrate();
            next();
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
