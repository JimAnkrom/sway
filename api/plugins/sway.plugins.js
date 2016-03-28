/**
 * Created by Jim Ankrom on 10/21/2014.
 *
 * Plugins should hold a number of example and OOTB configurations
 *
 */

module.exports = function (sway) {
    function log(message) {
        sway.core.log(message, 'sway.plugins');
    }

    // verify dependencies
    if (!sway.channelControl) log('sway.channelControl not found');
    if (!sway.osc) log('sway.userCookie is null');

    // TODO: do we want this to initialize now?
    sway.osc.open();

    sway.plugins = {};
    sway.plugins.getPluginConfig = function (channel) {
        var pluginConfig = channel[this.name];
        return pluginConfig;
    };
    sway.plugins.activatePlugins = function (pluginConfig, plugins) {
        var keys = Object.keys(plugins);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var config = pluginConfig[key];
            if (config) {
                var plugin = plugins[key];
                if (plugin) plugin(config);
            }
        }
    };

    sway.plugins.realtime = {
        name: "realtime",
        init: function () {
            // TODO: Why? Why are we doing this?
            sway.channelControl.onEnqueue = sway.plugins.realtime.handleOnEnqueue;
            sway.channelControl.onDequeue = sway.plugins.realtime.handleOnDequeue;
        },
        handleOnEnqueue: function (user, channel) {
            console.log('OnEnqueue raised');
            // This line fails to get config sometimes
            var config = sway.plugins.getPluginConfig.call(sway.plugins.realtime, channel);

            if (config && config.enqueue) {
                // iterate over output plugins and pass them the config
                sway.plugins.activatePlugins(config.enqueue, sway.plugins.output);
            } else {
                if (!config) console.log('handleOnEnqueue failed: no config available for channel ' + channel.name);
            }
        },
        handleOnDequeue: function (user, channel) {
            console.log('OnDequeue raised');
            var config = sway.plugins.getPluginConfig.call(sway.plugins.realtime, channel);

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

};
