/**
 * Created by Jim Ankrom on 8/13/2014. Config for Karma for testing with Jasmine
 */
module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '..', // Base path is root of project

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        // included: false means you want to load them manually (eg, using require)
        files: [
            'test/test.main.js',
            {pattern: 'test/lib/**/*.js', included: false},
            {pattern: 'test/scripts/*.js', included: false},
            {pattern: 'ui/scripts/**/*.js', included: false}
        ],

        // list of files to exclude
        exclude: ['test/scripts/api/*.js'],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {

        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress'],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['PhantomJS'],

        // plugins
        plugins: [
            'karma-jasmine','karma-sinon','karma-phantomjs-launcher'
        ],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false
    });
};
