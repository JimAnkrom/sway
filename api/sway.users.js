/**
 * Created by Jim Ankrom on 8/13/2014.
 *
 * Sway User Service
 * - Maintains list of users current on system
 *
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
            for (var i=0; i < userList.length; i++)
            {
                var user = userList[i];
                if (user.id==id) {
                    return user;
                }
            }
        },
        // Add a user to the system. Should return the user.
        addUser: function (options) {
            var id = Date.now();
            // If this ever is on a multi-threaded system this could cause duplicate ids without a locking scheme.
            // Not super likely considering the use case, but these things keep me up at night.
            if (idList.indexOf(id) == -1) {
                idList.push(id);
                options.uid = id;
                userList.push(options);
                options.id = idList.length;
                return options;
            } else {
                // Try again to get a new datetime stamp, since we were lucky in our request and one already exists
                return this.addUser.call(this, options);
            }
        },
        clear: function () {
            userList = [];
            idList = [];
        }
    };

    return usersService;
}());

