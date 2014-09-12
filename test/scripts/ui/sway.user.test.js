/**
 *
 * Created by Jim Ankrom on 8/16/2014.
 *
 *
 */

define(['sinon', 'sway', 'sway.user'], function (sinon, sway, user) {
    describe('sway.user', function () {

        it('is loaded by require', function () {
            expect(user).toBeDefined();
        });
        describe('.init', function () {
            var server;
            beforeEach(function () {
                server = sinon.fakeServer.create();
                var serverUrl = "http://www.sway.com";
                sway.serverUrl = serverUrl;

                var authResponse = {
                    token: { id: 10, uid: 219024871 }
                };
                server.respondWith('POST', serverUrl + "/users",
                    [200, {"Content-Type": "application/json"},
                        JSON.stringify(authResponse)] );
            });
            it('calls authorize and sets up the user appropriately', function () {
                // act
                user.init();
                server.respond();
                // assert
                expect(user.token.id).toBe(10);
                expect(user.token.uid).toBe(219024871);
            });
            it('calls oninitialized once configured', function () {
                var init;
                user.oninitialized = function (data) {
                    init = true;
                };
                // act
                user.init();
                server.respond();
                // assert
                expect(init).toBeTruthy();
            });
        });

        describe('.request', function () {
            var server;
            beforeEach(function () {
                server = sinon.fakeServer.create();
                var serverUrl = "http://www.sway.com";
                sway.serverUrl = serverUrl;

                var authResponse = {
                    token: { id: 10, uid: 219024871 },
                    channel: { name: "testChannel1"}
                };
                server.respondWith('POST', serverUrl + "/test",
                    [200, {"Content-Type": "application/json"},
                        JSON.stringify(authResponse)] );
            });
            it('returns a response', function () {
                var http = user.request(sway.serverUrl + "/test", "POST", {blah: 'blah'}, {
                });

                server.respond();
                expect(http).toBeDefined();
                expect(http.status).toBe(200);
            });

        })
    });
});