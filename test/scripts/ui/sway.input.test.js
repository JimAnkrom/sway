/**
 * Created by Jim Ankrom on 8/16/2014.
 *
 * Tests of sway.input.js script
 *
 */
define(['sway.input'], function (sway) {

    describe('data.transform', function () {
        var swayData;

        var orientationPlugin = {
            "alpha": "/layer2/video/opacity/values",
            "beta": {
                "constraints": {
                    "floor": -25,
                    "ceiling": 110
                },
                "scale": {
                    "min": 0,
                    "max": 1
                },
                "address": "/layer2/video/opacity/values"
            },
            "gamma": {
                "constraints": {
                    "floor": -90,
                    "ceiling": 90
                },
                "scale": {
                    "min": 0,
                    "max": 1
                },
                "address": "/layer2/video/effect1/opacity/values"
            }
        };

        beforeEach(function () {
            swayData = sway.data;
        });

        it('scaleValue scales values', function () {

            var constraint = {
                floor: -45,
                ceiling: 135
            };

            var scale = {
                min: 0,
                max: 10
            };

            var testScale = swayData.transform.scaleValue(45, scale, constraint);
            expect(testScale).toBe(5);
            testScale = swayData.transform.scaleValue(135, scale, constraint);
            expect(testScale).toBe(10);
            testScale = swayData.transform.scaleValue(-45, scale, constraint);
            expect(testScale).toBe(0);
        });

        it('ratioValue gives correct ratio for low, mid, high values', function () {
            var constraint = {
                floor: -45,
                ceiling: 135
            };

            var testRatio = swayData.transform.ratioValue(-45, constraint);
            expect(testRatio).toBe(0);
            testRatio = swayData.transform.ratioValue(135, constraint);
            expect(testRatio).toBe(1);
            testRatio = swayData.transform.ratioValue(45, constraint);
            expect(testRatio).toBe(.5);
        });

        describe('transformValues', function () {
            it('processes complex values when the config is at the value level', function () {
                var values = {
                    "alpha": 10,
                    "beta": 135,
                    "gamma": 45
                };

                swayData.transform.transformValues(values, orientationPlugin);

                expect(values.alpha).toBe(10);
                expect(values.beta).toBe(1);
                expect(values.gamma).toBe(.75);
            });

            it('pivots up to constraints at the plugin level', function () {
                var values = {
                    "alpha": 55
                };

                var plugin = {
                    "constraints": {
                        "floor": 0,
                        "ceiling": 110
                    },
                    "scale": {
                        "min": 0,
                        "max": 1
                    },
                    "alpha": "/layer2/video/opacity/values"
                };

                swayData.transform.transformValues(values, plugin);

                expect(values.alpha).toBe(.5);

            });
        });
    });
});



