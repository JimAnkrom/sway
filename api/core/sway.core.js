/**
 * Created by Jim Ankrom on 10/28/2014.
 * Create sway and core namespaces
 */

// TODO: refactor utility out to toolbox and others
var utils = require('./sway.utility.js');

var path = require('path');

var sway = {
    core: new utils.Configuration({ debug: true }),
    // default debug to true, overwrite with config
    // TODO: refactor log out to toolbox
    log: function (message, moduleName) {
        moduleName = moduleName || 'no module given';
        if (console) {
            console.log('[' + moduleName + '] - ' + message);
        }
    },
    utility: utils
};

//var cwd = process.cwd();

// Initialize configurations
((core) => {
    // attach environment onload (must be done before initial load
    core.attach('environment', {
        onload: function (configName, config) {
            core.debug = config.debug;
            // load or reload other configurations
            var envPath = path.join(process.cwd(), core.environment.path);
            // load custom configurations from environment folders
            core.load('config', envPath + 'sway.config.json');
            core.load('channels', envPath + 'sway.channels.json');
        }
    });
    // load environment configuration
    core.load('environment', path.join(process.cwd(), 'env/sway.env.json'));

    // TODO: This requires httpServer - doesn't this belong in server?
// When configuration changes, the app should be shut down and restarted
core.attach('config', {
    onload: function () {
        config = core.config;
        if (port != config.local.port) {
            if (core.debug) console.log('Closing server on port ' + port);
            port = config.local.port;
            try {
                httpServer.close();
            }
            catch (err) {
                if (core.debug) console.log('Error: Configuration.onload(config): ' + err.message);
            }
            app.listen(port);
            if (core.debug) console.log('Server restarted on port ' + port + '...');
        }
    }
});

})(sway.core);

require('./../users/sway.channels.js')(sway);
require('./../realtime/sway.control.js')(sway);
require('./../users/sway.users.js')(sway);
require('./../realtime/sway.osc.js')(sway);
require('./../plugins/sway.plugins.js')(sway);

//// TODO: maybe this need be set by sway.user?
//sway.userCookie = 'sway.user';
require('./../users/sway.auth.js')(sway);

// TODO: Report back on monitor timing
if (sway.core.debug) sway.monitor.onSampling = function (frame) {
    console.log("Int: " + JSON.stringify(frame.intervals));
    console.log("Dur: " + JSON.stringify(frame.durations));
};


if (module) module.exports = sway;