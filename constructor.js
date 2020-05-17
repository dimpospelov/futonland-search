var ConstructorIO = require('constructorio');


module.exports = function() {

	var constructorio = new ConstructorIO({
		apiToken: "jO0lkOIKXAkWQniCb0Bz", 
		apiKey: "anbtAGy3ebXPRjpKaP8b"
	});


	constructorio.verify(function(error, response) {
		if (error) {
			console.log("Error: ", error);
		} else {
			console.log("Response: ", response);
		}
	});

}