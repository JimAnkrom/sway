/**
 * Created by Jim Ankrom on 8/13/2014.
 * Two servers in one!
 * - RESTful API for Sway Server
 * - Web Server for Sway Application
 */
var debug = false;
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var swayServer = require('./sway.server');
var swayAuth = require('./sway.auth');
var config = require('./sway.config.json');

var port = config.local.port;
var userPage = 'user.html';
var app = express();

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

if (debug) app.use(logHeaders);

app.use(accessControlOptions);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: '*/json' }));
app.use(bodyParser.json({ type: 'text/plain' }));

app.all('*', function(req, res, next) {
    res.set('Content-Type', 'application/json');
    next();
});

// Sway Middleware
function createUser (res, req, next) {
    swayAuth.createUser.call(swayAuth, res, req, next);
}
function authenticate (res, req, next) {
    swayAuth.authenticate.call(swayAuth, res, req, next);
}


// Create user router - must bypass auth routines
var createRouter = express.Router();
createRouter.post(config.api.users, createUser);
createRouter.use(swayServer.updateUserConfig);
createRouter.use(swayServer.finalizeUserResponse);
// map the create user calls to the createRouter
app.post(config.api.users, createRouter);

// authenticate all other requests
app.use(authenticate);

// Router for all user calls
var userRouter = express.Router();
// Authorize these requests as a user
userRouter.use(swayAuth.authUser);
// remove users that have timed out
userRouter.post(config.api.deleteUser, swayServer.expire);
// submit control message
userRouter.post(config.api.control, swayServer.control);
// submit mapped osc message
userRouter.post(config.api.mappedOSC, swayServer.sendMapOsc);
// submit osc message
userRouter.post(config.api.OSC, swayServer.sendOsc);
// short-circuit response if there is no need to send updates back to the client
userRouter.use(swayServer.shortResponse);
// finalize user request
userRouter.use(swayServer.finalizeUserResponse);

// Wire the user router to api calls
app.post(config.api.deleteUser, userRouter);
app.post(config.api.control, userRouter);
app.post(config.api.mappedOSC, userRouter);
app.post(config.api.OSC, userRouter);

// Wire the admin router to api calls
var adminRouter = express.Router();
adminRouter.use(swayAuth.authAdmin);
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



app.listen(port);
console.log('Server started, listening on port ' + port + '...');