/**
 * Created by Jim Ankrom on 10/21/2014.
 *
 * Plugins should hold a number of example and OOTB configurations
 *
 */

var sway = sway || {};
sway.channels = require('./sway.channels');
sway.osc = require('./sway.osc');
sway.osc.open();

sway.plugins = {};
sway.plugins.getPluginConfig = function (channel) {
    var pluginConfig = channel[this.name];
    return pluginConfig;
};
sway.plugins.activatePlugins = function (pluginConfig, plugins) {
    var keys = Object.keys(plugins);
    for (var i=0; i<keys.length; i++) {
        var key = keys[i];
        var config = pluginConfig[key];
        if (config) {
            var plugin = plugins[key];
            if (plugin) plugin(config);
        }
    }
};

sway.plugins.resolumeMotion = {
    name: "resolumeMotion",
    init: function () {
        sway.channels.onEnqueue = sway.plugins.resolumeMotion.handleOnEnqueue;
        sway.channels.onDequeue = sway.plugins.resolumeMotion.handleOnDequeue;
    },
    handleOnEnqueue: function (user, channel) {
        var config = sway.plugins.getPluginConfig.call(sway.plugins.resolumeMotion, channel);

        if (config.enqueue)
        // iterate over output plugins and pass them the config
        sway.plugins.activatePlugins(config.enqueue, sway.plugins.output);
    },
    handleOnDequeue: function (user, channel) {
        var config = sway.plugins.getPluginConfig.call(sway.plugins.resolumeMotion, channel);

        if (config.dequeue)
        // iterate over output plugins and pass them the config
            sway.plugins.activatePlugins(config.dequeue, sway.plugins.output);
    }
};

sway.plugins.output = {
    osc: function (config) {
        sway.osc.sendToAddress(config.ipaddress, config.port, config.address, config.value);
    }
};

// Module support
if (module) module.exports = sway.plugins;