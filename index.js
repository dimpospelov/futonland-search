var fs = require ('fs'),
	jsftp = require("jsftp"),
	ConstructorIO = require('constructorio');

var constructorio = new ConstructorIO({
  apiToken: "jO0lkOIKXAkWQniCb0Bz", 
  apiKey: "anbtAGy3ebXPRjpKaP8b"
});

// constructorio.verify(function(error, response) {
//   if (error) {
//     console.log("Error: ", error);
//   } else {
//     console.log("Response: ", response);
//   }
// });

var ftp_user = "constructorio";
var ftp_pass = "XFSrd0UFZSzG";

const Ftp = new jsftp({
  host: "feeds.futonland.com",
  port: 21,
  user: ftp_user,
  pass: ftp_pass
});

Ftp.auth(ftp_user, ftp_pass, (err, res) => {
	if (err) return console.error(err.message);
});

Ftp.ls(".", (err, res) => {
  res.forEach(file => console.log(file.name));
});

Ftp.get("public_html/constructorio_feed2.txt", "files/constructorio_feed.txt", err => {
  if (err) return console.error(err.message);
  console.log("File copied successfully!");
});

// Ftp.raw("quit", (err, data) => {
//   if (err) {
//     return console.error(err);
//   }
 
//   console.log("Bye!");
// });

