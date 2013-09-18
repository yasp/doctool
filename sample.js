var doctool = require('./doctool');

var gen = new doctool.DocGenerator();
gen.load("doc", function() {
	this.convert(doctool.converters.htmlsimple);
	this.save("doc/htmlsimple/doc.html", function() {
		console.log("Converting doc was successful");
	});
});
