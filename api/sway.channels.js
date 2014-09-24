/**
 * Created by Jim Ankrom on 9/9/2014.
 *
 * Channel control
 *
 * Each channel should maintain it's own queue (channel.users)
 * Users should be able to request a channel, and be queued into that channel if available
 * If a specific queue is not requested, the load balancer (sway.channelControl.balancer) is used to determine what channel the user goes into
 *
 */

// TODO: LOW null queue for users to wait in - overflowQueue
// TODO: LOW Is overflow queing overdesigned? (PROBABLY)

// TODO: set channel.name to the property name on load
// TODO: response processing should extract channel info and send to client

// TODO: Queued user polling from UI

// TODO: Need a timer to count down user's remaining time in control
// TODO: expire users
// TODO: All references to QueueSize must take into account that that value may not be set or set to -1, in which case it's unlimited.

// TODO: Check my todo/task list for channel options
// TODO: copy good channel information to the user when it changes

var _ = require('underscore');

var sway = sway || {};
sway.config = require('./sway.config.json');

sway.channelControl = {
    channels: require('./sway.channels.json'),
    overflowQueue: [],
    channelKeys: [],
    init: function () {
        this.channelKeys = _.keys(this.channels);
        for (var i = 0; i < this.channelKeys.length; i++)
        {
            var key = this.channelKeys[i];
            var chan = this.channels[key];
            chan.name = key;
        }
    },
    // add a user to the channel queue, and remove from emptyChannels or availableChannels as necessary
    enqueue: function (channel, user) {
        // get size
        var size = channel.queueSize ? channel.queueSize : sway.config.channel.defaultQueueSize;

        // if channel has users in it
        if (channel.users && channel.users.length != 0) {
            // if size is not unlimited (-1) and we are at capacity
            if (size >= 0 && channel.users.length >= size) {
                // error, adding to a full queue
                // TODO: what to do when the queue is full?
                console.log('All Channels Full');
                return;
            }
        } else {
            // channel is empty
            if (!(channel.users)) channel.users = [];
        }
        // We're good, add to the queue
        channel.users.push(user);
        // ensure the first user in queue is still active (maybe it's our new user, who cares)
        channel.users[0].active = true;
        user.channel = channel;
    },
    // pop & deactivate the next a user from the channel queue, activate the next user in the channel queue
    dequeue: function (channel) {
        var user = channel.users.shift();
        user.active = false;
        user.channel = null;
        channel.users[0].active = true;
        // put an overflow member in the queue
        if (this.overflowQueue.length) channel.users.push(this.overflowQueue.shift());
    },
    // remove a user from within the queue (not the same as dequeue!)
    remove: function (channel, user) {
        //console.log('Removing')
        user.active = false;
        channel.users = _.reject(channel.users, function (u) {
            return u.uid == user.uid;
        });
        // ensure that if the user was the first one, we set the new one to active (should be picked up by the next poll interval
        if (channel.users.length) channel.users[0].active = true;
    },
    // TODO: determine if user is active, and if not, check to see if users are idle
    update: function (user) {
        // determine if they are in a channel or are requesting a channel
        if (user) {
            if (user.channel) { }
            else {
                sway.channels.assign(user);
            }
            // TODO: determine if they are the active user in that channel or not (queued)
            // TODO: if they are not active, determine wait time
            if (user.channel && !(user.active)) {

            }
        }
    },
    // get next channel from load balancer.
    assign: function (user) {

        var channel = this.LoadBalancer.call(sway.balancer);
        // if channel is null, we need to put the user into the overflow queue
        if (channel) {
            return this.enqueue(channel, user);
        }
        // console.log("Balancer: " + sway.config.channel.balancer);
        // console.log("Warning: Channel Overflow");
        this.overflowQueue.push(user);
        return;
    },
    reassign: function (user) {
        if (user.channel) this.remove(user.channel, user);
        this.assign(user);
        return;
    },
    middleware: {
        assignChannel: function (req, res, next) {
            var user = req.body.user;
            if (!user.channel) {
                sway.channelControl.assign(user);
                // Tell the client to redirect.
                if (user.channel.redirect)
                {
                    req.redirect = user.channel.redirect;
                }
            }
            next();
        }
    }
};

// Channel Load Balancing Algorithms
sway.balancer = {
    channelIndex: 0,
    // rotate around the channel list in order
    roundrobin: function () {
        //var balancer = sway.channelControl.balancer;
        if (!this.deck) {
            this.deck = _.keys(sway.channelControl.channels);
        }
        //TODO: Is this using the right channel index?
        //console.log("Deck: " + JSON.stringify(this.deck) + " Index: " + this.channelIndex);

        // TODO: Check to ensure queue has space
        var chan = sway.channelControl.channels[this.deck[this.channelIndex]];
        // loop over channels
        if (this.channelIndex+1 == this.deck.length)
            this.channelIndex=0;
        else
            this.channelIndex++;
        return chan;
    },
    shufflerobin: function () {
        //var balancer = sway.channelControl.balancer;
        if (!this.deck) {
            this.deck = _.shuffle(_.keys(sway.channelControl.channels));
        }
        // TODO: Check to ensure queue has space
        return sway.channelControl.channels[this.deck[this.index++]];
    },
    // find the relatively emptiest channel and add user
    weighted: function () {
        var sorted = _.sortBy(sway.channelControl.channels, function (chan) {
            if (!chan.users) return 0;
            // sorting by delta of queue size to length
            return chan.queueSize - chan.users.length;
        });
        // TODO: Check to ensure queue has space - if sorted[0] does not, return overflow queue!
        // return the last channel when sorted by number of users
        return sorted[0];
    },
    // random queue for every user
    random: function () {
        var next = _.shuffle(sway.channelControl.channels);
        if (!next.users) return next;
        if (next.queueSize == next.users.length) {
            next = _.find(sway.channelControl.channels, function (chan) {
                return chan.queueSize > chan.users.length;
            })
        }
        if (next) return next;
    }
};

// Start up the whole damn mess
sway.channelControl.init();

// Wire up the LoadBalancer from config
sway.channelControl.LoadBalancer = sway.balancer[sway.config.channel.balancer];

// Module support
if (module) module.exports = sway.channelControl;

