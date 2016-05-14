/**
 * Created by Jim Ankrom on 11/26/2014.
 * handle various events, provide wire-up points for events.

 TODO: WebRTC support
 TODO: Deprecate sway.utility in favor of toolbox
 TODO: Establish a heartbeat connection
 */

var debug = true,
    useEngineIO = false,
    utils = require('./../core/sway.utility.js'),
    engine = require('engine.io'),
    sway = require('./../core/sway.core.js'),
    ws = require('ws');

require('./sway.control.js')(sway);
require('./sway.osc.js')(sway);

var vissom = require('./vissom.realtime')(sway);

sway.core.debug = debug;
//    toolbox = require('../../../toolbox/dist/toolbox.node.js');
sway.osc.open();

console.log('Starting socket engine at port 3000');
var server;

if (useEngineIO) {
    server = engine.listen(3000);
    // Wire up connection event
    server.on('connection', decorator.onConnect);
}


var decorator = {
    onMessage: new utils.Multicast(function (data) {
        if (!data) return;
        // console.log('message received ' + data);
        var value1,
            values = data.split('|');
        var chan = values[0];
        // TODO: look up channel, plugins, etc.
        if (chan) {
            var channel = sway.core.channels[chan];
            if (!channel) {
                console.log('Channel not found: ' + chan);
            }
            var plugin = channel[channel.plugin];
            // installation port & address need to be added
            Object.assign(plugin.output, sway.core.installation.output);
        }

        value1 = values[1];
        switch (value1) {
            case 'active':
                vissom.active(plugin, values[2]);
                break;
            case 'shape':
                vissom.shape(plugin, values[2]);
                break;
            case 'size':
                vissom.size(plugin, values[2]);
                break;
            case 'color':
                vissom.color(plugin, values[2], values[3], values[4]);
                break;
            default:
                vissom.orientation(plugin, values[1], values[2], values[3]);
        }

        //if (value1 == 'active') {
        //    sway.log('Active changed, ' + values[0] + ' ' + values[2], 'realtime');
        //
        //} else {
        //    // TODO: get config from core
        //    // TODO: refactor this so that we're calling orientation for orientation
        //    // send OSC
        //    //vissom.orientation(plugin.output, data.orientation);
        //
        //    sway.log('Message received ' + values[1] + ' ' + values[2], 'realtime');
        //}
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

module.exports = decorator;
