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




});
