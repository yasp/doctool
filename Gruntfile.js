'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    doctool: {
      default: {
        converter: "htmlsimple",
        input: "doc",
        output: "doc/htmlsimple/doc.html",
      },
    },
  });

  grunt.loadTasks('tasks');

  grunt.registerTask('test', [ 'doctool' ]);
};
