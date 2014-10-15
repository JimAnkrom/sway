/**
 * Created by Jim Ankrom on 9/26/2014.
 * Perf Monitor
 - convert timestamp to seconds (divide by 1000, round?)
 - if your seconds value is != to the object's second, create a new one.

 object:
 - timestamp value
 - requestCount
 - usersQueued
 // request throughput
 - requestStart - set at beginning of server
 - requestMaxInterval - what was the longest time between requests this second
 - requestMinInterval - what was the shortest time between requests this second
 - requestAverageInterval - what was the average time between requests this second

 *
 *
 */

var sway = sway || {};

sway.monitor = {
    config: {
        // milliseconds to round to
        scale: 1000,
        maxSamples: 300
    },
    samples: [],
    previousTime: Date.now(),
    onSampling: null,
    takeSample: function () {
        var cfg = sway.monitor.config;
        var stamp = Date.now();
        var sampleFrame = Math.floor(stamp / cfg.scale);
        if (!sway.monitor.currentFrame) sway.monitor.currentFrame = new sway.monitor.Sample();
        // cut a new sample if the sampleTime is different - ie, we're outside the range of the frame
        if (sampleFrame != this.currentFrame.id) {
            // if we're over maxSamples, drop one.
            if (this.samples.length >= cfg.maxSamples) this.samples.shift();
            this.currentFrame.setAverage();
            this.currentFrame.memoryUsage = process.memoryUsage();
            this.samples.push(this.currentFrame);
            if (this.onSampling != null) this.onSampling.call(this, this.currentFrame);
            // Use sampleTime as id for new sample.
            this.currentFrame = new sway.monitor.Sample(sampleFrame, stamp);
        }
        this.currentFrame.setIntervals(stamp);
    }
};

// constructor for Sample class
sway.monitor.Sample = function (id, stamp) {
    this.id = id;
    this.stamp = stamp;
    this.maxInterval = 0;
    // need some non-zero number because we're testing for lesser numbers, and if we set this to 0 it will stay 0
    this.minInterval = 50000;
    this.requestCount = 0;
    this.intervalSum = 0;
    this.intervals = [];
    this.durations = [];
    this.memoryUsage = process.memoryUsage();
};

// encapsulates the setAverage logic; it's simple, but don't want it hanging around for someone to modify for no good reason
sway.monitor.Sample.prototype.setAverage = function () {
    var count;
    // divide by zero to start it off, eh? Good job.
    if (!this.requestCount) count = 1;
    this.avgInterval = this.intervalSum / count;
};
// encapsulates the setAverage logic; it's simple, but don't want it hanging around for someone to modify for no good reason
sway.monitor.Sample.prototype.setDuration = function () {
    this.durations.push(Date.now() - sway.monitor.previousTime);
};

// Set request interval data
sway.monitor.Sample.prototype.setIntervals = function (currentTime) {
    var interval = currentTime - sway.monitor.previousTime;
    sway.monitor.previousTime = currentTime;
    this.intervals.push(interval);
    this.requestCount++;
    this.intervalSum += interval;
    if (this.maxInterval < interval)
        this.maxInterval = interval;
    else {
        if (this.normalInterval < interval) this.normalInterval = interval;
    }
    if (this.minInterval > interval) this.minInterval = interval;
};

// Finally, let's return our module.
module.exports = sway.monitor;