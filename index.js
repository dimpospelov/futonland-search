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

		if (list.length==1) {
			console.log('No products file found. Abort!');
			ftp.end();
		}

		var filesProcessed = 0;
		list.forEach(function(file) {
			ftp.get('feeds/search/'+file.name, (err, stream) => {
				if (err) throw err;
				if (file.name=='products.csv') file.name = 'products-'+d+'.csv';

				stream.pipe(fs.createWriteStream('tmp/'+file.name));

				stream.once('close', function() { 
					filesProcessed++;
					if (filesProcessed==list.length) {
						return constructor( () => {
							cleanup();
						});
					}					
				});
			});
		})
	});

	function cleanup() {

		var filesProcessed = 0;
		ftp.list('feeds/search', (err, list) => {
			if (err) throw err;
	
			var filesProcessed = 0;
			list.forEach(function(file) {
				if (file.name=='products.csv') {
					ftp.rename('feeds/search/'+file.name, 'feeds/search/products-'+d+'.csv', (err) => {
						if (err) throw err;
						console.log('Latest push: products-'+d+'.csv');
					});
				}
				else if (file.name=='products-'+d+'.csv') {
					return;
				}
				else {
					ftp.delete('feeds/search/'+file.name, (err) => {
						if (err) throw err;
						console.log('Removed: '+file.name);
					});
				}

				filesProcessed++;
				if (filesProcessed==list.length) {
					console.log('Process complete.');
					ftp.end();
				}

			})
		});

	}

});


ftp.connect({
	host: "feeds.futonland.com",
	port: 21,
	user: "constructorio",
	password: "XFSrd0UFZSzG"
});

