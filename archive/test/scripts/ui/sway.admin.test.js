define(['sinon', 'text!test/data/users.test.json'], function (sinon, usersJson) {

    describe('show a list of all users currently connected to the sway control server', function () {

        describe('the sample user data', function () {
            it('is loaded from requirejs correctly', function () {
                expect(usersJson).toBeDefined();
            });
            it('is loaded correctly', function () {
                var usersData = JSON.parse(usersJson);
                expect(usersData.length).toBe(5);
                expect(usersData[0].id).toBe(23);
            });
        });

        describe('the users object', function () {
            it('is an object which is instantiated when the admin page loads', function () {
                var users = {};
                expect(users).toBeDefined();
            });
            it('requests the sample user data from the server', function () {
                var mockServer = sinon.fakeServer.create();
                mockServer.respondWith('http://sway:81334/users', [200, {"Content-Type": "application/json"}, usersJson]);

                var users = {
                    getCurrent: function () {
                        var httpRequest = new XMLHttpRequest();
                        httpRequest.open('get', 'http://sway:81334/users', true);
                        httpRequest.send();
                        mockServer.respond();
                    }
                };
                expect(users.getCurrent()).toBe();

            });
            it('parses the json data and assigns to var usersData', function () {
                var mockServer = sinon.fakeServer.create();
                mockServer.respondWith('http://sway:81334/users', [200, {"Content-Type": "application/json"}, usersJson]);

                var users = {
                    getCurrent: function () {
                        var httpRequest = new XMLHttpRequest();
                        httpRequest.open('get', 'http://sway:81334/users', true);
                        httpRequest.send();
                        mockServer.respond();

                        if (XMLHttpRequest.DONE && httpRequest.status === 200) {
                            this.loadUsers(httpRequest.responseText);
                        }
                    },
                    loadUsers: function (responseText) {
                        this.currentUsers = JSON.parse(responseText)
                    }
                };
                users.getCurrent();
                expect(users.currentUsers.length).toBe(5);

            });
        });

        describe('the objects in users.userData represent connected users on the server', function () {
            it('each will contain a user id and userAgent', function () {
                var mockServer = sinon.fakeServer.create();
                mockServer.respondWith('http://sway:81334/users', [200, {"Content-Type": "application/json"}, usersJson]);

                var users = {
                    getCurrent: function () {
                        var httpRequest = new XMLHttpRequest();
                        httpRequest.open('get', 'http://sway:81334/users', true);
                        httpRequest.send();
                        mockServer.respond();

                        if (XMLHttpRequest.DONE && httpRequest.status === 200) {
                            this.loadUsers(httpRequest.responseText);
                        }
                    },
                    loadUsers: function (responseText) {
                        this.currentUsers = JSON.parse(responseText)
                    }
                };
                users.getCurrent();

                expect(users.currentUsers[0].id).toBeDefined;
                expect(users.currentUsers[0].userAgent).toBeDefined;
            });

        });

        describe('the admin object', function () {
            var mockServer = sinon.fakeServer.create();
            mockServer.respondWith('http://sway:81334/users', [200, {"Content-Type": "application/json"}, usersJson]);

            var users = { //talks to server for info about the users of a session
                getCurrent: function () {
                    var httpRequest = new XMLHttpRequest();
                    httpRequest.open('get', 'http://sway:81334/users', true);
                    httpRequest.send();
                    mockServer.respond();

                    if (XMLHttpRequest.DONE && httpRequest.status === 200) {
                        this.loadUsers(httpRequest.responseText);
                    }
                },
                loadUsers: function (responseText) {
                    this.currentUsers = JSON.parse(responseText)
                }
            };

            var admin = { //handles user data for presentation on the admin interface
                displayCurrent: function () {
                    users.getCurrent(); //get list of currently connected users and process for display
                    users.currentUsers.forEach(this.formatUser);
                },
                formatUser: function (user) {
                    //create table row for each user
                    console.log('<tr id="' + user.id + '"><td>' + user.id + '</td>' + '<td>' + user.userAgent + '</td></tr>');
                }
            };
            admin.displayCurrent();
            it('displays each child on the page as a row in currentUsers', function () {

            });
        });
    });
});