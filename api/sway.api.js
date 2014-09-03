/**
 * Created by Jim Ankrom on 8/13/2014.
 * Two servers in one!
 * - RESTful API for Sway Server
 * - Web Server for Sway Application
 */

var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var swayServer = require('./sway.server');

var port = 1333;
var userPage = 'user.html';

var swayUserCookie = "swayuser";

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: '*/json' }));
app.use(bodyParser.json({ type: 'text/plain' }));

app.all('*', function(req, res, next) {
    res.set('Content-Type', 'application/json');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

// Application Server



// list users
app.get('/users', swayServer.findAll);
// get user
//app.get('/users/:id', users.findById);
// create user
app.post('/users', swayServer.createUser);

// update user
// app.put('/users/:id', users.updateUser);
// ban user - blocks all info from their device
//app.delete('/users/:id', users.deleteUser);

// submit osc message
app.post('/osc', swayServer.sendOsc);
// submit control message
app.post('/control', swayServer.control);
// get debug information
//app.get('/debug', control.debug);

app.listen(port);
console.log('Server started, listening on port ' + port + '...');