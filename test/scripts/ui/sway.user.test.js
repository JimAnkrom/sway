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
        describe('.authorize', function () {
            var server;
            beforeEach(function () {
                server = sinon.fakeServer.create();
                var serverUrl = "http://www.sway.com";
                sway.serverUrl = serverUrl;

                var authResponse = {
                    user: {
                        id: 10,
                        agent: "Mozilla/5.0 (Linux; U; Android 2.3.4; en-us; T-Mobile myTouch 3G Slide Build/GRI40) AppleWebKit/533.1"
                    },
                    token: { id: 10, uid: 219024871 }
                };
                server.respondWith('POST', serverUrl + "/users",
                    [200, {"Content-Type": "application/json"},
                        JSON.stringify(authResponse)] );

            });
            it('calls the control server and responds to the callback', function () {
                var authuser, token;

                user.authorize(function (data) {
                    authuser = data.user;
                    token = data.token;
                });
                server.respond();

                expect(authuser.id).toBe(10);
                expect(token.uid).toBe(219024871);
            })
        });
        describe('.init', function () {
            var server;
            beforeEach(function () {
                server = sinon.fakeServer.create();
                var serverUrl = "http://www.sway.com";
                sway.serverUrl = serverUrl;

                var authResponse = {
                    user: {
                        id: 10,
                        agent: "Mozilla/5.0 (Linux; U; Android 2.3.4; en-us; T-Mobile myTouch 3G Slide Build/GRI40) AppleWebKit/533.1"
                    },
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
                expect(user.user.id).toBe(10);
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

    });
});