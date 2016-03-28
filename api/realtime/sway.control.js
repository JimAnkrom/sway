/**
 * Created by Jim Ankrom on 8/14/2014.
 */
module.exports = function (sway) {

    require('./sway.osc.js')(sway);
    sway.osc.open();

// reload config references on change
    sway.core.attach('config', {
        onload: function () {
            sway.config = sway.core.config;
        }
    });

    // Sway state management - leave private for now.
    sway.state = {
        settings: {}
    };

    // Sway Control
    // TODO: This WAS sway.server for some reason. Assess that this is correct now
    sway.control = {
        // Calibrate the *installation*. This is not calibration for a user.
        calibration: function (data) {
            sway.state.settings.calibration = data;
            //console.log('Calibration Received - ' + JSON.stringify(data));
        },
        control: function (channel, control) {
            // we only care about the channel configuration, so use that
            //console.log("control message!");
            this.processMotion(channel, control, 'rotation');
            this.processMotion(channel, control, 'orientation');
            this.processLocation(channel, control, 'location');
            this.processPlugin(channel, control, 'resolumeMotion');
        },
        // Custom routing plugin for resolumeMotion
        processPlugin: function (channel, control, pluginName) {
            var pluginDef = channel[pluginName];
            var controlName = 'orientation';

            if (pluginDef) {
                var controlRoute = pluginDef[controlName];
                var cInput = control[controlName];
                // config.server.port, config.server.address
                var ip = cInput.address || pluginDef.address || sway.config.server.address;
                var port = cInput.port || pluginDef.port || sway.config.server.port;

                if (controlRoute && cInput) {
                    if (controlRoute.alpha || controlRoute.beta || controlRoute.gamma) {
                        // Currently - Yaw, Pitch, Roll (alpha, beta, gamma)
                        if (controlRoute.alpha)
                            sway.osc.sendToAddress(ip, port, controlRoute.alpha, cInput.alpha)

                        if (controlRoute.beta) {
                            var beta = sway.server.processValue(ip, port, cInput.beta, controlRoute.beta);
                            //console.log("Beta: " + cInput.beta);
                        }
                        if (controlRoute.gamma) {
                            var gamma = sway.server.processValue(ip, port, cInput.gamma, controlRoute.gamma);
                            //console.log("Gamma: " + cInput.gamma);
                        }
                    } else {
                        // Currently - Yaw, Pitch, Roll (alpha, beta, gamma)
                        sway.osc.sendToAddress(ip, port, cRoute, cInput.alpha, cInput.beta, cInput.gamma);
                    }
                }
            }
        },
        processValue: function (ip, port, value, valueDefinition) {
            var def = valueDefinition;
            var address = def;
            if (def.constraints || def.scale) {
                address = def.address;
                // don't need to do this here anymore, since moved to the UI
                //value = sway.server.scaleValue(value, def.scale, def.constraints);
            }

            sway.osc.sendToAddress(ip, port, address, value);
        },
        // TODO: is this supposed to be in sway.server???
        scaleValue: function (value, scale, constraints) {
            if (constraints) {
                var constrainedValue = sway.server.constrainValue(value, constraints);
                if (scale) {
                    var ratio = sway.server.ratioValue(constrainedValue, constraints);
                    var scaleRange = scale.max - scale.min;
                    var relativeOffset = ratio * scaleRange;
                    var absoluteValue = relativeOffset + scale.min;
                    return absoluteValue;
                }
            }
            return value;
        },
        // Get the ratio of the value to the size of the constraint range
        ratioValue: function (value, constraints) {
            if (constraints) {
                var rangeSize = constraints.ceiling - constraints.floor;
                var adjustedValue = value - constraints.floor;
                return adjustedValue / rangeSize;
            }
        },
        constrainValue: function (value, constraints) {
            if (constraints) {
                if (value < constraints.floor) return constraints.floor;
                if (value > constraints.ceiling) return constraints.ceiling;
            }
            return value;
        },
        processMotion: function (channel, control, inputType) {
            var cRoute = channel[inputType]
            if (cRoute) {
                var cInput = control[inputType];
                if (cInput) {

                    // Currently - Yaw, Pitch, Roll (alpha, beta, gamma)
                    sway.osc.send(cRoute, cInput.alpha, cInput.beta, cInput.gamma);
                }
            }
        },
        processLocation: function (channel, control, inputType) {
            var cRoute = channel[inputType]
            if (cRoute) {
                var cInput = control[inputType];
                if (cInput) {
                    // TODO: what do we want to do with location...?
                }
            }
        },
        clear: function () {
            sway.state.settings = {};
        },
        debug: function () {
            return sway.state;
        },
        send: function (address) {
            if (address) sway.osc.send.apply(sway.osc, arguments);// sway.osc, address, arguments);
            return null;
        },
        shutdown: function () {
            sway.osc.close();
        }
    };

};