/**
 * Created by Jim Ankrom on 4/24/2016.
 *
 *
 * Test of user creation flow
 *
 * http://mherman.org/blog/2015/09/10/testing-node-js-with-mocha-and-chai
 *
 */

var chai = require('chai'),
    //var chaiHttp = require('chai-http');
    utils = require('../../testUtils/sway.test.utilities'),
    sway = require('../../api/core/sway.core');

var expect = chai.expect,
    server = require('../../api/users/sway.server')(sway);

//chai.use(chaiHttp);

var fakeResponse = utils.fakes.response;

describe('Create User', function() {
    afterEach(function () {
        sway.channelControl.clear();
        sway.users.clear();
    });

    it('should exist', function () {
        expect(sway.workflowController).to.exist;
    });

    it('...creates user', function () {
        var response;
        var req = {
                body: {
                    uid: 1111
                },
                headers: {
                    "user-agent": 'fake browser'
                }
            },
            res = fakeResponse(function () {}, function (resp) {
                response = resp;
            }),
            next = function () {},
            initialState = sway.core.installation.initialState;

        sway.auth.createUser(req, res, next);
        sway.server.updateUserConfig(req, res, next);
        sway.workflowController.action(req, res, next);
        sway.server.finalizeUserResponse(req, res);

        expect(req.user.lastLogin).to.exist;
        expect(req.config).to.exist;
        expect(req.config.screen).to.exist;
        expect(response.token).to.exist;
        expect(response.config).to.exist;
        expect(response.config.screen).to.exist;
        expect(response.config.screen.size).to.exist;

        expect(req.user.state).to.exist;
        expect(req.user.state.name).to.equal(initialState);

        expect(response.state).to.exist;
        expect(response.state.name).to.equal(initialState);
        //expect(req.user.state.name).to.equal(initialState);
    });

    it('creates user token', function () {
        var response,
            req = {
                body: {
                    uid: 1111
                },
                headers: {
                    "user-agent": 'fake browser'
                }
            },
            res = fakeResponse(function () {}, function (resp) {
                response = resp;
            }),
            next = function () {},
            initialState = sway.core.installation.initialState;

        sway.auth.createUser(req, res, next);
        sway.server.updateUserConfig(req, res, next);
        sway.workflowController.action(req, res, next);
        sway.server.finalizeUserResponse(req, res);

        expect(response.token).to.exist;
        expect(response.token.uid).to.exist;
        expect(response.token.stamp).to.exist;
    });

    it('creates user state', function () {
        //workflow
        var req = {
                user: {}
            },
            res = {},
            next = function () {},
            initialState = sway.core.installation.initialState;

        sway.workflowController.action(req, res, next);

        expect(req.user.state).to.exist;
        expect(req.user.state.name).to.equal(initialState);
    });

    it('returns user state in the response', function () {
        //workflow
        var req = {
                user: {}
            },
            response = null,
            res = fakeResponse(function () {}, function (res) {
                response = res;
            }),
            next = function () {},
            initialState = sway.core.installation.initialState;

        sway.workflowController.action(req, res, next);

        expect(req.user.state).to.exist;
        expect(req.user.state.name).to.equal(initialState);

        sway.server.finalizeUserResponse(req, res);

        expect(response.state).to.exist;
        expect(response.state.name).to.equal(initialState);
    });

    it('assigns a channel, queues the next user, and reports each in response', function () {
        //workflow
        var req = {
                body: {
                    uid: 1111
                },
                headers: {
                    "user-agent": 'fake browser'
                }
            },
            req2 = {
                body: {
                    uid: 1112
                },
                headers: {
                    "user-agent": 'fake browser'
                }
            },
            req3 = {
                body: {
                    uid: 1113
                },
                headers: {
                    "user-agent": 'fake browser'
                }
            },
            response = null,
            res = fakeResponse(function () {}, function (res) {
                response = res;
            }),
            next = function () {},
            initialState = sway.core.installation.initialState;

        sway.auth.createUser(req, res, next);
        sway.server.finalizeUserResponse(req, res);
        expect(response.channel).to.exist;
        expect(response.queue).to.not.exist;

        sway.auth.createUser(req2, res, next);
        sway.server.finalizeUserResponse(req2, res);
        expect(response.queue).to.exist;
        expect(response.channel).to.not.exist;
        expect(response.queue.count).to.equal(0);

        sway.auth.createUser(req3, res, next);
        sway.server.finalizeUserResponse(req3, res);
        expect(response.queue).to.exist;
        expect(response.channel).to.not.exist;
        expect(response.queue.count).to.equal(1);
    });


    describe('Overflow Queue', function () {
        function heartbeat(req, res, next) {
            req.user = null;
            req.body.token = req.token;
            sway.auth.authenticate(req, res, next);
            sway.server.heartbeat(req, res, next);
            sway.server.finalizeUserResponse(req, res, next);
        }

        it('should notify the user of their position in the queue via heartbeat', function () {
            //workflow
            var req = {
                    body: {
                        token: {
                            uid: 1111
                        }
                    },
                    headers: {
                        "user-agent": 'fake browser'
                    }
                },
                req2 = {
                    body: {
                        token: {
                            uid: 1112
                        }
                    },
                    headers: {
                        "user-agent": 'fake browser'
                    }
                },
                req3 = {
                    body: {
                        token: {
                            uid: 1113
                        }
                    },
                    headers: {
                        "user-agent": 'fake browser'
                    }
                },
                response = null,
                res = fakeResponse(function () {}, function (res) {
                    response = res;
                }),
                next = function () {},
                initialState = sway.core.installation.initialState;

            sway.auth.createUser(req, res, next);
            sway.auth.createUser(req2, res, next);
            sway.auth.createUser(req3, res, next);

            expect(req3.user.queue.count).to.equal(1);

            sway.channelControl.remove(req.user.channel, req.user);

            req2.user = null;
            req2.body.token = req2.token;
            sway.auth.authenticate(req2, res, next);
            sway.server.heartbeat(req2, res, next);
            sway.server.finalizeUserResponse(req2, res, next);

            expect(response.queue).to.not.exist;
            expect(response.channel).to.exist;

            req3.user = null;
            req3.body.token = req3.token;
            sway.auth.authenticate(req3, res, next);
            sway.server.heartbeat(req3, res, next);
            sway.server.finalizeUserResponse(req3, res, next);

            expect(response.queue).to.exist;
            expect(response.queue.count).to.equal(0);
            expect(response.channel).to.not.exist;

            // then let's remove user 2 and make sure the queue goes away
            expect(sway.channelControl.overflowQueue.length).to.equal(1);
            sway.channelControl.remove(req2.user.channel, req2.user);
            expect(sway.channelControl.overflowQueue.length).to.equal(0);

            req3.user = null;
            req3.body.token = req3.token;
            sway.auth.authenticate(req3, res, next);
            sway.server.heartbeat(req3, res, next);
            sway.server.finalizeUserResponse(req3, res, next);

            expect(response.queue).to.not.exist;
            expect(response.channel).to.exist;
        });
        it('should strip out the expired users', function () {
            var req = utils.fakes.request(11),
                req2 = utils.fakes.request(12),
                req3 = utils.fakes.request(13),
                req4 = utils.fakes.request(14),
                req5 = utils.fakes.request(15),
                req6 = utils.fakes.request(16),
                req7 = utils.fakes.request(17),
                response = null,
                res = fakeResponse(function () {}, function (res) {
                    response = res;
                }),
                next = function () {};

            sway.auth.createUser(req, res, next);
            sway.auth.createUser(req2, res, next);
            sway.auth.createUser(req3, res, next);

            expect(req3.user.queue.count).to.equal(1);

            sway.channelControl.remove(req.user.channel, req.user);

            heartbeat(req2, res, next);

            expect(response.queue).to.not.exist;
            expect(response.channel).to.exist;

            sway.auth.createUser(req4, res, next);

            heartbeat(req3, res, next);

            expect(response.queue).to.exist;
            expect(response.queue.count).to.equal(0);
            expect(response.channel).to.not.exist;

            // then let's remove user 2 and make sure the queue goes away
            expect(sway.channelControl.overflowQueue.length).to.equal(2);
            sway.channelControl.remove(req2.user.channel, req2.user);
            expect(sway.channelControl.overflowQueue.length).to.equal(1);


            // Heartbeat for user 4
            heartbeat(req4, res, next);

            expect(response.queue).to.exist;
            expect(response.queue.count).to.equal(0);
            expect(response.channel).to.not.exist;

            heartbeat(req3, res, next);

            expect(response.queue).to.not.exist;
            expect(response.channel).to.exist;

            sway.auth.createUser(req5, res, next);
            sway.auth.createUser(req6, res, next);

            expect(sway.channelControl.overflowQueue.length).to.equal(3);

            heartbeat(req4, res, next);
            expect(response.queue).to.exist;
            expect(response.queue.count).to.equal(0);

            heartbeat(req5, res, next);
            expect(response.queue).to.exist;
            expect(response.queue.count).to.equal(1);

            heartbeat(req6, res, next);
            expect(response.queue).to.exist;
            expect(response.queue.count).to.equal(2);

            req4.user.expired = true;

            expect(sway.channelControl.overflowQueue.length).to.equal(3);
            sway.channelControl.remove(req3.user.channel, req3.user);
            expect(sway.channelControl.overflowQueue.length).to.equal(1);

            // Heartbeat for user 4 to get the expire to take
            heartbeat(req4, res, next);

            console.log(JSON.stringify(response));
            expect(response.queue).to.not.exist;
            expect(response.channel).to.not.exist;

            heartbeat(req5, res, next);
            expect(response.queue).to.not.exist;
            expect(response.channel).to.exist;

            heartbeat(req6, res, next);
            expect(response.queue).to.exist;
            expect(response.queue.count).to.equal(0);

        });
    });
});
