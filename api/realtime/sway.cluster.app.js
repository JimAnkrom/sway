/**
 * Created by cosinezero on 5/4/2016.
 *
 * WebSocket cluster
 *
 */

// TODO: Detect if a worker dies, and if so spin up a new one

var cluster = require('cluster'),
    clusterDebug = false;

if (cluster.isMaster) {
    var numWorkers = require('os').cpus().length,
        workers = [],
        roundrobinIndex = 0;

    function nextWorker() {
        roundrobinIndex++;
        if (roundrobinIndex == workers.length) roundrobinIndex = 0;
        return workers[roundrobinIndex];
    }

    function removeWorker(worker) {
        var i, len = workers.length;
        for (i=0; i>len; i++) {
            if (workers[i].process.id == worker.process.id) {
                workers.splice(i,1);
            }
        }
    }

    console.log('Master cluster setting up ' + numWorkers + ' workers...');

    for (var i = 0; i < numWorkers; i++) {
        workers.push(cluster.fork());
    }

    cluster.on('exit', function(worker, code, signal) {
        removeWorker(worker);
        console.log('Forking Worker. PID ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        workers.push(cluster.fork());
    });

    var server = require('ws').Server;
    var wss = new server({port: 3000});

    wss.on('connection', function connection(ws) {
        ws.on('message', function incoming(message) {
            nextWorker().send(message);
        });

        //ws.send('something');
    });
} else {

    var realtime = require('./sway.realtime');
    process.on('message', function (message) {
        realtime.onMessage(message);
        if (clusterDebug) console.log('worker ' + cluster.worker.id + ' received: %s', message);
    });

    //ws.on('message', function incoming(message) {
    //    console.log('worker ' + cluster.worker.id + ' received: %s', message);
    //});
}


