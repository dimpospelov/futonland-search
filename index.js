var fs = require ('fs'),
	Ftp = require('ftp'),
	ConstructorIO = require('constructorio');


var ftp_user = "constructorio";
var ftp_pass = "XFSrd0UFZSzG";


var ftp = new Ftp();
ftp.on('ready', function() {
	// ftp.list((err, list) => {
	// 	if (err) throw err;
	// 	console.dir(list);
	// 	// ftp.end();
	// });

    ftp.get('public_html/constructorio/constructorio_feed.txt', (err, stream) => {
      if (err) throw err;
      stream.once('close', function() { 


	fs.readdir('app', function (err, files) {
	    //handling error
	    if (err) {
	        return console.log('Unable to scan directory: ' + err);
	    } 
	    //listing all files using forEach
	    files.forEach(function (file) {
	        // Do whatever you want to do with the file
	        console.log(file); 

			var stats = fs.statSync(file)
			var fileSizeInBytes = stats["size"]
			//Convert the file size to megabytes (optional)
			var fileSizeInMegabytes = fileSizeInBytes / 1000000.0
			console.log('file size' + fileSizeInMegabytes);

	    });
	});


      });
      stream.pipe(fs.createWriteStream('constructorio_feed.txt'));




    });
});

ftp.connect({
	host: "feeds.futonland.com",
	port: 21,
	user: ftp_user,
	password: ftp_pass
});



// var constructorio = new ConstructorIO({
// 	apiToken: "jO0lkOIKXAkWQniCb0Bz", 
// 	apiKey: "anbtAGy3ebXPRjpKaP8b"
// });


// constructorio.verify(function(error, response) {
//   if (error) {
//     console.log("Error: ", error);
//   } else {
//     console.log("Response: ", response);
//   }
// });



// const Ftp = new jsftp({
//   host: "feeds.futonland.com",
//   port: 21,
//   user: ftp_user,
//   pass: ftp_pass
// });

// Ftp.auth(ftp_user, ftp_pass, (err, res) => {
// 	if (err) return console.error(err.message);
// });

// Ftp.ls("public_html", (err, res) => {
//   res.forEach(file => console.log(file.name));
// });

// Ftp.get("public_html/constructorio_feed2.txt", "files/constructorio_feed.txt", err => {
//   if (err) return console.error(err.message);
//   console.log("File copied successfully!");
// });

// Ftp.raw("quit", (err, data) => {
//   if (err) {
//     return console.error(err);
//   }
 
//   console.log("Bye!");
// });

