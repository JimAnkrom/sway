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
//                var users = {
//                    init: function () {
//                        // go get json from server
//                          this.usersJson = {{server response}}
//                    }
//                };
//            });
            });
            it('parses the json data and assigns to var usersData', function () {
                var mockServer = sinon.fakeServer.create();
                mockServer.respondWith('http://sway:81334/users', [200, {"Content-Type": "application/json"}, usersJson]);

                var users = {
                    init: function () {
                        var httpRequest = new XMLHttpRequest();
                        httpRequest.open('get', 'http://sway:81334/users', true);
                        httpRequest.send();
                        mockServer.respond();

                        if (XMLHttpRequest.DONE && httpRequest.status === 200) {
                            this.loadUsers(httpRequest.responseText);
                        }
                    },
                    loadUsers: function (responseText) {
                        this.usersData = JSON.parse(responseText)
                    }
                };
                users.init();
                expect(users.usersData.length).toBe(5);
                console.log(users.usersData[4].id);

            });
        });

        describe('the objects in users.userData represent connected users on the server', function () {
            it('each will contain a user id and userAgent', function () {
                var mockServer = sinon.fakeServer.create();
                mockServer.respondWith('http://sway:81334/users', [200, {"Content-Type": "application/json"}, usersJson]);

                var users = {
                    init: function () {
                        var httpRequest = new XMLHttpRequest();
                        httpRequest.open('get', 'http://sway:81334/users', true);
                        httpRequest.send();
                        mockServer.respond();

                        if (XMLHttpRequest.DONE && httpRequest.status === 200) {
                            this.loadUsers(httpRequest.responseText);
                        }
                    },
                    loadUsers: function (responseText) {
                        this.usersData = JSON.parse(responseText)
                    }
                };
                users.init();

                expect(users.usersData[0].id).toBeDefined;
                expect(users.usersData[0].userAgent).toBeDefined;
            });

        });

        xdescribe('the view object', function () {
            xit('iterates over the user list object to find each of the children', function () {
            });
            xit('displays each child on the page as a row in currentUsers', function () {
            });
        });
    });
});