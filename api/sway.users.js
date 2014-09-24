/**
 * Created by Jim Ankrom on 8/13/2014.
 *
 * Sway User Service
 * - Maintains list of users current on system
 * - Is the authority on uid generation.
 */
var _ = require('underscore');
var userList = [];
var idList = [];

module.exports = (function () {

    var usersService = {
        findAll: function () {
            return userList;
        },
        findById: function (id) {
            return _.find(userList, function(u){
                return u.id == id;
            });
        },
        findByUid: function (uid) {
            return _.find(userList, function(u){
                return u.uid == uid;
            });
        },
        // Add a user to the system. Should return the user.
        createUser: function (options) {
            var uid = options.uid || Date.now();
            // If this ever is on a multi-threaded system this could cause duplicate ids without a locking scheme.
            // Not super likely considering the use case, but these things keep me up at night.
            if (idList.indexOf(uid) == -1) {
                idList.push(uid);
                options.uid = uid;
                var id = userList.push(options);
                options.id = id;
                return options;
            } else {
                // Try again to get a new datetime stamp, since we were lucky in our request and one already exists
                console.log("is this our loop?");
                return this.createUser.call(this, options);
            }
        },
        clear: function () {
            userList = [];
            idList = [];
        }
    };

    return usersService;
}());

