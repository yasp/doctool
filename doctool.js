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

    result += '<div class="command"';
    result += ' data-name="' + entry.name + '"';
    result += ' data-par-num="' + entry.params.length + '"';
    for (var j = 0; j < entry.params.length; j++) {
      result += ' data-par-' + j + '="' + entry.params[j].type + '"';
    }
    result += '>';

    result += '<h1>' + entry.name + '</h1>';
    if (entry.params.length > 0) {
      result += "<span class='params'>Parameter: ";
      result += "<ul>";
      var first = false;
      for (var j = 0; j < entry.params.length; j++) {
        var type = entry.params[j];
        result += "<li>";
        switch (type.type) {
          case "r_byte":
            result += "Byte-Register";
            break;
          case "r_word":
            result += "Word-Register";
            break;
          case "l_byte":
            result += "Byte-Literal";
            break;
          case "l_word":
            result += "Word-Literal";
            break;
          case "pin":
            result += "Pin";
            break;
          case "address":
            result += "Label";
            break;
          default:
            result += type.type;
        }
        result += "</li>";
      }
      result += "</ul>";
      result += "</span>";
    }

    for (var lang in entry.doc) {
      var val = entry.doc[lang];

      result += "<p class='lang_" + lang + "'>" + val.description + "</p>";

      result += "<ul class='flags' class='lang_" + lang + "'>";
      // Flags
      if (!!val.flags) {
        for (var flag in val.flags) {
          result += "<li class='flag'>";
          result += "<span class='name'>" + flag + "</span>: ";
          result += "<span class='condition'>" + val.flags[flag] + "</span>";
          result += "</li>";
        }
      }
      result += "</ul>";
    }

    result += '</div>';
  }
  
  

  return '<meta charset="utf-8"> \
<html> \
  <head> \
    <title>yasp documentation</title> \
  </head> \
  <body><div class="doctool">' + result + '</div></body> \
</html>';
}

/**
 * Puts all the commands into one JS file which is used by the emulator and assembler,
 * @this {DocGenerator} - The generator that holds all the data required to generate the output data.
 *
 */
function CommandsJsConverter() {
  var result = '';
  result = stringify(this.input);

  return 'if (typeof yasp == \'undefined\') yasp = { };\nyasp.commands = ' + result + ';\n';
}

// https://gist.github.com/cowboy/3749767#file-stringify-js
var stringify = function(obj, prop) {
  var placeholder = '____PLACEHOLDER____';
  var fns = [];
  var json = JSON.stringify(obj, function(key, value) {
    if (typeof value === 'function') {
      fns.push(value);
      return placeholder;
    }
    return value;
  }, 2);
  json = json.replace(new RegExp('"' + placeholder + '"', 'g'), function(_) {
    return fns.shift();
  });
  return json;
};

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
        text = "loaded=" + text;
        eval(text);
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
  commandsjs: CommandsJsConverter,
  htmlcomplex: HTMLComplexConverter,
  csv: CSVConverter
};

