'use strict';

var path = require('path');
var async = require('async');
var doctool = require(path.join(__dirname, "..", "doctool.js"));

module.exports = function(grunt) {
  grunt.registerMultiTask('doctool', '', function() {
    var done = this.async();
    var config = this.data;
    var gen = new doctool.DocGenerator();

    async.waterfall(
      [
        function (cb) {
          gen.load(config.input, cb);
        },
        function (data, cb) {
          var converter = doctool.converters[config.converter];
          gen.convert(converter);
          gen.save(config.output, cb);
        }
      ],
      function (err) {
        if(err) grunt.log.error(err);
        else grunt.log.writeln("Converting doc was successful");
    
        done();
      }
    );
  });
};
