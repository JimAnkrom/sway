/**
 * Created by cosinezero on 5/7/2016.
 */

module.exports = function (sway) {

    var vConfig = {
        "active": {
            "address": "/active"
        },
        "size": {
            "address": "/size"
        },
        "color": {
            "addressR": "/colr",
            "addressG": "/colg",
            "addressB": "/colb"
        },
        "shape": {
            "address": "/shape"
        }
    };

    var vissom = {
        active: function (config, value) {
            //console.log('active set to ' + value);
            sway.osc.send(config.output, config.output.addressPrefix + vConfig.active.address, Number(value));
        },
        shape: function (config, value) {
            sway.osc.send(config.output, config.output.addressPrefix + vConfig.shape.address, Number(value));
        },
        size: function (config, value) {
            sway.osc.send(config.output, config.output.addressPrefix + vConfig.size.address, Number(value));
        },
        color: function (config, valueR, valueG, valueB) {
            sway.osc.send(config.output, config.output.addressPrefix + vConfig.color.addressR, Number(valueR));
            sway.osc.send(config.output, config.output.addressPrefix + vConfig.color.addressG, Number(valueG));
            sway.osc.send(config.output, config.output.addressPrefix + vConfig.color.addressB, Number(valueB));
        },
        orientation: function (config, x, y, z) {
            var output = config.output;
            var oConfig = config.orientation;
            // position /p#/posx , /p#/posy
            //sway.osc.send(config, '/p' + config.id + '/posx', x);
            //sway.osc.send(config, '/p' + config.id + '/posy', y);
            //sway.osc.send(config, '/p3/posy', y);
            //''
            var value = Number(x);
            if (!isNaN(value)) {
                sway.osc.send(output, output.addressPrefix + oConfig.alpha.address, value);
            }
            value = Number(y);
            if (!isNaN(value)) {
                sway.osc.send(output, output.addressPrefix + oConfig.beta.address, value);
            }
        }
    };

    return vissom;
};