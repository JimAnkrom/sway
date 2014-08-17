/**
 * Created by Jim Ankrom on 8/13/2014.
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

require.config({
    // Karma serves files under /base, which is the basePath from your config file
    'baseUrl': '/base',

    // Paths for require modules
    'paths': {
        // App Under Test
        'sway': 'ui/scripts/sway.input',
        'sway.user': 'ui/scripts/sway.user',
        // Libraries
        'sinon': 'test/bower_components/sinonjs/sinon'
    },

    'shim': {
        'sway': {
            'exports': 'sway'
        },
        'sway.user': {
            'exports': 'sway.user'
        },
        'sinon': {
            'exports': 'sinon'
        }
    },

    // dynamically load all test files
    'deps': allTestFiles,

    // we have to kickoff jasmine, as it is asynchronous
    'callback': window.__karma__.start
});
