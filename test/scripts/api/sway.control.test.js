
/**
 * Created by Jim Ankrom on 8/14/2014.
 *
 * Tests for the Sway Control component
 */

var swayControl = require('../.././sway.control.js');

var controlMessage = {
    // orientation
    "o": {
        "absolute": 0,
        "alpha": 0,
        "beta": 0,
        "gamma": 0
    },
    // rotation
    "r": {
        "alpha": 0,
        "beta": 0,
        "gamma": 0
    },
    // acceleration
    "a": {
        "x": 0,
        "y": 0,
        "z":0
    },
    // location
    "l": {
        "lat": 1,
        "long": 1,
        "alt": 1
    },
    // motion interval
    "i": 0
};
exports.tests = {
    test_Control: function (test) {

        test.ok(swayControl);
        test.ok(swayControl.control);

        test.done();
    },
    control_send_reachesOSC: function (test) {
        swayControl.send('/testAddress', 200);

        test.ok(swayControl != null);

        test.done();
    },
    control_constrainValue_min: function (test) {
        var constraint = {
            floor: -45,
            ceiling: 135
        };

        var testValue = swayControl.constrainValue(35, constraint);
        test.ok(testValue == 35);
        testValue = swayControl.constrainValue(-135, constraint);
        test.ok(testValue == -45);

        test.done();
    },
    control_constrainValue_max: function (test) {
        var constraint = {
            floor: -45,
            ceiling: 135
        };

        var testValue = swayControl.constrainValue(35, constraint);
        test.ok(testValue == 35);
        testValue = swayControl.constrainValue(235, constraint);
        test.ok(testValue == 135);

        test.done();
    },
    control_ratioValue: function (test) {
        var constraint = {
            floor: -45,
            ceiling: 135
        };

        var testRatio = swayControl.ratioValue(35, constraint);
        console.log(testRatio);

        testRatio = swayControl.ratioValue(135, constraint);
        console.log(testRatio);
        testRatio = swayControl.ratioValue(-35, constraint);
        console.log(testRatio);

        test.done();
    },
    control_scaleValue: function (test) {
        var constraint = {
            floor: -45,
            ceiling: 135
        };
        var scale = {
            min: 0,
            max: 1
        };

        var testScale = swayControl.scaleValue(35, scale, constraint);
        console.log(testScale);

        test.done();
    }

     //,

    // Note that these tests below should be fixed, as control debugging should be able to be turned on

//    test_Control_Submission_IsReturnedInDebug: function (test) {
//        swayControl.control(controlMessage);
//        var debugControl = swayControl.debug();
//
//        test.ok(debugControl);
//        test.ok(debugControl.control[0].l.lat);
//        test.done();
//    },
//    test_Control_LastValues_AreReturnedInDebug: function (test) {
//        swayControl.clear();
//        swayControl.control(controlMessage);
//        swayControl.control(controlMessage);
//        swayControl.control(controlMessage);
//
//        var debugControl = swayControl.debug();
//
//        test.ok(debugControl);
//        test.equal(debugControl.control.length, 3);
//        test.ok(debugControl.control[0].l.lat);
//        test.done();
//    }
};
exports.tearDown = function (done) {
    //
    done();
};
