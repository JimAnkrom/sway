/**
 * Created by Jim Ankrom on 8/13/2014.
 * Two servers in one!
 * - RESTful API for Sway Server
 * - Web Server for Sway Application
 */

var fs = require('fs');
var express = require('express');
var users = require('./sway.users');
var control = require('./sway.control');

var port = 81334;
var userPage = 'user.html';

var app = express();

// Application Server

// list users
app.get('/users', users.findAll);
// get user
app.get('/users/:id', users.findById);
// create user
app.post('/users', users.addUser);

// update user
// app.put('/users/:id', users.updateUser);
// ban user - blocks all info from their device
//app.delete('/users/:id', users.deleteUser);

// submit control message
app.post('/control', control.control);
// get debug information
app.get('/debug', control.debug);

app.listen(port);
console.log('Server started, listening on port ' + port + '...');