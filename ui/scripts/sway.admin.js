/**
 * Created by Jim Ankrom on 10/11/2014.
 * - Administrative UI functionality
 */

// TODO: Get monitor information
/*
Monitor samples look like this:
    this.id = id;
    this.stamp = stamp;
    this.maxInterval = 0;
    this.minInterval = 50000;
    this.requestCount = 0;
    this.intervalSum = 0;
    this.intervals = [];
    this.durations = [];
    this.memoryUsage = process.memoryUsage();
  */
// TODO: Get user list
// TODO: Render data

var sway = sway || {};

sway.admin = {
    getAdminPanel: function () {
        if (!sway.admin.panel) {
            var element = document.getElementById('adminPanel');
            if (element) {
                sway.admin.panel = element;
            }
        }
        return sway.admin.panel;
    },
    getMonitor: function () {
        sway.api.get(sway.config.url + sway.config.api.monitor, {}, {
            //options.success(http, response);
            success: function (http, response) {
//                var samples = response.samples;
                if (response.samples) {
                    sway.admin.renderMonitor(response.samples);
                } else {
                    console.log("No samples found");
                }
            },
            error: function (http, response) {

            }
        });
    },
    // Render the information
    render: function (target) {

    },
    renderMonitor: function (samples) {
        var panel = sway.admin.getAdminPanel();
        var t = sway.templates;

        var output = "<table>";
        for (var i=0; i<samples.length; i++) {
            var s = samples[i];
            output += "<tr><td>" + s.id + "</td><td>" + s.requestCount + "</td><td>" + JSON.stringify(s.durations) + "</td></tr>";
        }
        output += "</table>";
        panel.innerHTML = output;
        // for each sample let's just put a line in the table
    }
};