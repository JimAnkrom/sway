/**
 * Created by Jim Ankrom on 8/13/2014.
 * Using nodeunit because requirejs and commonjs and karma and jasmine and all the other cool tools just won't play nice together, so we have this awful thing
 */

var referenceUser = { "id": 1, "userAgent": "Mozilla/5.0 (Linux; U; Android 2.3.4; en-us; T-Mobile myTouch 3G Slide Build/GRI40) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
        "position": {
            "latitude": 0,
            "longitude": 0,
            "accuracy": 1
        }};
var referenceUser2 = { "id": 2, "userAgent": "Mozilla/5.0 (Linux; U; Android 2.3.4; en-us; T-Mobile myTouch 3G Slide Build/GRI40) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
    "position": {
        "latitude": 0,
        "longitude": 0,
        "accuracy": 1
    }};
var users = require('../../../api/sway.users.js');

exports.tests = {
    testUsers: function (test) {
        test.ok(users);
        test.ok(users.findAll);
        test.done();
    },
    testUsersFindAll_IsExposed: function (test) {
        test.ok(users.findAll, JSON.stringify(users));
        test.done();
    },
    testUsersFindById_IsExposed: function (test) {
        test.ok(users.findById, JSON.stringify(users));
        test.done();
    },
    testUsersAddUser_IsExposed: function (test) {
        test.ok(users.addUser);
        test.done();
    },
    testUsersAddUser_ReturnsToken: function (test) {
        var token = users.addUser(referenceUser);
        test.ok(token);
        test.ok(token.id);
        test.done();
    },
    testUsersAddUsers_ReturnsDifferentToken: function (test) {
        // arrange
        users.clear();
        // act
        var token1 = users.addUser(referenceUser);
        var token2 = users.addUser(referenceUser2);
        var userList = users.findAll();
        // assert
        test.ok(token1);
        test.ok(token1.id);
        test.notEqual(token1.id, token2.id, "Token IDs were the same!");
        test.equals(userList.length, 2, "UserList was " + userList.length);
        test.done();
    },
    testUsersFindById_ReturnsCorrectUser: function (test) {
        users.clear();
        var token1 = users.addUser(referenceUser);
        var token2 = users.addUser(referenceUser2);
        var token3 = users.addUser(referenceUser);
        // act
        var user = users.findById(token2.id);
        // assert
        test.ok(token2);
        test.ok(token2.id);
        test.ok(user);
        test.equals(user.id, token2.id, "User was " + JSON.stringify(user));
        test.done();
    }
};


//
//describe('sway.users', function () {
//    it('supports commonJS module format', function () {
//        var usersModule = require('./sway.users');
//        expect(usersModule).toBeDefined();
//        expect(usersModule.addUser).toBeDefined();
//    });
//    it('exposes findAll', function () {
//        expect(users.findAll).toBeDefined();
//    });
//    it('exposes addUser', function () {
//        expect(users.addUser).toBeDefined();
//    });
//    xit('exposes findById', function () {
//        expect(users.findById).toBeDefined();
//    });
//    xit('exposes updateUser', function () {
//        expect(users.updateUser).toBeDefined();
//    });
//    xit('exposes deleteUser', function () {
//        expect(users.deleteUser).toBeDefined();
//    });
//
//    describe('users.addUser', function () {
//        var token;
//
//        beforeEach(function () {
//            token = users.addUser(referenceUser);
//        });
//
//        it('should return a result on add', function () {
//            expect(token).toBeDefined();
//            expect(token.id).toBeDefined();
//            console.log('User Id = ' + token.id);
//        });
//
//    });
//});
//
//
//
//
//
