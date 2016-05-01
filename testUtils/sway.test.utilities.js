/**
 * Created by cosinezero on 4/24/2016.
 */

module.exports = {
    fakes: {
        response: function (statusCallback, jsonCallback) {
            return {
                status: function (code) {
                    statusCallback(code);
                    return {
                        json: jsonCallback
                    }
                },
                cookie: function (name, value) {}
            };
        },
        user: function (options) {
            options = options || {};
            return {
                id: options.id || 1
            };
        }
    }
}