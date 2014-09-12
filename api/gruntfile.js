module.exports = function(grunt) {  
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
    });

    // do nothing for now, just here so grunt-subgrunt can run npm install.

    grunt.registerTask("default", [ ]);
};
