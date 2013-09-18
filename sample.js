var doctool = require('./doctool_module');

var gen = new doctool.DocGenerator();
gen.load("doc/sampledoc.js", function() {
	this.convert(gen.converter.htmlsimple);
	this.save("htmlsimple/doc.html", function() {
		console.log("Converting doc was successful");
	});
});
