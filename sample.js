var doctool = require('./doctool');

var gen = new doctool.DocGenerator();
gen.load("doc", function(err, data) {
    if (!!err) throw err;
    
    gen.convert(doctool.converters.htmlsimple);
    gen.save("doc/htmlsimple/doc.html", function(err, data) {
        if (!!err) throw err;
        console.log("Converting doc was successful");
    });
});
