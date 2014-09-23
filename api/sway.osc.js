/**
 * Created by Jim Ankrom on 8/28/2014.
 */

var oscMin = require('osc-min');
var udp = require('dgram');
var config = require('./sway.config.json');


module.exports = (function (){

    function Message(address) {
        this.oscType = "message";
        this.address = address;

        this.args = [];
        var items = arguments[1];
        for (var i=1; i< items.length; i++)
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
                throw new Error("Value is not an expected type!");
        }
    }

    return {
        socket: null,
        send: function (address) {
            var message = new Message(address, arguments);

            var buffer = oscMin.toBuffer(message);

            this.socket.send(buffer, 0, buffer.length, config.server.port, config.server.address, function (err, bytes) {
                if (err) { console.log('Error: ' + JSON.stringify(err)); }

            });
        },
        // Not yet working
        sendToAddress: function (ipAddress, port, address) {
            var message = new Message(address, arguments);

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

}());
