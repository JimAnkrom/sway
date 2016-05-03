/**
 * Created by Jim Ankrom on 8/23/2014.
 *
 * Sway.Server is the server facade which handles request information, authentication/authorization, and administration
 *
 * Sway.Server should manage all tokens and authorization checks
 */


var debug = false;
var _ = require('underscore');

module.exports = function (sway) {
    //var auth = sway.authLayer;

    // TODO: all sway references should be handled elsewhere.
    require('./sway.middleware.js')(sway);
    require('./sway.workflow.js')(sway);
    require('./sway.monitor.js')(sway);

    // reload config references on change
    sway.core.attach('config', {
        onload: function () {
            sway.config = sway.core.config;
        }
    });

// TODO: convert this to a multicast approach instead of just set handler
    sway.users.onExpireUserBatch = function (batch) {

    };

    // SwayServer is the general business layer for sway
    var swayServer = sway.server = {
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
        heartbeat: function (req, res, next) {
            // TODO: make this do... something?
            // should renew a user's last used, or something, so we can scavenge for unused space in channels
            next();
        },
        // Called "expire" because delete is a keyword
        expire: function (req, res, next) {
            console.log("Removing user " + req.user.uid + " from channel " + req.user.channel.name);
            // TODO: used to be 'sway.channels'
            sway.channelControl.remove(req.user.channel, req.user);
            req.message = sway.config.messages.expirationMessage;
            next();
        },
        finalizeAdminResponse: function (req, res) {
            var response = {
                // TODO: ?? ?? ??
            };
            // return our response
            res.status(200).json(response);
        },
        // Middleware to complete the response format and send it
        finalizeUserResponse: function (req, res) {
            var user = req.user,
                response = {
                token: req.token
            },
                chan,
                config;

            //reset this now because we're sending the user out
            user.changed = false;

            // Add workflow state
            if (user) response.state = user.state;

            chan = user.channel || {};
            if (chan.name) {
                response.channel = {
                    name: chan.name,
                    display: chan.displayName,
                    description: chan.description,
                    userCount: chan.users.length,
                    helpUrl: chan.helpUrl,
                    url: chan.url,
                    ip: chan.ip
                };

                if (chan.plugin) {
                    // build the user plugin config
                    response.channel.plugin = chan.plugin;
                    var channelPlugin = chan[chan.plugin];

                    var insConf = sway.core.installation;

                    // Merge installation info into input/output
                    Object.assign(channelPlugin.input, insConf.input);
                    Object.assign(channelPlugin.output, insConf.output);

                    // TODO: Copy from an installation-level into orientation et al
                    // TODO: Need a deep copy for that tho

                    response.channel[chan.plugin] = channelPlugin;
                }
            } else {
                if (user.queue) {
                    response.queue = user.queue;
                }
            }

            // add user messages
            swayServer.addMessages(user.message, response);
            // add system messages
            swayServer.addMessages(req.message, response);

            // in case we want to pass some config back to the user.
            // if it's attached to req.user.config, it means a system update
            config = req.user.config;
            if (config) {
                req.user.config = null;
            } else {
                config = req.config;
            }
            if (config) response.config = config;

            //Add redirects if necessary
            if (req.redirect) {
                //console.log('Redirect: ' + req.redirect);
                response.redirect = req.redirect;
            }

            // return our response
            res.status(200).json(response);
        },
        updateUserConfig: function (req, res, next) {
            req.config = {
                idleTimeout: sway.config.user.idleTimeout,
                controlInterval: sway.config.user.controlInterval,
                api: sway.config.api,
                screen: sway.core.installation.screen
            };
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
                (req.user && req.user.changed)
                || req.message
                || req.config
                || req.redirect
                ) { next(); }
            res.end();
        },
        control: function (req, res, next) {
            if (debug) console.log('Server.control');
            var body = req.body;
            if (req.user) {
                var channel = req.user.channel;
                if (channel && body.control) {

                    sway.control.control(channel, body.control);
                }
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
};
