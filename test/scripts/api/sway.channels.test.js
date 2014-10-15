/**
 * Created by Jim Ankrom on 9/10/2014.
 */
var swayChannels = require('../../../api/sway.channels.js');
var swayConfig = require('../../../api/sway.config.json');
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


    // test enqueue
    Channels_Enqueue: function (test) {
        var testUser = {};
        var testChannel = new TestChannel();

        swayChannels.enqueue(testChannel, testUser);

        test.ok(testUser.channel != null);
        test.ok(testUser.channel === testChannel);
        test.done();
    },

    // test dequeue
    Channels_Dequeue: function (test) {
        // Arrange
        var testChannel = new TestChannel();
        var testUser = { uid: 123 };
        swayChannels.enqueue(testChannel, testUser);
        test.ok(testUser.active);
        test.ok(testUser.channel != null);
        test.ok(testUser.channel === testChannel);

        // Act
        swayChannels.remove(testChannel, testUser);

        test.done();
    },

    // test remove
    Channels_Remove: function (test) {
        // Arrange
        var testChannel = new TestChannel();
        var testUser = { uid: 123 };
        swayChannels.enqueue(testChannel, testUser);
        test.ok(testUser.active);
        test.ok(testUser.channel != null);
        test.ok(testUser.channel === testChannel);

        // Act
        swayChannels.remove(testChannel, testUser);

        // Assert
        // User should not be active
        test.ok(!testUser.active);
        // User should not have a channel
        test.ok(testUser.channel == null);
        // No users should be left behind
        test.ok(testChannel.users.length == 0);

        test.done();
    },

    // test update
    Channels_Update: function (test) {
        // Arrange
        var testUser = { uid: 123 };

        swayChannels.update(testUser);

        test.ok(testUser.active);
        test.ok(testUser.channel != null);

        test.done();
    },

    Channels_Update_DoesNotChangeUsersExistingChannel: function (test) {
        var testChannel = new TestChannel();
        var testUser = { uid: 123 };
        swayChannels.enqueue(testChannel, testUser);
        test.ok(testUser.active);
        test.ok(testUser.channel != null);
        test.ok(testUser.channel === testChannel);

        // Act
        swayChannels.update(testUser);

        test.ok(testUser.active);
        test.ok(testUser.channel != null);
        test.ok(testUser.channel === testChannel);

        test.done();
    },
    Channels_Reassign_ChangesUsersExistingChannel: function (test) {
        var testChannel = new TestChannel();
        testChannel.name = "TEST CHANNEL ONE";
        var testUser = { uid: 123 };
        swayChannels.enqueue(testChannel, testUser);
        test.ok(testUser.active);
        test.ok(testUser.channel != null);
        test.ok(testUser.channel === testChannel);

        // Act
        swayChannels.reassign(testUser);

        test.ok(testUser.active);
        test.ok(testUser.channel != null);
        test.ok(testUser.channel != testChannel);
        test.ok(testUser.channel.name != testChannel.name);
        console.log(testUser.channel.name);
        test.done();
    },
    Channels_OverloadUserSentToOverloadQueue: function (test) {
        var oldChannels = swayChannels.channels;
        // put a user in each channel
        swayChannels.channels = {
            "TESTCHANNEL": {
                "displayName": "Multi-user test channel 3",
                "description": "This channel is the PINK CUBE",
                "orientation": "/orient/3",
                "queueSize": 1
            }
        };
        swayChannels.init();
        var testUser = { uid: 123 };
        swayChannels.assign(testUser);

        test.ok(testUser.channel != null);
        test.ok(testUser.channel === swayChannels.channels.TESTCHANNEL);
        test.ok(swayChannels.channels.TESTCHANNEL.users.length == 1);

        var testUser2 = { uid: 1234 };
        swayChannels.assign(testUser2);

        test.ok(testUser2.channel != null);
        test.ok(testUser2.channel === swayConfig.overflowQueue);

        swayChannels.channels = oldChannels;
        swayChannels.init();
        test.done();
    },
    Channels_OverloadUserGivenChannelWhenFirstUserExpired: function (test) {
        var oldChannels = swayChannels.channels;

        swayChannels.overflowQueue = [];

        // put a user in each channel
        swayChannels.channels = {
            "TESTCHANNEL": {
                "displayName": "Multi-user test channel 3",
                "description": "This channel is the PINK CUBE",
                "orientation": "/orient/3",
                "queueSize": 1
            }
        };
        swayChannels.init();
        var testUser = { uid: 123 };
        swayChannels.assign(testUser);

        test.ok(testUser.channel != null);
        test.ok(testUser.channel === swayChannels.channels.TESTCHANNEL);
        test.ok(swayChannels.channels.TESTCHANNEL.users.length == 1);

        var testUser2 = { uid: 1234 };
        swayChannels.assign(testUser2);
        var testUser3 = { uid: 12345 };
        swayChannels.assign(testUser3);

        test.ok(testUser2.channel != null);
        test.ok(testUser2.channel === swayConfig.overflowQueue);
        console.log("Current Queue: " + testUser2.channel.displayName);

        swayChannels.remove(testUser.channel, testUser);

        test.ok(testUser2.channel != null);
        test.ok(testUser2.channel === swayChannels.channels.TESTCHANNEL);

        console.log(testUser2);

        swayChannels.channels = oldChannels;
        swayChannels.init();
        test.done();
    },
    Channels_OverloadUserGivenChannelWhenFirstUserExpired: function (test) {
        var oldChannels = swayChannels.channels;

        swayChannels.overflowQueue = [];

        // put a user in each channel
        swayChannels.channels = {
            "TESTCHANNEL": {
                "displayName": "Multi-user test channel 1",
                "description": "This channel is the PINK CUBE",
                "orientation": "/orient/3",
                "queueSize": 1
            },
            "TESTCHANNEL2": {
                "displayName": "Multi-user test channel 2",
                "description": "This channel is the PINK CUBE",
                "orientation": "/orient/3",
                "queueSize": 1
            },
            "TESTCHANNEL3": {
                "displayName": "Multi-user test channel 3",
                "description": "This channel is the PINK CUBE",
                "orientation": "/orient/3",
                "queueSize": 1
            }
        };
        swayChannels.init();
        var testUser = { uid: 123 };
        var testUser2 = { uid: 1234 };
        var testUser3 = { uid: 12345 };
        var testUser4 = { uid: 321 };
        var testUser5 = { uid: 4321 };
        var testUser6 = { uid: 54321 };

        swayChannels.assign(testUser);
        swayChannels.assign(testUser2);
        swayChannels.assign(testUser3);

        // Assign our overflow users
        swayChannels.assign(testUser4);
        swayChannels.assign(testUser5);
        swayChannels.assign(testUser6);

        test.ok(swayChannels.overflowQueue.length == 3);

        swayChannels.remove(testUser.channel, testUser);

        test.ok(swayChannels.overflowQueue.length == 2);
        test.ok(testUser4.channel === swayChannels.channels.TESTCHANNEL);

        swayChannels.remove(testUser2.channel, testUser2);

        test.ok(testUser5.channel === swayChannels.channels.TESTCHANNEL2);
        test.ok(testUser6.channel === swayConfig.overflowQueue);

        swayChannels.channels = oldChannels;
        swayChannels.init();
        test.done();
    }


    // test test assign
    // test reassign
    // test compact
    //Channels_Compact: function () {}

    // test load balancers
    // test wait queues
};