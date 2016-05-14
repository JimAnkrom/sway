/**
 * Created by Jim Ankrom on 8/13/2014.
 * - RESTful API for Sway Server
 */
module.exports = function (sway) {

// TODO: Abstract all sway app code out of this.

    var express = require('express'),
        bodyParser = require('body-parser'),
        cookieParser = require('cookie-parser');

    /* **********************  Router Config  ********************** */
// Configure express app
    var app = express(),
        // TODO: we need to reload all of this if config changes...
        config = sway.config;

    // Router for all user calls
    var userRouter = express.Router(),
        // Create user router - must bypass auth routines
        createRouter = express.Router(),
        // Wire the admin router to api calls
        adminRouter = express.Router();


// TODO: This is now in sway.middleware
    app.use(sway.express.accessControlOptions);
    app.use(cookieParser());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json({type: '*/json'}));
    app.use(bodyParser.json({type: 'text/plain'}));

    // For all requests...
    app.all('*', sway.monitor.middleware.sample);

    /*
    * CreateUser router
    */
    createRouter.post(config.api.users, sway.auth.createUser);
    createRouter.use(sway.server.updateUserConfig);
    createRouter.use(sway.workflowController.action);
    createRouter.use(sway.server.finalizeUserResponse);
// map the create user calls to the createRouter
    app.post(config.api.users, createRouter);

// TODO: Explicitly add this only to the routers we need authentication on
// authenticate all other requests
    app.use(sway.auth.authenticate);

    /*
    * User Router
    *
    */
// Authorize these requests as a user
    userRouter.use(sway.auth.authUser);
// check user pulse
    userRouter.get(config.api.heartbeat, sway.server.heartbeat);
// remove users that have timed out
    userRouter.post(config.api.deleteUser, sway.server.expire);
// submit control message
    userRouter.post(config.api.control, sway.server.control);
// submit a user action
    userRouter.post(config.api.action, sway.workflowController.action);
// submit mapped osc message
    userRouter.post(config.api.mappedOSC, sway.server.sendMapOsc);
// submit osc message
    userRouter.post(config.api.OSC, sway.server.sendOsc);
//TODO: Find a good place for this (instrumentation)
    //userRouter.use(function () {

        //sway.monitor.currentFrame.setDuration();
    //});
// short-circuit response if there is no need to send updates back to the client
    userRouter.use(sway.server.shortResponse);
// finalize user request
    userRouter.use(sway.server.finalizeUserResponse);

    /*
    *
    * Admin Router
    *
    *
    * */


//adminRouter.use(swayAuth.authAdmin);
// get monitor
//adminRouter.get(config.api.monitor, getMonitor);
// list users
    adminRouter.get(config.api.users, sway.server.findAll);
// get user
//adminRouter.get('/users/:id', users.findById);
// update user
// app.put('/users/:id', users.updateUser);
// ban user - blocks all info from their device
//app.delete('/users/:id', users.deleteUser);
// get debug information
//app.get('/debug', control.debug);
    adminRouter.use(sway.server.finalizeAdminResponse);


//app.get(config.api.monitor, adminRouter);
// Wire the user router to api calls
    app.get(config.api.heartbeat, userRouter);
    app.post(config.api.deleteUser, userRouter);
    app.post(config.api.control, userRouter);

    // TODO: Move to sway.realtime server
    //app.post(config.api.mappedOSC, userRouter);
    //app.post(config.api.OSC, userRouter);

// Admin routing
    app.get(config.api.users, adminRouter);


    var port = config.local.port;
    console.log('Starting server on port ' + port + '...');
    var httpServer = app.listen(port);

};