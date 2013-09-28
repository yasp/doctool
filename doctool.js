var fsLib = require('fs');
var pathLib = require('path');

/**
 *  Generates the documentation and returns the generated data as a simple HTML file.
 * @this {DocGenerator} - The generator that holds all the data required to generate the output data.
 * 
*/
function HTMLSimpleConverter() {
  var result = '';
  for (var i = 0; i < this.input.length; i++) {
    var entry = this.input[i];
    result += '<h1>' + entry.name + '</h1>';
    if (entry.params.length > 0) {
      result += "<h2>Parameters: ";
      var first = false;
      for (var j = 0; j < entry.params.length; j++) {
        var type = entry.params[j];
        if (first) {
          result += ", ";
        }
        result += type.type;
        first = true;
      }
      result += "</h2>";
    }
    
    result += '<p>' + entry.description + '</p>';
  }
  
  

  return '<meta charset="utf-8"> \
<html> \
  <head> \
    <title>yasp documentation</title> \
  </head> \
  <body>' + result + ' </body> \
</html>';
}

/**
 *  Generates the documentation and returns the generated data as a more complex HTML file.
 * @this {DocGenerator} - The generator that holds all the data required to generate the output data.
 * 
*/
function HTMLComplexConverter() {
  // TODO!
}

/**
 *  Generates the documentation and returns the generated data as CSV.
 * @this {DocGenerator} - The generator that holds all the data required to generate the output data.
 * 
*/
function CSVConverter() {
  // TODO!
}



/**
 * This class is responsible for handling all the documanting actions.
 * @constructor
*/
function DocGenerator(converter) {
  this.result = null;
  this.input = [];
  
}

/**
 * Loads the documentation that is located in path.
 * @param {(string|string[])} - The path of the documentatoin. If this is an array every element will be loaded. Paths are relative to the directory of the executing script. The file has to contain a well-formed yasp doc file, otherwise an exception is risen. If path is a directory it loads every file in this directory (recursively)
 * @param {DocGenerator-loadedCallback} - The callback function that is executed when loading is done.
*/
DocGenerator.prototype.load = function(path) {
  if (path instanceof Array) {
    for (var i = 0; i < path.length; i++) {
       this.load(path[i]);
    }
  } else {
    if (fsLib.statSync(path).isDirectory()) {
      var files = fsLib.readdirSync(path);

      for (var i = 0; i < files.length; i++) {
        this.load(pathLib.join(path, files[i]));
      }
    } else if (pathLib.extname(path) == '.js') {
      console.log('Load file '+path);
      var text = fsLib.readFileSync(path).toString();
      var loaded;
      try {
        loaded = JSON.parse(text);
      } catch (ex) {
        throw 'Invalid documentation "'+ex.toString()+'"';
      }
      if (!!loaded.commands) {
        this.input = this.input.concat(loaded.commands);
      } else {
        this.input.push(loaded);
      }
    }
  }
}

/**
 * @callback DocGenerator-loadedCallback
 * @this {DocGenerator} - The executing DocGenerator
*/


/**
 * Saves the documentation
 * @param {string} - Defines where the documentation should be saved
 * @param {DocGenerator-savedCallback} - The callback function that is executed when saving is done.
*/
DocGenerator.prototype.save = function(path, cb) {
  if (this.result.length == 0) cb('Convert not called (successfully) yet (result is null)', null);

  fsLib.writeFile(path, this.result, (function(err) {
    if (!!cb) cb(err, this.result);
  }));
}

/**
 * @callback DocGenerator-savedCallback
 * @this {DocGenerator} - The executing DocGenerator
*/


/**
 *  Converts the documentation and returns the converted data
 * @param {Converter} - The converter that should be used to convert
*/
DocGenerator.prototype.convert = function(converter) {
  if (this.input.length == 0) throw 'No data loaded';
  
  if (typeof converter == 'function') {
    try {
      this.result = converter.call(this);
    } catch (ex) {
      throw 'Converting failed "'+ex.toString()+'"';
    }
  } else {
    this.result = null;
    throw 'Illegal converter argument.';  
  }
  return this.result;
}


// NodeJS Exports
exports.DocGenerator = DocGenerator;
exports.converters = {
  htmlsimple: HTMLSimpleConverter,
  htmlcomplex: HTMLComplexConverter,
  csv: CSVConverter
};

