/**
 * Created by Jim Ankrom on 2/20/2016.
 *
 * Main entry point for Sway User Services app
 */
var moduleName = 'sway.app',
    sway = require('./../core/sway.core.js'),
    toolbox = require('../lib/toolbox.node.js');

// add sway.server namespace
require('./sway.server.js')(sway);

// Validation
if (!Object.assign) sway.log('Critical Error: Object.assign does not exist! Try a newer version of node.js.', moduleName, 10);
if (!toolbox) sway.log('toolbox not found', moduleName, 10);
//if (!toolbox.observe) sway.log('observe not found', 'toolbox');
if (!sway.workflowController) sway.log('Critical Error: WorkflowController not found!', moduleName, 10);


var config = sway.core.config;

// TODO: Move to a plugin initialization
sway.plugins.realtime.init();

// Wire up the sway API
require('./sway.api.js')(sway);

