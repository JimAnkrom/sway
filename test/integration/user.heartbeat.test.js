/**
 * Created by cosinezero on 4/29/2016.
 */
var chai = require('chai'),
//var chaiHttp = require('chai-http');
    utils = require('../../testUtils/sway.test.utilities'),
    sway = require('../../api/core/sway.core');

var expect = chai.expect,
    server = require('../../api/users/sway.server')(sway),
    fakeResponse = utils.fakes.response;

describe('User Heartbeat', function() {
    afterEach(function () {
        sway.channelControl.clear();
        sway.users.clear();
    });

    it('returns state changes', function () {
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

        expect(response.token).to.exist;
        // get token from response
        var heartbeatReq = {
            body: {
                token: response.token,
                state: {
                    transition: 'calibrate'
                }
            }
        };

        response = null;

        res = fakeResponse(function () {}, function (resp) {
            response = resp;
        });
        // then perform our action then heartbeat

        sway.auth.authenticate(heartbeatReq, res, next);
        sway.workflowController.action(req, res, next);
        sway.server.heartbeat(heartbeatReq, res, next);
        sway.server.finalizeUserResponse(req, res);


        expect(response.token).to.exist;
        expect(response.token.uid).to.exist;
        expect(response.token.stamp).to.exist;

        console.log(response);
    });
});