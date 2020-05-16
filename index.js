var fs = require ('fs'),
	Ftp = require('ftp'),
	constructor = require('./constructor.js');


var ftp_user = "constructorio";
var ftp_pass = "XFSrd0UFZSzG";


fs.mkdir('tmp', (err) => {
	if (err) throw err;
});


var ftp = new Ftp();
ftp.on('ready', function() {

    ftp.get('public_html/constructorio/constructorio_feed.txt', (err, stream) => {
      if (err) throw err;
      stream.once('close', function() { 

		var files = fs.readdirSync(__dirname + '/tmp');
		for (var i=0; i<files.length; i++) {
			console.log(files[i]);
		}
		
		constructor();
		ftp.end();

      });
      stream.pipe(fs.createWriteStream('tmp/products.txt'));

    });
});

ftp.connect({
	host: "feeds.futonland.com",
	port: 21,
	user: ftp_user,
	password: ftp_pass
});