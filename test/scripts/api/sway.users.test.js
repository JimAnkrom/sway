/**
 * Created by Jim Ankrom on 8/13/2014.
 * Using nodeunit because requirejs and commonjs and karma and jasmine and all the other cool tools just won't play nice together, so we have this awful thing
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
var users = require('../../../api/sway.users.js');

exports.tests = {
    Users: function (test) {
        test.ok(users);
        test.ok(users.findAll);
        test.done();
    },
    Users_FindAll_IsExposed: function (test) {
        test.ok(users.findAll, JSON.stringify(users));
        test.done();
    },
    Users_FindById_IsExposed: function (test) {
        test.ok(users.findById, JSON.stringify(users));
        test.done();
    },
    Users_AddUser_IsExposed: function (test) {
        test.ok(users.createUser);
        test.done();
    },
    Users_FindAll_ReturnsList: function (test) {
        // arrange
        users.clear();
        // act
        users.createUser(referenceUser());
        users.createUser(referenceUser2());
        users.createUser(referenceUser());
        users.createUser(referenceUser2());
        users.createUser(referenceUser());
        users.createUser(referenceUser2());
        var userList = users.findAll();
        // assert
        test.equals(userList.length, 6, "UserList was " + userList.length);
        test.done();
    },
    Users_FindById_ReturnsCorrectUser: function (test) {
        users.clear();
        var token1 = users.createUser(referenceUser());
        var token2 = users.createUser(referenceUser2());
        var token3 = users.createUser(referenceUser());
        // act
        var user = users.findById(token2.id);
        // assert

        test.equals(user.id, token2.id, "User was " + JSON.stringify(user));
        test.done();
    }
};