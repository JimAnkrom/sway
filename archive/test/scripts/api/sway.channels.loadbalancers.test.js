/**
 * Created by Jim Ankrom on 9/10/2014.
 */

var swayChannels = require('../../../api/users/sway.channels.js');

var testChannels = {
    "TESTCHANNEL": {
        "address": "192.168.1.202",
        "port": 6000,
        "displayName": "Multi-user test channel 3",
        "description": "This channel is the PINK CUBE",
        "orientation": "/orient/3"
    }
};
var oldChannelConfig = swayChannels.channels;

function TestChannel () {
    this.users = [];
};

exports.tests = {

    setUp: function (callback) {
        //swayChannels.channels = testChannels;
        callback();
    },

    tearDown: function (callback) {
        swayChannels.channels = oldChannelConfig;
        callback();
    },

    // test init
    //Channels_Init: function (test) {},

    LoadBalancer_GetChannel: function (test) {


        test.done();
    }

    // test test assign
    // test reassign
    // test compact
    //Channels_Compact: function () {}

    // test load balancers
    // test wait queues
};