/**
 * Created by Jim Ankrom on 3/22/2016.
 *
 * Workflow
 *
 *
 *
 */

module.exports = function (sway) {

    var utils = sway.utility;
// Need a workflow controller
// need to offer: "change state to xxxx"
// expose events for state changed

// A workflow has states and transitions
    function Workflow(options) {
    }

// A transition has a destination state
    function Transition(options) {
    }

// A state has transitions
    function State(options) {
    }


    sway.Queue = (function () {
        function queue_add(item) {
            this.items = this.items || [];
            this.items.push(item);
        }

        function queue_remove(identifier) {
            // filter array
            this.items = this.items.filter(function (item) {
                return this.filter(item, identifier);
            });
        }

        function queue_find(identifier) {
            return utils.each(this.items, function (item) {
                if (this.filter(item, identifier)) {
                    return item;
                }
            }, true);
        }

        // options.comparer = function (a, b) {}
        function queue(options) {
            options.filter = options.filter || function () {};
            return {
                filter: options.filter,
                items: [],
                add: queue_add,
                find: queue_find,
                remove: queue_remove
            };
        }

        return queue;
    })();


// queue controller
// queue empty event
// Move from one queue to next


// queue
// - order
// - capacity
// - methods
// - - enqueue
// - - dequeue
// - events
// - - enqueue
// - - dequeue
// - - empty
// - filters - could be dynamically built
// - - empty


    /** Story -
     *
     * User connects.
     * System checks to see if there are available queues
     * The last of which being the 'wait' queue
     *
     * user times out
     * they are dequeued
     *
     * game completes
     * channels are dequeued
     *
     * On empty of any channel, we add that to a fifo queue of available queues
     */

};