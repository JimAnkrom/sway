/**
 * Created by Jim Ankrom on 2/20/2016.
 *
 * Main entry point for Sway User Services app
 */
var sway = require('./../core/sway.core.js'),
    toolbox = require('../lib/toolbox.node.js');

    if (!Object.assign) console.log('Critical Error: Object.assign does not exist! Try a newer version of node.js.');
    if (!toolbox) sway.log('toolbox not found', 'toolbox');
    if (!toolbox.observe) sway.log('observe not found', 'toolbox');

var config = sway.core.config;

// TODO: Move to a plugin initialization
sway.plugins.realtime.init();

// TODO: moving this to realtime server
//var realtime = require('./realtime/sway.realtime.js');

// add sway.server namespace
require('./sway.server.js')(sway);

if (!sway.workflow) sway.log('Critical Error: Workflow not found!', 'Workflow');
// TODO: Wire up the sway API
require('./sway.api.js')(sway);

