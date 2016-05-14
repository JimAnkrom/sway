
var cosinedesign = cosinedesign || {};
cosinedesign.toolbox = {};

//noinspection BadExpressionStatementJS
(function (toolbox) {


/**
 * Created by Jim Ankrom on 12/14/2014.
 */

// Delimit all optional arguments with delimiter
function delimit (delimiter) {
    var out;
    for (var i=1; i < arguments.length; i++)
    {
        if (out) {
            out+=delimiter;
        } else {
            out = '';
        }
        out+=arguments[i];
    }
    return out;
}



/**
 * Created by Jim Ankrom
 */
// Multicast pipeline, useful for event handlers
// inspired by .NET delegate
function multicast (callback) {
    var callbacks, disabled;

    // TODO: allow callback to be an array

    if (callback) add(callback);

    // main method of execution
    function invoke () {
        if (disabled) return;
        // TODO: testing for callbacks.length is NOT the right way to test for an array
        var i, results, len = callbacks.length;

        if (typeof callbacks == 'function') return callbacks.apply(this, arguments);

        results = [];
        if (len) {
            for (i = 0; i < len; i++) {
                results.push(callbacks[i].apply(this, arguments));
            }
        } else {
            if (callbacks) results.push(callbacks.apply(this, arguments));
        }

        return results;
    }

    // Add callback to the multicast
    function add (callback) {
        // TODO: allow callback to be an array of callbacks

        if (callbacks) {
            if (callbacks.push) {
                callbacks.push(callback);
            }
            else {
                callbacks = [callbacks, callback];
            }
        } else {
            callbacks = callback;
        }

        return this;
    }

    // Remove callback from the multicast
    function remove (callback) {
        var i, len = callbacks.length;

        if (callback && len > 1) {
            for (i = 0; i < len; i++) {
                if (callbacks[i] === callback) {
                    callbacks.splice(i, 1);
                    return;
                }
            }
        } else {
            // only one callback in the multicast
            callbacks = null;
        }
        return this;
    }

    // Expose add and remove methods on the invoke function
    invoke.add = add;
    invoke.remove = remove;

    // Enable the multicast
    invoke.enable = function () {
        disabled = false;
        return this;
    };

    // Disable the multicast
    invoke.disable = function () {
        disabled = true;
        return this;
    };

    return invoke;
}

/**
 * Created by Jim Ankrom on 2/3/2016.
 */

// A lifecycle is an ordered series of callbacks, that are executed in the order specified in phases
// This is essential for beforePhase / phase / afterPhase style handlers
// Depends on multicast, property
function lifecycle (phases, callbacks) {
    // iterate over the phases, import the callbacks as multicasts
    var i,
        key,
        callback,
        len = phases.length,
        state = {};

    for (i=0; i < len; i++) {
        key = phases[i];
        callback = callbacks[key];
        if (callback) state[key] = multicast(callback);
    }

    function invoke () {
        var i,
            len = invoke.phases.length,
            results = [];

        for (i = 0; i < len; i++) {
            results.push(invoke.handlers[invoke.phases[i]].apply(this, arguments));
        }
        return results;
    }

    // expose access to phases
    invoke.phases = phases;
    // TODO: assess if this should be a property. We may prefer to encapsulate access to this... but is that moot?
    invoke.handlers = state;

    return invoke;
}
/**
 * Created by Jim Ankrom on 1/31/2016.
 *
 * Property toolkit
 *
 * To enable:
 * - Lazy loaded properties
 * - Observeable properties
 * - Transformations / calculated properties
 *
 */

// TODO: test for memory leaks

/*
    options.loader
    options.observer (can also function as transform
 */


/*

 When we initialize a property, it should be extensible
 set.transform
 set.observer
 get.loader

 * */

function buildLoader (state, callback) {
    return function () {
        if (!(state.value)) {
            state.value = callback();
        }
        return state.value;
    };
}
function buildObserver (state, callback, target) {
    return function (value) {
        state.value = callback(value, state.value, target)
    };
}

function property (name, options, target) {
    // target last to allow bind / call / apply to override this
    target = target || this;
    var state = {},
        getter,
        setter;

    if (options.loader) {
        getter = buildLoader(state, options.loader, target);
    } else {
        getter = function () {
            return getter.state.value;
        };
    }
    getter.state = state;

    if (options.observer) {
        setter = buildObserver(state, options.observer, target);
    } else {
        setter = function (value) {
            state.value = value;
            return value;
        };
    }

    //var definition = {
    //    enumerable: true,
    //    configurable: false,
    //    writable: false,
    //    value: null
    //};

    Object.defineProperty(target, name, {
        get: getter,
        set: setter
    });

    return this;
}



/**
 * Created by Jim Ankrom on 1/30/2016.
 */

// Turn pipe on and off
// TODO: perhaps this is the 'throttle' gate?
// TODO: allow options to accept a gate method and an invoker method
// TODO: this cannot be used in the middle of a pipe - it is asynchronous. Perhaps there's a way to attach a throttle into a pipe?
/**
 *
 * @param callback
 * @param options { open }
 * @returns {invoke}
 */
function throttle (callback, options) {
    options = options || {};
    options.open = options.open || true;
    options.gater = options.gater || simpleGate;
    //options.count = options.count || 0;
    //options.originalCount = options.count;

    // Open the gate
    function on() {
        options.open = true;
    }

    // Close the gate
    function off() {
        options.open = false;
    }

    // Basic on/off gate
    function simpleGate () {
        return options.open;
    }

    // TODO: Future
    //function countedGate () {
    //    // If there's a limit set, evaluate / update it
    //    options.count--;
    //    if (!options.count) invoke.off();
    //    return simpleGate();
    //    // TODO: reset if needed
    //}
    //// Only allow n# of iterations then stop
    //function count(value) {
    //    options.originalCount = value;
    //    invoke.reset();
    //}

    // TODO: raise an event when this is called
    function statefulInvoker () {
        callback.apply(null, options.arguments);
    }

    function start_interval () {
        // TODO: this isn't the right invoker, I think.
        options.intervalId = setInterval(statefulInvoker, options.interval);
    }

    function stop_interval () {
        clearInterval(options.intervalId);
    }

    // send values on interval, regardless of input
    function interval (interval) {
        options.stateful = true;
        options.interval = interval || options.interval;
        // Turn off the usual gate
        off();
        start_interval();
    }

    // Reset everything in the valve
    function reset() {
        // options.count = options.originalCount;
        if (options.intervalId) {
            stop_interval();
        }
        on();
    }

    // Invoke function to invoke the throttle
    function invoke() {
        // TODO: consider an arguments filter to be applied that evaluates raising an onchange?
        // TODO: consider a gate that only sends when we have changed data
        if (arguments.length) options.arguments = arguments;
        if (options.gater && options.gater()) {
            return callback.apply(null, options.arguments);
        }
    }

    // Build invoke
    invoke.on = on;
    invoke.off = off;
    invoke.reset = reset;
    invoke.interval = interval;
    invoke.interval.stop = stop_interval;
    invoke.interval.start = start_interval;

    return invoke;
}
/**
 * Created by Jim Ankrom on 3/3/2016.
 */
// var p = pipe(callback1)
//  .then(callback2)
//  .then(callback3)
//  .then(callback4)
/**
 *
 * @param callback
 * @returns {invoke}
 */
function pipe(callback) {

    var _current;

    if (callback) {
        _current = function (data) {
            return callback(data);
        };
    }

    var invoke = function (data) {
        if (_current) return _current(data);
        return data;
    };

    // Next needs to wrap current
    invoke.next = function (callback) {
        var previous = _current;

        if (_current) {
            _current = function (data) {
                var result = previous(data);
                return callback(result);
            };
        } else {
            _current = function (data) {
                return callback(data);
            };
        }

        return this;
    };

    invoke.add = function (callbacks) {
        // TODO: support an each method
        var i, item, len = callbacks.length;

        for (i=0; i<len; i++) {
            item = callbacks[i];
            invoke.next(item);
        }
        return this;
    };

    return invoke;
}

/**
 * Created by Jim Ankrom on 1/30/2016.
 */

// Depends on multicast

        // Make target into an evented object
        // Depends on multicast
        function events (target, events) {
    //options = options || {};
    var targetEvents = events || {};

    // add event handler for event
    target.on = function (eventName, handler) {
        if (!targetEvents) targetEvents = {};
        if (!targetEvents[eventName]) {
            targetEvents[eventName] = multicast(handler);
        } else {
            targetEvents[eventName].add(handler);
        }
        return this;
    };

    // remove specific event
    target.off = function (eventName, callback) {
        doIfExists(eventName, function (handlers) {
            handlers.remove(callback);
        });
    };

    // remove all events
    target.allOff = function () {
        targetEvents = {};
    };

    // enable the event
    target.enableEvent = function (eventName) {
        doIfExists(eventName, function (handlers) {
            handlers.enable();
        });
    };

    // disable the event
    target.disableEvent = function (eventName) {
        doIfExists(eventName, function (handlers) {
            handlers.disable();
        });
    };

    // trigger the event
    target.trigger = function (eventName) {
        var myEvent = eventName;
        [].splice.call(arguments, 0, 1); // slick hack to shift arguments "array" that isn't an array
        var thatArgs = arguments;
        doIfExists(myEvent, function (handlers) {
            handlers.apply(target, thatArgs);
        });
        return this;
    };


    function doIfExists(eventName, action) {
        if (targetEvents) {
            var handlers = targetEvents[eventName];
            if (handlers) {
                action(handlers);
            }
        }
    }

    return target;
}

/**
 * Created by Jim Ankrom on 3/12/2016.
 */

function log (message, logModule, logObject) {
    if (this.debug) {
        if (console && console.log) {
            var extended = '';
            if (logObject) extended = ': ' + JSON.stringify(logObject);
            if (logModule)
                console.log('[' + logModule + '] - ' + message + extended );
            else
                console.log(message + extended );
        }
    }
}






toolbox.multicast = multicast;
toolbox.lifecycle = lifecycle;
//toolbox.observe = observe;
toolbox.throttle = throttle;
toolbox.property = property;
toolbox.events = events;
toolbox.pipe = pipe;
toolbox.log = log;

})//noinspection BadExpressionStatementJS
(
    cosinedesign.toolbox
);




if (module) module.exports = cosinedesign.toolbox;