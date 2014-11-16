/**
 * Created by Jim Ankrom on 8/13/2014.
 * - RESTful API for Sway Server
 */

// Sway Application Code
var sway = sway || {};
sway.core = require('./sway.core');
var config = sway.core.config,
    swayServer = require('./sway.server'),
    swayMonitor = require('./sway.monitor'),
    swayAuth = require('./sway.auth'),
    plugins = require('./sway.plugins'),
    express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser');

// TODO : Add socket.io support
//var server = require('http').Server(app);
//var sockets = require('socket.io')(server);

// TODO: Move to a plugin initialization
plugins.resolumeMotion.init();

// Set all Access-Control headers for CORS OPTIONS preflight
function accessControlOptions (req, res, next) {
    res.header('Access-Control-Allow-Origin', req.headers.origin || "*");
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // respond immediately to OPTIONS preflight request
    if ('OPTIONS' == req.method) {
        res.status(200).end();
    }
    else {
        next();
    }
}

// TODO : improve logging
//function logHeaders (req, res, next) {
//    console.log(req.headers);
//    next();
//}
//if (debug) app.use(logHeaders);

// TODO: Report back on monitor timing
//if (sway.core.debug) swayMonitor.onSampling = function (frame) {
//    console.log("Int: " + JSON.stringify(frame.intervals));
//    console.log("Dur: " + JSON.stringify(frame.durations));
//};


// Sway Middleware
function createUser (req, res, next) {
    swayAuth.createUser.call(swayAuth, req, res, next);
}
function authenticate (req, res, next) {
    swayAuth.authenticate.call(swayAuth, req, res, next);
}
function getMonitor (req, res) {
    var response = {
        samples: swayMonitor.samples
    }
    res.status(200).json(response);
}


/* **********************  Router Config  ********************** */
// Configure express app
var app = express();
app.use(accessControlOptions);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: '*/json' }));
app.use(bodyParser.json({ type: 'text/plain' }));

// For all requests...
app.all('*', function(req, res, next) {
    // TODO: Include this instrumentation
    if (monitor) swayMonitor.takeSample.call(swayMonitor);
    res.set('Content-Type', 'application/json');
    next();
});

// Create user router - must bypass auth routines
var createRouter = express.Router();
createRouter.post(config.api.users, createUser);
createRouter.use(swayServer.updateUserConfig);
createRouter.use(swayServer.finalizeUserResponse);
// map the create user calls to the createRouter
app.post(config.api.users, createRouter);


// TODO: Explicitly add this only to the routers we need authentication on
// authenticate all other requests
app.use(authenticate);

// Router for all user calls
var userRouter = express.Router();
// Authorize these requests as a user
userRouter.use(swayAuth.authUser);
// TODO: check user pulse
//userRouter.post(config.api.heartbeat, swayServer.heartbeat);
// remove users that have timed out
userRouter.post(config.api.deleteUser, swayServer.expire);
// submit control message
userRouter.post(config.api.control, swayServer.control);
// submit mapped osc message
userRouter.post(config.api.mappedOSC, swayServer.sendMapOsc);
// submit osc message
userRouter.post(config.api.OSC, swayServer.sendOsc);
//TODO: Find a good place for this (instrumentation)
//userRouter.use(function () { swayMonitor.currentFrame.setDuration(); });
// short-circuit response if there is no need to send updates back to the client
userRouter.use(swayServer.shortResponse);
// finalize user request
userRouter.use(swayServer.finalizeUserResponse);

// Wire the admin router to api calls
var adminRouter = express.Router();
//adminRouter.use(swayAuth.authAdmin);
// get monitor
//adminRouter.get(config.api.monitor, getMonitor);
// list users
adminRouter.get(config.api.users, swayServer.findAll);
// get user
//adminRouter.get('/users/:id', users.findById);
// update user
// app.put('/users/:id', users.updateUser);
// ban user - blocks all info from their device
//app.delete('/users/:id', users.deleteUser);
// get debug information
//app.get('/debug', control.debug);
adminRouter.use(swayServer.finalizeAdminResponse);

//app.get(config.api.monitor, adminRouter);
// Wire the user router to api calls
//app.post(config.api.heartbeat, userRouter);
app.post(config.api.deleteUser, userRouter);
app.post(config.api.control, userRouter);
app.post(config.api.mappedOSC, userRouter);
app.post(config.api.OSC, userRouter);
// Admin routing
app.get(config.api.users, adminRouter);

console.log('Starting server on port ' + config.local.port + '...');
// TODO when configuration changes, the app should be shut down and restarted
app.listen(config.local.port);
