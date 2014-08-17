/*
 * optimize all client-size files for sway user control app
 *
 */

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        concat: {
            options: {
                stripBanners: true
            },
            js: {
                options: {
                    separator: ";"
                },
                src: ["scripts/sway.input.js", "scripts/sway.user.js"],
                dest: "<%= pkg.name %>.concat.js"
            }
//            css: {
//                src: ["css/*.css"],
//                dest: "<%= pkg.name %>.concat.css"
//            }
        },
        uglify: {
            build: {
                src: "<%= pkg.name %>.concat.js",
                dest: "../dist/scripts/<%= pkg.name %>.user.min.js"
            }
        },
        cssmin: {
            build: {
                src: "css/<%= pkg.name %>.user.css",
                dest: "../dist/css/<%= pkg.name %>.user.min.css"
            }
        },
        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    "../dist/user.min.html": "user.html"
                }
            }
        },
        clean: ["<%= pkg.name %>.concat.js", "<%= pkg.name %>.concat.css"]
    });

    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-contrib-htmlmin");
    grunt.loadNpmTasks("grunt-contrib-clean");

    grunt.registerTask("default", ["concat", "uglify", "cssmin", "htmlmin", "clean"]);

};