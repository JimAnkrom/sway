/**
 * Created by Jim Ankrom on 8/13/2014.
 * - RESTful API for Sway Server
 */
var debug = false;
var fs = require('fs');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
//var server = require('http').Server(app);
// TODO : Add socket.io support
//var sockets = require('socket.io')(server);
var swayServer = require('./sway.server');
var swayMonitor = require('./sway.monitor');
var swayAuth = require('./sway.auth');
var config = require('./sway.config.json');
// allow passing in port as an override
var port = parseInt(process.argv[2], 10) || config.local.port;
var userPage = 'user.html';

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

function logHeaders (req, res, next) {
    console.log(req.headers);
    next();
}

// TODO : improve logging
//if (debug) app.use(logHeaders);

// TODO: Report back on monitor timing
//swayMonitor.onSampling = function (frame) {
//    console.log("Int: " + JSON.stringify(frame.intervals));
//    console.log("Dur: " + JSON.stringify(frame.durations));
//};

app.use(accessControlOptions);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: '*/json' }));
app.use(bodyParser.json({ type: 'text/plain' }));

// For all requests...
app.all('*', function(req, res, next) {
    // TODO: Include this instrumentation
    //swayMonitor.takeSample.call(swayMonitor);
    res.set('Content-Type', 'application/json');
    next();
});

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
adminRouter.get(config.api.monitor, getMonitor);
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


app.get(config.api.monitor, adminRouter);
// Wire the user router to api calls
app.post(config.api.heartbeat, userRouter);
app.post(config.api.deleteUser, userRouter);
app.post(config.api.control, userRouter);
app.post(config.api.mappedOSC, userRouter);
app.post(config.api.OSC, userRouter);
// Admin routing
app.get(config.api.users, adminRouter);


console.log('Starting server on port ' + port + '...');
app.listen(port);

console.log('Server started, listening on port ' + port + '...');