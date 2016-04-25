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


    sway.workflowController = {
        // This is called by the client to advance the workflow action to the next step, assuming the requirements are met
        // there should be some message to indicate a failure to the client
        action: function (req, res, next) {
            // req.action ?
            var that = sway.workflowController,
                user = req.user,
                currentState = null,
                newState;

            // TODO: FOR NOW LET'S JUST ITERATE THROUGH STATES ARRAY - we can get fancy later
            // FUTURE: create an iterable that knows what actions are in what order, and register that with plugins

            if (!user.state) {
                // and then set us to the new state
                newState = that.workflow[sway.core.installation.initialState];
                req.user.state = {
                    name: sway.core.installation.initialState,
                    transitions: newState
                };
                next();
                return;
            }

            var stateIndex = that.states.findIndex(function (item, index, items) {
                if (item == user.state.name) {
                    currentState = that.workflow[item];
                    return true;
                }
            });

            if (!currentState) {
                sway.log('Error: currentState was null! user: ' + JSON.stringify(user));
                return;
            }

            if (req.user.transition) {
                // validate the transition and deliver the new state
                // verify that the state name exists in the workflow as a state
                // if yes, then validate that transition,

                var trans = req.user.transition,
                    isValid = false;
                // currentState can be either a string or array
                if (Array.isArray(currentState)) {
                    // find the trans in the
                    isValid = (currentState.indexOf(trans) != -1);
                } else {
                    isValid = (currentState == trans);
                }

                // TODO: validate data from current action here, as needed

                if (isValid) {
                    // and then set us to the new state
                    newState = that.workflow[trans];
                    req.user.state = {
                        name: trans,
                        transitions: newState
                    };
                }
                req.user.transition = null;
            }

            next();
        },
        workflow: sway.core.installation.workflow,
        states: sway.core.installation.states
        //// TODO: pull this from installation config instead of hardcoded here

    };

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