/**
 * Created by Jim Ankrom on 10/28/2014.
 * Configuration manager class featuring config file monitoring, load and reload methods
 */

// Multicast Callback - refactor out to a utility library
// TODO Future versions of this should return a function that when called executes the multicast without calling invoke
function multicast(callback) {
    var self = this,
        multicast = [];

    if (callback) multicast.push(callback);

    function invoke (thisArg) {
        if (!thisArg) thisArg = self;
        for (var i = 0; i < multicast.length; i++) {
            multicast[i].apply(thisArg, arguments);
        }
    }

    function add (callback) {
        multicast.push(callback);
    }

    invoke.add = add;

    return invoke;
}

// Hot-swappable configuration class
function Configuration () {
    var fs = require('fs'),
        self = this,
        watchers = {},
        handlers = {};

    this.load = function (configName, path, options) {
        //if (core.debug)
        //    console.log('Configuration.Load(' + configName + '): Begin');
        try {
            var contents = fs.readFileSync(path, 'utf8');
            var config = JSON.parse(contents);
            var eventHandlers = handlers[configName];

            // add the configuration file as a property to the configuration instance
            self[configName] = config;

            // call onLoad event handler
            if (options && options.onload) options.onload(configName, config);
            if (eventHandlers && eventHandlers.onload) eventHandlers.onload(self, configName, config);

            // create reload convenience method
            config.reload = self.load.bind(self, configName, path, options);
        }
        catch(err) {
            if (core.debug)
                console.log('Error: Configuration.Load(' + configName + '): ' + err.message);
        }

        if (!watchers[configName]) {
            watchers[configName] = fs.watch(path, { persistent: true }, function (event, filename) {
                if (event == 'change') {
                    self.load(configName, path, options);
                    if (core.debug) console.log(filename + ' reloaded due to ' + event + ' event on file ' + filename);
                }
            });
        }
    };

    this.attach = function (configName, options) {
        // for each item in options
        var keys = Object.keys(options);
        for (var i=0; i < keys.length; i++)
        {
            var key = keys[i];
            var eventHandlers = handlers[configName];
            if (!eventHandlers) {
                eventHandlers = {};
                handlers[configName] = eventHandlers;
            }
            var handler = eventHandlers[key];
            if (handler) {
                handler.add(options[key]);
            } else {
                eventHandlers[key] = new multicast(options[key]);
            }
        }
    }
}

// Load sway configurations
var core = new Configuration();
core.debug = true; // default to true, overwrite with config
// attach environment onload (must be done before initial load
core.attach('environment', {
    onload: function (configName, config) {
        core.debug = config.debug;
        // load or reload other configurations
        var envPath = core.environment.path;
        // load custom configurations from environment folders
        core.load('config', envPath + 'sway.config.json');
        core.load('channels', envPath + 'sway.channels.json');
    }
});
// load environment
core.load('environment', './sway.env.json');

// return the core module
module.exports = core;