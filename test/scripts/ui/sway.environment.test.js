/**
 * Created by Jim Ankrom on 8/17/2014.
 *
 * Tests to ensure the sway dev environment is setup correctly
 *
 */
describe('Jasmine Tests', function () {
    it('are running', function () {
        expect('hello world').toBeTruthy();
    });
});

define(['sinon'], function (sinon) {
    describe('Sinon', function () {
        it('is loaded from requirejs', function (){
            expect(sinon).toBeDefined();
        });
    });
});