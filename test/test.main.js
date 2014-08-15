/**
 * Created by cosinezero on 8/13/2014.
 */
var allTestFiles = [];
var TEST_REGEXP = /(spec|test)\.js$/i;

var pathToModule = function(path) {
    return path.replace(/^\/base\//, '').replace(/\.js$/, '');
};

Object.keys(window.__karma__.files).forEach(function(file) {
    if (TEST_REGEXP.test(file)) {
        // Normalize paths to RequireJS module names.
        allTestFiles.push(pathToModule(file));
    }
});

//require.config({
//    // Karma serves files under /base, which is the basePath from your config file
//    'baseUrl': '/base',
//
//    // Paths for require modules
//    'paths': {
//        // system under test
//        // app
//        'sway.users': 'api/sway.users',
//
//        // Libraries
//        'sinon': 'test/lib/sinon-1.10.2',
//        'underscore': 'api/node_modules/underscore/underscore'
//    },
//
//    'shim': {
//        'sway.users': {
//            'exports': 'swayUsersApi'
//        },
//        'sinon': {
//            'exports': 'sinon'
//        }
//    },
//
//    // dynamically load all test files
//    'deps': allTestFiles,
//
//    // we have to kickoff jasmine, as it is asynchronous
//    'callback': window.__karma__.start
//});
