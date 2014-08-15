/**
 * Created by Jim Ankrom on 8/13/2014.
 */

module.exports = (function () {
    var userList = [];
    var idList = [];
    var usersService = {
        findAll: function () {
            return userList;
        },
        addUser: function (options) {
            var id = Date.now();
            if (idList.indexOf(id) == -1) {
                idList.push(id);
                options.id = id;
                userList.push(options);
                return options;
            } else {
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

