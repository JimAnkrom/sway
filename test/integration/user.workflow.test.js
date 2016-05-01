/**
 * Created by cosinezero on 4/30/2016.
 */
var chai = require('chai'),
//var chaiHttp = require('chai-http');
    utils = require('../../testUtils/sway.test.utilities'),
    sway = require('../../api/core/sway.core');

var expect = chai.expect,
    server = require('../../api/users/sway.server')(sway),
    fakeResponse = utils.fakes.response;

describe('User Workflow', function() {
    // We need to "start" all users in a channel or queue
    xit('sets state to users in channel', function () {});
    xit('sets state to user', function () {});
    xit('sets state to user, which is communicated in heartbeat', function () {});
});