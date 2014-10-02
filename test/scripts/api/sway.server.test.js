/**
 * Created by Jim Ankrom on 8/23/2014.
 */
function referenceUser() {
    return { "id": 1, "userAgent": "Mozilla/5.0 (Linux; U; Android 2.3.4; en-us; T-Mobile myTouch 3G Slide Build/GRI40) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
        "position": {
        "latitude": 0,
            "longitude": 0,
            "accuracy": 1
    }};
};
function referenceUser2() {
    return { "id": 2, "userAgent": "Mozilla/5.0 (Linux; U; Android 2.3.4; en-us; T-Mobile myTouch 3G Slide Build/GRI40) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
        "position": {
            "latitude": 0,
            "longitude": 0,
            "accuracy": 1
        }};
};

var swayServer = require('../../../api/sway.server.js');
var swayAuth = require('../../../api/sway.auth.js');

// Move to an express mocks library
function StubResponse() {
    this.response = {};
    this.cookie= function (name, value) {};
    this.json = function (obj) {
        this.response = obj;
    };
    this.end = function () {};
};
function StubRequest(body, cookie) {
    this.body = body;
    this.cookies = function (name) {
        return JSON.stringify(cookie);
    }, 
    this.headers = {
        "user-agent": "Test User Agent"
    }
};

exports.tests = {
    Server_Exists: function (test) {
        test.ok(swayServer != null);
        test.ok(swayServer.control != null);
        test.done();
    },
    Server_createUser_ReturnsUser: function (test) {
        // arrange
        var req = new StubRequest({ name: "Jim" }, {});
        var res = new StubResponse();

        // act
        swayAuth.createUser(req, res, function () {});

        // assert
        test.ok(req.token.uid != null);
        test.ok(req.user.uid != null);
        test.done();
    },
    Server_createUser_ReturnsAssignedUser: function (test) {
        // arrange
        var req = new StubRequest({ name: "Jim" }, {});
        var res = new StubResponse();

        // act
        swayAuth.createUser(req, res, function () {});

        // assert
        test.ok(req.user.channel != null);
        test.ok(req.user.channel.name != null);
        console.log(req.user.channel.name);
        test.done();
    },
    Server_createUsers_ReturnsChannelForFirstUser: function (test) {
        // arrange
        var req1 = new StubRequest(referenceUser(), {});
        var res1 = new StubResponse();
        var req2 = new StubRequest(referenceUser2(), {});
        var res2 = new StubResponse();

        // act
        swayServer.reset();
        swayAuth.createUser(req1, res1, function () {});
        swayAuth.createUser(req2, res2, function () {});
        var channel = req1.user.channel;

        // assert
        console.log('User 1 Channel: ' + channel.name);
        console.log('User 2 Channel: ' + req2.user.channel.name);
        test.ok(channel.name != null, 'First user did not receive channel!');
        test.ok(req2.user.channel != null, 'Second user did not receive channel!');
        test.done();
    },
    Server_createUsers_ReturnsNoAuthForSecondUser: function (test) {
        // arrange
        var req1 = new StubRequest(referenceUser(), {});
        var res1 = new StubResponse();
        var req2 = new StubRequest(referenceUser2(), {});
        var res2 = new StubResponse();

        // act
        swayServer.reset();
        swayAuth.createUser(req1, res1, function () {});
        swayAuth.createUser(req2, res2, function () {});
        var channel = req1.user.channel;

        // assert
        test.ok(channel != null, 'First user did not receive channel!');
        test.ok(req2.user.channel != null, 'Second user did not receive channel!');

        test.ok(channel.name != req2.user.channel.name, 'Users were assigned same channel - ' + channel.name);
        test.done();
    },
    Server_createUsers_ReturnsDifferentToken: function (test) {
        // arrange
        var req1 = new StubRequest(referenceUser(), {});
        var res1 = new StubResponse();
        var req2 = new StubRequest(referenceUser2(), {});
        var res2 = new StubResponse();

        // act
        swayServer.reset();
        swayAuth.createUser(req1, res1, function () {});
        swayAuth.createUser(req2, res2, function () {});

        // assert
        test.notEqual(req1.token.uid, req2.token.uid, "Token uids were the same! " + req1.token.uid + ' and ' + req2.token.uid + '.');
        test.done();
    },
    Server_createUser_ReturnsToken: function (test) {
        var req1 = new StubRequest(referenceUser(), {});
        var res1 = new StubResponse();
        swayServer.reset();

        // act
        swayAuth.createUser(req1, res1, function () {});
        test.ok(req1.token != null);

        // assert
        test.done();
    },
    Server_Control_SendsMessage: function (test) {
        var req1 = new StubRequest(referenceUser(), {});
        var res1 = new StubResponse();
        swayServer.reset();
        swayAuth.createUser(req1, res1, function () {});

        // act
        var req2 = new StubRequest({
            token: res1.response.token,
            control: {
                rotation: {
                    alpha: 21,
                    beta: 30,
                    gamma: 0
                }
            }
        }, res1.response.cookie);
        var res2 = new StubResponse();

        swayServer.control(req2, res2, function () {});

        // assert
        test.done();
    }//,
//    Server_Administrate_SetsAuth: function (test) {
//        var req1 = new StubRequest(referenceUser(), {});
//        var res1 = new StubResponse();
//
//        swayServer.reset();
//        swayServer.createUser(req1, res1);
//        var initialAuth = res1.response.user.auth.value;
//        var req2 = new StubRequest(res1.response.token);
//        swayServer.administrate(req2, res1);
//
//        test.done();
//    }

};
