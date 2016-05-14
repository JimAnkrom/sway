/**
 * Created by Jim Ankrom on 8/28/2014.
 */

var oscMin = require('osc-min');
var udp = require('dgram');

// TODO: Perhaps this module should manage the socket entirely...
module.exports = function (sway) {

    function moduleInit() {
        sway.debug = sway.core.debug;
        sway.config = sway.core.config;
    }

    moduleInit();

    // reload config references on change
    sway.core.attach('config', {
        onload: moduleInit
    });

    // TODO: Refactor away from constructor, into factory
    function Message(address, offset, values) {
        this.oscType = "message";
        this.address = address;

        this.args = [];
        var items = values;
        // offset is... where in the arguments list we're passing in do we start pulling value arguments out of the list
        for (var i=offset; i< items.length; i++)
        {
            var arg = items[i];
            this.args.push(new Argument(arg));
        }
    }

    function Argument (arg) {
        this.value = arg;

        switch (typeof arg) {
            case 'number':
                // Forcing all to float right now, because older smartphones are sending integer data.
                //if (Math.floor(arg)==arg)
                //    this.type = 'integer';
                //else
                this.type = 'float';
                break;
            case 'string':
                this.type = 'string';
                break;
            default:
                throw new Error("Value is not an expected type! " + JSON.stringify(arg));
        }
    }

    // NO. THIS MEANS YOU.
    function sleepFor( sleepDuration ){
        var now = new Date().getTime();
        while(new Date().getTime() < now + sleepDuration){ /* do nothing */ }
    }

    sway.osc = {
        socket: null,
        send: function (config, oscAddress) {
            var message = new Message(oscAddress, 2, arguments);
            var cleanSocks = false,
                buffer = oscMin.toBuffer(message);
            //if (cleanSocks) this.socket = udp.createSocket('udp4');
            // console.log("Sending to " + config.address + ':' + config.port + ' ' + JSON.stringify(arguments), 'sway.osc', -1);
            // TODO: wrap this so you just send buffer
            //sleepFor(1000);
            this.socket.send(buffer, 0, buffer.length, config.port, config.address, function (err, bytes) {
                if (err) { console.log('OSC Socket Error: ' + JSON.stringify(err)); }
                // if (cleanSocks) sock.close();
            });
        },
        // Not yet working
        sendToAddress: function (ipAddress, port, address) {
            // remove ip and port off the arguments...
            //if (sway.debug)
            //console.log(ipAddress + ' / ' + port + ' Sending to ' + address + " " + JSON.stringify(arguments[3]));
            //console.log(ipAddress + ' / ' + port + ' Sending to ' + address + " " + JSON.stringify(arguments[3]));
            var message = new Message(address, 3, arguments);

            var buffer = oscMin.toBuffer(message);

            this.socket.send(buffer, 0, buffer.length, port, ipAddress, function (err, bytes) {
                if (err) { console.log('Error: ' + JSON.stringify(err)); }

            });
        },
        close: function () {
            this.socket.close();
        },
        open: function () {
            this.socket = udp.createSocket('udp4');
        }
    };
};