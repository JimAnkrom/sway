/**
 * Created by Jim Ankrom on 8/16/2014.
 *
 * Tests of sway.input.js script
 *
 */
define(['sway.input'], function (sway) {

    describe('data.transform', function () {
        var swayData;
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
    });

});



