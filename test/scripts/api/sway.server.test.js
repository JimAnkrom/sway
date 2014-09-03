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

// Move to an express mocks library
function StubResponse() {
    this.response = {};
    this.cookie= function (name, value) {};
    this.json = function (obj) {
        this.response = obj;
    };
};
function StubRequest(body, cookie) {
    this.body = body;
    this.cookies = function (name) {
        return JSON.stringify(cookie);
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
        swayServer.createUser(req, res);

        // assert
        test.ok(res.response.token.uid != null);
        test.ok(res.response.user.uid != null);
        test.ok(res.response.user.auth.uid != null);
        test.done();
    },
    Server_createUsers_ReturnsControlAuthForFirstUser: function (test) {
        // arrange
        var req1 = new StubRequest(referenceUser(), {});
        var res1 = new StubResponse();
        var req2 = new StubRequest(referenceUser2(), {});
        var res2 = new StubResponse();

        // act
        swayServer.reset();
        swayServer.createUser(req1, res1);
        swayServer.createUser(req2, res2);
        var auth1 = res1.response.user.auth;

        // assert
        test.equal(auth1.value, 'control', 'First user did not receive control auth!');
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
        swayServer.createUser(req1, res1);
        swayServer.createUser(req2, res2);
        var auth1 = res1.response.user.auth;
        var auth2 = res2.response.user.auth;

        // assert
        test.equal(auth1.value, 'control', 'First user did not receive control auth!');
        test.equal(auth2.value, 'queued');
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
        swayServer.createUser(req1, res1);
        swayServer.createUser(req2, res2);
        var result1 = res1.response;
        var result2 = res2.response;

        // assert
        test.notEqual(result1.token.uid, result2.token.uid, "Token uids were the same! " + result1.token.uid + ' and ' + result2.token.uid + '.');
        test.done();
    },
    Server_createUser_ReturnsToken: function (test) {
        var req1 = new StubRequest(referenceUser(), {});
        var res1 = new StubResponse();
        swayServer.reset();

        // act
        swayServer.createUser(req1, res1);
        test.ok(res1.response.token != null);

        // assert
        test.done();
    },
    Server_Control_SendsMessage: function (test) {
        var req1 = new StubRequest(referenceUser(), {});
        var res1 = new StubResponse();
        swayServer.reset();
        swayServer.createUser(req1, res1);

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

        swayServer.control(req2, res2);

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
