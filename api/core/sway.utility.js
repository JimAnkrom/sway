/**
 * Created by Jim Ankrom on 11/30/2014.
 */

// Multicast Callback
// TODO: Deprecate this in favor of toolbox
function Multicast(callback) {
    var self = this,
        multicast = [];

    if (callback) multicast.push(callback);

    function invoke () {
        for (var i = 0; i < multicast.length; i++) {
            multicast[i].apply(self, arguments);
        }
    }

    function add (callback) {
        multicast.push(callback);
    }

    invoke.add = add;

    return invoke;
}

/*
    Hot-swappable configuration class.
    Requires Multicast
 */
// TODO: Move this to toolbox
function Configuration (options) {
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
            // TODO Need reload - do NOT ATTACH to the config file! BAD! VERY BAD!
            // config.reload = self.load.bind(self, configName, path, options);
        }
        catch(err) {
            if (sway && sway.core && sway.core.log) sway.core.log('Error: Configuration.Load(' + configName + '): ' + err.message, 'Configuration');
        }

        if (!watchers[configName]) {
            try {
                watchers[configName] = fs.watch(path, {persistent: true}, function (event, filename) {
                    if (event == 'change') {
                        self.load(configName, path, options);
                        if (sway && sway.core && sway.core.log) sway.core.log(filename + ' reloaded due to ' + event + ' event on file ' + filename, 'Configuration');
                    }
                });
            } catch (err)
            {
                if (sway && sway.core && sway.core.log) sway.core.log('Error: Exception while watching configuration: ' + filename + ' - ' + err.message, 'Configuration');
            }
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
                eventHandlers[key] = new Multicast(options[key]);
            }
        }
    }
}

// TODO: move to toolbox
// Iterate over each element in array, and execute callback for them
function each (items, callback, short) {
    var i, item, len, key, keys, result,
        objectType = typeof items;

    if (!items) return;

    if (objectType == "function" || objectType == "object") {
        isFunction = true;
        keys = Object.keys(items);
        len = keys.length;
    }

    len = len || items.length;
    for (i = 0; i < len; i++) {
        key = i;
        if (keys) key = keys[i];
        item = items[key];
        result = callback(item, i, key);
        if (short && result) return item;
    }
}

// Module Support

var utils = {
    each: each,
    Multicast: Multicast,
    Configuration: Configuration
};
module.exports = utils;