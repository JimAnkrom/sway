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
                tasks: ['karma'],
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
        karma: {
            unit: {
                configFile: 'karma.config.js'
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
        },
        "bower-install-simple": {
            options: {
                color: true
            },
            "prod": {
                options: {
                    production: true
                }
            },
            "dev": {
                options: {
                    production: false
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-bower-install-simple');
    grunt.registerTask('test_sway_ui', ['bower-install-simple', 'karma']);
    grunt.registerTask('test_sway_api', ['bower-install-simple', 'nodeunit']);
};