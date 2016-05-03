/**
 * Created by Jim Ankrom on 8/13/2014.
 *
 * Sway User Service
 * - Maintains list of users current on system
 * - Is the authority on uid generation.
 */
var _ = require('underscore');

module.exports = function (sway) {
    var config = sway.core.config;

// reload config references on change
    sway.core.attach('config', {
        onload: function () {
            config = sway.core.config;
        }
    });

    var userList = [];
    var idList = [];

    var usersService = sway.users = {
        cookie: 'sway-users',
        onUserExpired: null,
        onExpireUserBatch: null,
        onUserCreated: null,
        findAll: function () {
            return userList;
        },
        findById: function (id) {
            return _.find(userList, function (u) {
                return u.id == id;
            });
        },
        findByUid: function (uid) {
            return _.find(userList, function (u) {
                return u.uid == uid;
            });
        },
        // Expire / scavenge cache
        expire: function () {
            var i, u,
                len = userList.length,
                newUserList = [],
                expiredUserBatch = [],
                timeoutLower = Date.now() - config.users.timeout;

            for (i = 0; i < userList.length; i++) {
                u = userList[i];
                if (u.lastLogin && (u.lastLogin < timeoutLower)) {
                    if (usersService.onUserExpired) usersService.onUserExpired(u);
                    u.expired = true;
                    sway.log('Expiring user ' + u.uid, 'sway.users', 0);
                    expiredUserBatch.push(u);
                } else {
                    newUserList.push(u);
                }
            }
            if (usersService.onExpireUserBatch) usersService.onExpireUserBatch(expiredUserBatch);
            userList = newUserList;
        },
        // Add a user to the system. Should return the user.
        createUser: function (options) {
            this.expire();
            var timeNow = Date.now();
            var uid = options.uid || timeNow;
            // If this ever is on a multi-threaded system this could cause duplicate ids without a locking scheme.
            // Not super likely considering the use case, but these things keep me up at night.
            if (idList.indexOf(uid) == -1) {
                idList.push(uid);
                options.uid = uid;
                options.lastLogin = timeNow;
                var id = userList.push(options);
                options.id = id;
                if (usersService.onUserCreated) usersService.onUserCreated(options);
                return options;
            } else {
                // Try again to get a new datetime stamp, since we were lucky in our request and one already exists
                return this.createUser.call(this, options);
            }
        },
        clear: function () {
            userList = [];
            idList = [];
        }
    };
};