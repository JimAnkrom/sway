/**
 * Created by Jim Ankrom on 11/26/2014.
 * handle various events, provide wire-up points for events.

 TODO: WebRTC support
 TODO: Deprecate sway.utility in favor of toolbox
 TODO: Establish a heartbeat connection
 */

var debug = true;
var utils = require('./../core/sway.utility.js');
var engine = require('engine.io');

var sway = require('./../core/sway.core.js');
//    toolbox = require('../../../toolbox/dist/toolbox.node.js');

console.log('Starting socket engine at port 3000');
var server = engine.listen(3000);

var decorator = {
    onMessage: new utils.Multicast(function (data) {
        if (!data) return;
        var values = data.split('|');
        var chan = values[0];
        // TODO: look up channel, plugins, etc.
        if (chan) {
            var channel = sway.core.channels[chan];
            var plugin = channel[channel.plugin];
            // installation port & address need to be added
            Object.assign(plugin.output, sway.core.installation.output);
        }

        // TODO: get config from core
        // TODO: refactor this so that we're calling orientation for orientation
        // send OSC
        //vissom.orientation(plugin.output, data.orientation);
        vissom.orientation(plugin, values[1], values[2], values[3]);
        sway.log('Message received ' + values[1] + ' ' + values[2], 'realtime');
    }),
    onPing: new utils.Multicast(),
    onPacket: new utils.Multicast(function (packet) {
        if (packet.type == 'ping') {
            decorator.onPing(packet.data);
        } else {
            decorator.onMessage(packet.data);
        }
    }),
    onConnect: new utils.Multicast(function (socket) {
        socket.on('packet', decorator.onPacket);
    })
};

// TODO: REFACTOR TO NEW LIBRARY -----------------------------
var vissom = {
    orientation: function (config, x, y, z) {
        var output = config.output;
        var oConfig = config.orientation;
        // position /p#/posx , /p#/posy
        //sway.osc.send(config, '/p' + config.id + '/posx', x);
        //sway.osc.send(config, '/p' + config.id + '/posy', y);
        //sway.osc.send(config, '/p3/posy', y);
        //''
        var value = Number(x);
        if (!isNaN(value)) {
            sway.osc.send(output, output.addressPrefix + oConfig.alpha.address, value);
            //sway.osc.send(config, '/layer1/video/opacity/values', value);
        }
        value = Number(y);
        if (!isNaN(value)) {
            sway.osc.send(output, output.addressPrefix + oConfig.beta.address, value);
            //sway.osc.send(config, '/layer1/video/opacity/values', value);
        }
    }
};

// TODO: not yet used
//var outputPlugins = {
//    "vissom": {
//        "orientation": vissom.orientation
//    }
//};
// TODO: END REFACTOR TO NEW LIBRARY --------------------------

// Wire up connection event
server.on('connection', decorator.onConnect);

// Add the onMessage handler
//    decorator.onMessage.add(function (data) {
//        if (!data) return;
//        var values = data.split('|');
//        var chan = values[0];
//        // TODO: look up channel, plugins, etc.
//        if (chan) {
//            var channel = sway.core.channels[chan];
//            var plugin = channel[channel.plugin];
//            // installation port & address need to be added
//            Object.assign(plugin.output, sway.core.installation.output);
//        }
//
//        // TODO: get config from core
//        // TODO: refactor this so that we're calling orientation for orientation
//        // send OSC
//        //vissom.orientation(plugin.output, data.orientation);
//        vissom.orientation(plugin, values[1], values[2], values[3]);
//        sway.log('Message received ' + values[1] + ' ' + values[2], 'realtime');
//    });

// TODO: add message to sway.plugins.output

module.exports = decorator;
