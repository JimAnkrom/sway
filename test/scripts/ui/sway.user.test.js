/**
 *
 * Created by Jim Ankrom on 8/16/2014.
 *
 *
 */

define(['sinon', 'sway.user'], function (sinon, swayUser) {
    describe('sway.user', function () {

        it('is loaded by require', function () {
            expect(swayUser).toBeDefined();
        });
        describe('.init', function () {
            var server;
            beforeEach(function () {
                server = sinon.fakeServer.create();
                var serverUrl = "http://www.sway.com";
                swayUser.config.url = serverUrl;
                sway.hostname = null;

                var authResponse = {
                    token: { id: 10, uid: 219024871 }
                };

                swayUser.oninitialized = function (data) {};

                //console.log(serverUrl + "/users");
                server.respondWith('POST', serverUrl + "/users",
                    [200, {"Content-Type": "application/json"},
                        JSON.stringify(authResponse)] );
            });
            it('calls authorize and sets up the user appropriately', function () {
                // act
                swayUser.init();
                server.respond();
                // assert
                expect(swayUser.user.token).toBeDefined();
                expect(swayUser.user.token.id).toBe(10);
                expect(swayUser.user.token.uid).toBe(219024871);
            });
            it('calls oninitialized once configured', function () {
                var initMe;
                swayUser.oninitialized = function (data) {
                    initMe = true;
                };
                // act
                swayUser.init();
                server.respond();
                // assert
                expect(initMe).toBeTruthy();
            });
        });

        describe('.request', function () {
            var server;
            beforeEach(function () {
                server = sinon.fakeServer.create();

                var serverUrl = "http://www.sway.com";
                swayUser.config.url = serverUrl;
                sway.hostname = null;

                var authResponse = {
                    token: { id: 10, uid: 219024871 },
                    channel: { name: "testChannel1"}
                };
                server.respondWith('POST', serverUrl + "/test", [ 200, { "Content-Type": "application/json" }, JSON.stringify(authResponse)] );
            });
            it('returns a response', function () {
                swayUser.oninitialized = function (data) {};
                var http = swayUser.api.request( swayUser.config.url + "/test", "POST", {blah: 'blah'}, {});

                server.respond();
                expect(http).toBeDefined();
                expect(http.status).toBe(200);
            });

        });


    });
});