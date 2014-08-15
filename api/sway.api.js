/**
 * Created by cosinezero on 8/13/2014.
 *
 * RESTful API for Sway Server
 *
 */

var express = require('express');
var users = require('./sway.users');
var control = require('./sway.control');
var app = express();

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

app.listen(81334);
console.log('Server started, listening on port 81334...');