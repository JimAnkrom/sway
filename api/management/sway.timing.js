/**
 * Created by Jim Ankrom on 3/18/2016.
 */

// express api
/*

    /timer
    - post - returns a new timer token
    - put - stops the timer, or updates it

 */
var sway = {},
    express = require('express'),
    bodyParser = require('body-parser');
    //cookieParser = require('cookie-parser');

require('../users/sway.middleware')(sway);

var app = express();

// TODO: This is now in sway.middleware, use that pls
app.use(sway.express.accessControlOptions);
//app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({type: '*/json'}));
app.use(bodyParser.json({type: 'text/plain'}));

timingModule(express, app);

// -----------------------------------------------------------------
// TODO: Move this timing service out to it's own module...
function timingModule(express, app) {
    var timingRouter = express.Router();

    // TODO: verify that this port isn't used
    var api = {
        port: 11100,
        timer: '/timer'
    };

    var timing = {
        errorCode: 418, // I'm a teapot
        middleware: {
            get: function (req, res, next) {
                if (req.query.reset) {
                    timing.middleware.resetAll(req, res, next);
                    next();
                } else {
                    var id = req.id;
                    if (id) {
                        res.status(200).json(timing.controller.timerHistory[id]);
                    } else {
                        // default to just getting history
                        timing.middleware.getHistory(req, res, next);
                    }
                }
            },
            newTimer: function (req, res, next) {
                res.status(200).json(timing.controller.start());
            },
            updateTimer: function (req, res, next) {
                var id = req.body.id,
                    timer;
                if (!id) res.status(timing.errorCode).end();
                if (req.query.stop) {
                    // finalize the timer.
                    timer = timing.controller.stop(id);
                } else {
                    timer = timing.controller.update(id, req.body.reason || 'No Reason Given');
                }
                res.status(200).json(timer);
            },
            resetAll: function (req, res, next) {
                timing.controller.reset();
                next();
            },
            getHistory: function (req, res, next) {
                res.status(200).json(timing.controller.history);
            }
        },
        controller: {
            timers: 0,
            store: {},
            history: [],
            timerHistory: {},
            getTimer: function (id) {
                return this.store[id];
            },
            addHistory: function (timer) {
                var record = JSON.stringify(timer);
                this.history.push(record);
                this.timerHistory[timer.id].push(record);
            },
            start: function () {
                var id = this.timers++;
                var t = {
                    id: id,
                    status: 1,
                    reason: "New timer"
                };
                this.store[id] = t;
                t.stamp = Date.now();
                this.timerHistory[id] = [];
                this.addHistory(t);
                return t;
            },
            update: function (id, reason) {
                var current = Date.now();
                var t = this.getTimer(id);
                t.current = current;
                if (reason) t.note = reason;
                this.addHistory(t);
                return t;
            },
            stop: function (id) {
                var t = this.update(id, "Stopping timer");
                t.status = 0;
                t.end = end;
                return t;
            },
            reset: function () {
                this.timers = 0;
                this.store = {};
                this.history = [];
                this.timerHistory = {};
            }
        }
    };

// Build timing router
// Post returns new timer id
    timingRouter.post(api.timer, timing.middleware.newTimer);
// Put stops the timer or updates it
    timingRouter.put(api.timer, timing.middleware.updateTimer);
// get is just a generic method to sling a few actions at via query
    timingRouter.get(api.timer, timing.middleware.get);

    app.post(api.timer, timingRouter);
    app.put(api.timer, timingRouter);
    app.get(api.timer, timingRouter);

    var port = api.port;

    console.log('Starting Timing Server on port ' + port + '...');

    var httpServer = app.listen(port);

}

