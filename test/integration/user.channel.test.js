/**
 * Created by cosinezero on 4/24/2016.
 */

var chai = require('chai'),
//var chaiHttp = require('chai-http');
    utils = require('../../testUtils/sway.test.utilities'),
    sway = require('../../api/core/sway.core');

var expect = chai.expect,
    assert = chai.assert,
    server = require('../../api/users/sway.server')(sway);

describe('User Channels', function () {
    xit('should have a wait queue for anyone waiting', function () {});
    xit('should notify the user how many people are in front of them', function () {});
    xit('should notify the user what the average wait time is', function () {});
});

describe('Channel Load Balancer', function () {

    afterEach(function () {
        sway.channelControl.clear();
    });

    it('verification', function () {
        expect(sway.channelControl).to.exist;
        expect(sway.channelControl.channels).to.exist;
        //expect(sway.channelControl.channels.length).to.equal(1);
    });

    xit('should NOT put users in a wait queue if channels are available', function () {
        assert.fail('Test not written');
    });

    it('should put users in a wait queue if no channels are empty', function () {
        // call enqueue one more than # of channels
        var keys = Object.keys(sway.channelControl.channels),
            user1 = utils.fakes.user(),
            user2 = utils.fakes.user();

        expect(keys.length).to.equal(1);

        sway.channelControl.assign(user1);
        sway.channelControl.assign(user2);

        expect(user2.channel).to.exist;
        console.log(JSON.stringify(user2.channel));
    });

    it('should put users in a channel after wait queue', function () {
        // call enqueue one more than # of channels
        var keys = Object.keys(sway.channelControl.channels),
            user1 = utils.fakes.user({ id: 1 }),
            user2 = utils.fakes.user({ id: 2 }),
            user3 = utils.fakes.user({ id: 3 }),
            user4 = utils.fakes.user({ id: 4 });

        expect(keys.length).to.equal(1);

        sway.channelControl.assign(user1);

        var channelName = user1.channel.displayName;

        sway.channelControl.assign(user4);
        sway.channelControl.assign(user2);
        sway.channelControl.assign(user3);

        expect(user2.channel).to.exist;
        console.log(JSON.stringify(user2.channel));

       sway.channelControl.remove(user1.channel, user1);

        expect(user4.channel).to.exist;
        expect(user4.channel.displayName).to.equal(channelName);
        console.log(user4.channel.displayName);

        expect(sway.channelControl.overflowQueue.length).to.equal(2);
    });
});