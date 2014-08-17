/**
 * Created by Jim Ankrom on 8/16/2014.
 *
 * GruntFile for Sway Test project to watch for changes on ui and api and run their respective unit tests
 *
 *
 */
module.exports = function(grunt) {
    grunt.initConfig({
        watch: {
            ui: {
                files: ['../ui/scripts/*.js','./scripts/ui/*.js'],
                tasks: ['jasmine:ui'],
                options: {
                    event: ['all']
                }
            },
            api: {
                files: ['../api/*.js','./scripts/api/*.js'],
                tasks: ['nodeunit'],
                options: {
                    event: ['all']
                }
            }
        },
        jasmine: {
            ui: {
                src: '../ui/scripts/sway*.js',
                options: {
                    specs: './scripts/ui/*.js'
                }
            }
        },
        nodeunit: {
            all: ['../test/scripts/api/*test.js'],
            options: {
                reporter: 'verbose',
                reporterOptions: {
                    output: 'outputdir'
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    //grunt.loadNpmTasks('grunt-contrib-jasmine-requirejs');
    grunt.registerTask('test_sway_ui', ['jasmine:ui']);
    grunt.registerTask('test_sway_api', ['nodeunit']);
};