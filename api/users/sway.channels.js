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

// Depends on sway.core
module.exports = function (sway) {

    function moduleInit() {
        sway.channelControl.debug = true; // = sway.core.debug;
        sway.config = sway.core.config;
        sway.channels = sway.core.channels;
        sway.channelControl.channels = sway.core.channels;
    }

    sway.channelControl = {
        // events
        onEnqueue: null,
        onDequeue: null,
        onRemove: null,
        onAssign: null,
        onReassign: null,

        channels: sway.channels,
        overflowQueue: [],
        channelKeys: [],
        init: function () {
            sway.balancer.init();
            this.channelKeys = _.keys(this.channels);
            for (var i = 0; i < this.channelKeys.length; i++) {
                var key = this.channelKeys[i];
                var chan = this.channels[key];
                chan.name = key;
            }
        },
        // remove all users from all channels
        clear: function () {
            // remove wait queue
            this.overflowQueue = [];
            // iterate channels and clear
            _.each(sway.channelControl.channels, function (channel, index, list) {
                _.each(channel.users, function (user) {
                    user.active = false;
                    user.channel = null;
                });
                channel.users = null;
            });
        },
        // add a user to the channel queue, and remove from emptyChannels or availableChannels as necessary
        enqueue: function (channel, user) {
            if (sway.core.debug) console.log("Enqueuing user " + user.uid + " into " + channel.displayName);
            // get size
            var size = channel.queueSize ? channel.queueSize : sway.config.channel.defaultQueueSize;
            // set notifications on the user
            user.changed = true;
            // If we've got a sneaky user trying to hop out of their channel, at the least remove them from the channel they were in
            if (user.channel) {
                //console.log("Removing user " + user.uid + " from " + user.channel.displayName);
                sway.channelControl.remove(user.channel, user);
                sway.log("Removed user " + user.uid + " from prior channel.", 'sway.channels', 0);
            }

            // if channel has users in it
            if (channel.users && channel.users.length != 0) {
                // if size is not unlimited (-1) and we are at capacity
                if (size >= 0 && channel.users.length >= size) {
                    // error, adding to a full queue
                    sway.log("Overflowing user " + user.id, 'sway.channels', 0);
                    var overflowQueue = sway.channelControl.overflowQueue;

                    // Add the queue info to the user
                    var queue = {
                        count: overflowQueue.length
                    };
                    overflowQueue.push(user);
                    user.queue = Object.assign(queue, sway.config.overflowQueue);
                    return;
                }
            } else {
                // channel is empty
                //console.log("resetting users on channel " + channel.displayName);
                if (!(channel.users)) channel.users = [];
            }

            // We're good, add to the queue
            channel.users.push(user);
            // ensure the first user in queue is still active (maybe it's our new user, who cares)
            channel.users[0].active = true;
            user.channel = channel;
            if (this.onEnqueue) this.onEnqueue(user, channel);
            //console.log("User " + user.uid + " enqueued in " + user.channel.displayName);
        },
        // pop & deactivate the next a user from the channel queue, activate the next user in the channel queue
        dequeue: function (channel) {
            var u = channel.users.shift();
            u.changed = true;
            u.active = false;
            u.channel = null;
            if (this.onDequeue) this.onDequeue(u, channel);
            this.enqueueNext(channel);
        },
        // TODO: Be more explicit what the difference is with dequeue
        // remove a user from within the queue (not the same as dequeue!)
        remove: function (channel, user) {
            //console.log("removing user " + user.uid);
            user.active = false;
            user.channel = null;
            channel.users = _.reject(channel.users, function (u) {
                return u.uid == user.uid;
            });
            if (this.onDequeue) this.onDequeue(user, channel);
            this.enqueueNext(channel);
        },
        enqueueNext: function (channel) {
            // ensure that if the user was the first one, we set the new one to active (should be picked up by the next poll interval
            if (channel.users.length) {

                var u = channel.users[0];
                u.active = true;
                u.channel = channel;
                //console.log("channel set to " + channel.displayName);
            } else {
                // pull user from the overflow
                var queue = sway.channelControl.overflowQueue;
                // if we have an overflow queue, use that
                if (queue.length) {
                    var user,
                        count = 0,
                        result = [];

                    // update users in the overflow... use while loop because we
                    while (u=queue.shift()) {
                        // TODO: does expire de-queue a user?
                        if (u.expired) {
                            u.channel = null;
                            u.queue = null;
                            u.changed = true;
                        } else {
                            if (!user) {
                                user = u;
                                u.queue = null;
                                this.enqueue(channel, u);
                            } else {
                                u.queue.count = count;
                                u.changed = true;
                                result.push(u);
                                count++;
                            }
                        }
                    }
                    sway.channelControl.overflowQueue = result;
                } else {
                    sway.log("No users to queue",'sway.channels',0);
                }
            }
        },
        // TODO: determine if user is active, and if not, check to see if users are idle
        update: function (user) {
            // determine if they are in a channel or are requesting a channel
            if (user) {
                if (user.channel) {
                }
                else {
                    sway.channelControl.assign(user);
                }
                // TODO: determine if they are the active user in that channel or not (queued)
                // TODO: if they are not active, determine wait time - this is in the overflow queue now
                if (user.channel && !(user.active)) {

                }
            }
        },
        // get next channel from load balancer.
        assign: function (user) {
            sway.log("Beginning Assign - user " + JSON.stringify(user), 'ChannelControl');
            sway.channelControl.debugChannels();
            var channel = this.LoadBalancer.call(sway.balancer);
            // if channel is null, we need to put the user into the overflow queue
            if (channel) {
                this.compact(channel);
                return this.enqueue(channel, user);
            } else {
                console.log('sway.channels assign - loadBalancer returned a null channel');
            }
            this.overflowQueue.push(user);
            return;
        },
        // reassign a user to a new queue
        reassign: function (user) {
            if (user.channel) this.remove(user.channel, user);
            this.assign(user);
            // Tell the client to redirect ONLY when we assign a channel
            return;
        },
        // TODO: How much does this matter if we only have single-user channels?
        // Remove all users with expire = true
        compact: function (channel) {
            channel.users = _.reject(channel.users, function (u) {
                return u.expired;
            });
        },
        debug: true,
        debugChannels: function () {
            if (sway.channelControl.debug) {
                for (var i = 0; i > sway.channelControl.channels.length; i++) {
                    var chan = sway.channelControl.channels[i];
                    console.log(chan.displayName + " has " + chan.users.length + " users");
                }
            }
        },
        // Channel middleware
        middleware: {
            assignChannel: function (req, res, next) {
                var user = req.body.user;
                if (!user.channel) {
                    sway.channelControl.assign(user);
                    // Tell the client to redirect ONLY when we assign a channel
                    if (user.channel.redirect) {
                        req.redirect = user.channel.redirect;
                    }
                }
                next();
            }
        }
    };

    //moduleInit();

// Channel Load Balancing Algorithms
    sway.balancer = {
        init: function () {
            this.deck = null;
            this.channelIndex = 0;
        },
        channelIndex: 0,
        // rotate around the channel list in order
        roundrobin: function () {
            if (!this.deck) {
                this.deck = _.keys(sway.channelControl.channels);
            }

            // TODO: Check to ensure queue has space
            var key = this.deck[this.channelIndex];
            var chan = sway.channelControl.channels[key];
            sway.log("RoundRobin: Channel Selected - " + chan.name + ' from key ' + key);
            // loop over channels
            if (this.channelIndex + 1 == this.deck.length)
                this.channelIndex = 0;
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
        // find the first available channel starting from top, if none are empty, return last.
        waterfall: function () {
            return _.find(sway.channelControl.channels, function (chan) {
                    return !(chan.users.length);
                })
                || sway.channelControl.channels[c.users.length - 1];
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

    function channelInit() {
        moduleInit();
        sway.channelControl.LoadBalancer = sway.balancer[sway.config.channel.balancer];
        sway.channelControl.init();
    }

    channelInit();

// Reload if config changes
    sway.core.attach('channel', {onload: channelInit});
    sway.core.attach('config', {onload: channelInit});
};

