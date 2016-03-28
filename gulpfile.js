/**
 * Created by Jim Ankrom on 2/21/2016.
 */
var gulp = require('gulp'),
    concat = require('gulp-concat'),
    karma = require('karma').Server,
    uglify = require('gulp-uglify'),
    bower = require('gulp-bower');


// TODO: Create a build task for api

/* TODO: define sway modules clearer
 * core
 * users
 *      auth
 * channels
 *      plugins
 * output
 *      osc
 *      midi
 *      etc
 * system
 *      admin
 *      monitor
 *      other instrumentation?
 *
 */



function getAPISource(gulp) {
    gulp.src([
        'api/sway.api.js',

    ]);
}


//
//function getSrc() {
//    return gulp
//        .src([
//            'package/toolbox.head.js',
//            'src/tools/multicast.js',
//            'src/tools/lifecycle.js',
//            'src/tools/observe.js',
//            'package/exports.js',
//            'package/toolbox.foot.js'
//        ]);
//}
//
//gulp.task('build-dev', function () {
//    return getSrc()
//        .pipe(concat('toolbox.js'))
//        .pipe(gulp.dest('dist/'))
//});
//
//gulp.task('build-dev-test', ['build-dev'], function (done) {
//    new karma({
//        configFile: __dirname + '/karma.conf.js',
//        singleRun: true
//    }, done).start();
//});
//
//gulp.task('minify-js', function () {
//    return getSrc()
//        .pipe(concat('toolbox.min.js'))
//        .pipe(uglify())
//        .pipe(gulp.dest('dist/'))
//});
//
//gulp.task('build-test', ['minify-js'], function (done) {
//    new karma({
//        configFile: __dirname + '/karma.conf.js',
//        singleRun: true
//    }, done).start();
//});
//
//gulp.task('generate-node-module', function () {
//    return gulp
//        .src([
//            'src/tools/multicast.js',
//            'src/tools/tools.exports.js',
//            'src/cosinedesign.toolbox.js',
//            'src/cosinedesign.mixins.*.js'
//        ])
//        .pipe(concat('index.js'))
//        .pipe(uglify())
//        .pipe(gulp.dest('dist/'))
//});
//
//gulp.task('register-bower', function() {
//    return bower({ cmd: 'register'});
//});