/**
 * Created by Jim Ankrom on 3/19/2016.
 * Test target for OSC messages, to ensure the message is sent and encoded properly
 *
 * TODO: UDP forwarding
 */

var oscMin = require('osc-min');
var udp = require('dgram');

module.exports = function (config) {

    config = config || {
        inport: 6666
    };

    var sock = udp.createSocket("udp4", function (msg, rinfo) {
        var error;
        try {
            return console.log(oscMin.fromBuffer(msg));
        } catch (e) {
            error = e;
            return console.log("invalid OSC packet");
        }
    });

    sock.bind(config.inport);
    console.log('Listening for OSC on port ' + config.inport);
};

