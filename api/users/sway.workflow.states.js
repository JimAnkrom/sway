/**
 * Created by cosinezero on 4/23/2016.
 */

module.exports = function (sway) {


// A workflow has states and transitions
    function Workflow(options) {
    }

// A transition has a destination state
    function Transition(options) {
    }

// A state has transitions
    function State(options) {
        return {
            name: options.name
        }
    }

    sway.workflow.states = {
        splash: State({
            name: 'splash'
        }),
        "generic": {

        }
    }

}