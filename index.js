var fs = require ('fs'),
	Ftp = require('ftp'),
	constructor = require('./constructor.js');


function zeroFill(i) {
	return (i < 10 ? '0' : '') + i;
}

var d = new Date();
d = d.getFullYear()
	+ zeroFill(d.getMonth() + 1)
	+ zeroFill(d.getDate())
	+ zeroFill(d.getHours())
	+ zeroFill(d.getMinutes())
	+ zeroFill(d.getSeconds());


var ftp = new Ftp();
ftp.on('ready', function() {

	if (!fs.existsSync('tmp')){	
		fs.mkdir('tmp', (err) => {
			if (err) throw err;
		});
	}

	ftp.list('feeds/search', (err, list) => {
		if (err) throw err;

		var filesProcessed = 0;
		list.forEach(function(file) {
			ftp.get('feeds/search/'+file.name, (err, stream) => {
				if (err) throw err;
				if (file.name=='products.csv') file.name = 'products-'+d+'.csv';

				stream.pipe(fs.createWriteStream('tmp/'+file.name));

				stream.once('close', function() { 
					filesProcessed++;
					if (filesProcessed==list.length) {
						return constructor();
					}					
				});
			});
		})
	});

});


ftp.connect({
	host: "feeds.futonland.com",
	port: 21,
	user: "constructorio",
	password: "XFSrd0UFZSzG"
});

