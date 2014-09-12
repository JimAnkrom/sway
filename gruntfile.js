/**
 * Created by Michael Dewberry on 9/12/2014.
 *
 */
module.exports = function(grunt) {  
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        subgrunt: {
            options: {
                "limit": 1 // CPU limit of one to force projects to be grunted in order
            },
            sway: {
                "api": [ "default" ],
                "ui": [ "default" ],
                "test": [ "test_sway_ui", "test_sway_api" ]
            }
        },
    });

    grunt.loadNpmTasks("grunt-subgrunt");

    grunt.registerTask("default", [ "subgrunt" ]);
};
