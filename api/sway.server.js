/**
 * Created by Jim Ankrom on 8/23/2014.
 *
 * Sway.Server is the server facade which handles request information, authentication/authorization, and administration
 *
 * Sway.Server should manage all tokens and authorization checks
 */

var sway = sway || {};
sway.users = require('./sway.users');
sway.channel = require('./sway.channels');
sway.control = require('./sway.control');
sway.config = require('./sway.config.json');

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
        // Middleware to complete the response format and send it
        finalizeUserResponse: function (req, res) {
            // TODO: Fill in all channel info
            var chan = req.user.channel || {};

            var response = {
                token: req.token,
                channel: {
                    name: chan.name,
                    description: chan.description,
                    helpUrl: chan.helpUrl,
                    url: chan.url,
                    ip: chan.ip
                }
            };
            // in case we want to pass some config back to the user.
            if (req.config) response.config = req.config;

            res.status(200).json(response);
            // TODO : Is this res.end necessary?
            res.end();
        },

        control: function (req, res) {
            var body = req.body;
            var channel = req.user.channel;
            if (channel && body.control) {
                sway.control.control(channel, body.control);
            }
            res.end();
        },
        sendMapOsc: function (req, res) {
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

            res.end();
        },
        sendOsc: function (req, res) {
            var body = req.body;
            if (body.control) {
                sway.control.send(body.control.address, body.control.value);
            } else {
                console.log('body.control was null');
            }

            res.end();
        },
        calibrate: function () {
            sway.control.calibrate();
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
