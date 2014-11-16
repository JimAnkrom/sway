/**
 * Created by Jim Ankrom on 10/28/2014.
 * Configuration manager class featuring config file monitoring, load and reload methods
 */

// Hot-swappable configuration class
function Configuration () {
    var fs = require('fs'),
        self = this,
        watchers = {};

    this.load = function (configName, path, options) {

        try {
            var contents = fs.readFileSync(path, 'utf8');
            var config = JSON.parse(contents);
            // add the configuration file as a property to the configuration instance
            self[configName] = config;
            // call onLoad event handler
            if (options && options.onload) options.onload(configName, config);
            // create reload convenience method
            config.reload = self.load.bind(self, configName, path, options);
        }
        catch(err) {
            if (core.debug)
                console.log(err.message);
        }

        if (!watchers[configName]) {
            watchers[configName] = fs.watch(path, { persistent: true }, function (event, filename) {
                if (event == 'change') {
                    self.load(configName, filename, options);
                    if (core.debug) console.log(filename + " reloaded due to " + event + " event");
                }
            });
        }
    };
}

// Load sway configurations
var core = new Configuration();
core.debug = true; // default to true, overwrite with config
core.load('environment', './sway.env.json', { onload: function (configName, config) {
    core.debug = config.debug;
    // load or reload other configurations
    var envPath = core.environment.path;
    // load custom configurations from environment folders
    core.load('config', envPath + 'sway.config.json');
    core.load('channels', envPath + 'sway.config.json');
}});

// return the core module
module.exports = core;