'use strict';

var path = require('path');
var async = require('async');
var doctool = require(path.join(__dirname, "..", "doctool.js"));

module.exports = function(grunt) {
  grunt.registerMultiTask('doctool', '', function() {
    var config = this.data;
    var done = this.async();
    
    try {
      var gen = new doctool.DocGenerator();
      gen.load(config.input);
      var converter = doctool.converters[config.converter];
      gen.convert(converter);
      gen.save(config.output, function (err) {
        if(err) throw err;
        grunt.log.writeln("Converting doc was successful");
        done();
      });
    }
    catch (err) {
      grunt.log.error(err);
    }
  });
};
