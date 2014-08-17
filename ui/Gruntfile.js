/*
 * concatenates, minifies, and cleans up all html/css/js
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
                src: ["scripts/*.js"],
                dest: "<%= pkg.name %>.concat.js"
            },
            css: {
                src: ["css/*.css"],
                dest: "<%= pkg.name %>.concat.css"
            }
        },
        uglify: {
            options: {
                banner: "/*! <%= pkg.name %> - processed <%= grunt.template.today('yyyy-mm-dd') %> */\n"
            },
            build: {
                src: "<%= pkg.name %>.concat.js",
                dest: "dist/scripts/<%= pkg.name %>.min.js"
            }
        },
        cssmin: {
            options: {
                banner: "/*! <%= pkg.name %> - processed <%= grunt.template.today('yyyy-mm-dd') %> */\n"
            },
            build: {
                src: "<%= pkg.name %>.concat.css",
                dest: "dist/css/<%= pkg.name %>.min.css"
            }
        },
        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    "dist/admin.min.html": "admin.html"
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