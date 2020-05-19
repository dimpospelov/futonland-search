var fs = require('fs'),
	path = require('path'),
	csv = require('fast-csv'),
	ConstructorIO = require('constructorio'),
	updateKeywords = require('./keywords.js');


module.exports = function() {

	var constructorio = new ConstructorIO({
		apiToken: "jO0lkOIKXAkWQniCb0Bz", 
		apiKey: "anbtAGy3ebXPRjpKaP8b"
	});

	constructorio.verify(function(error, response) {
		if (error) {
			console.log(error.message);
		} else {
			console.log(response.message);
		}
	});


	var directory = 'tmp';
	var prefix = 'products';
	var files = fs.readdirSync(directory);
	var dates = [];

	for (var i=0; i<files.length; i++) {
		if (files[i].substring(0, 8) == prefix) {
			dates.push(parseInt(files[i].substring(9, 23)));
		}
	}

	var currentDate = Math.max.apply(null, dates);
	var previousDate = Math.min.apply(null, dates);

	var currentImport = [];
	var previousImport = [];

	function convertFiles() {
		convert(prefix+'-'+currentDate+'.csv', function(returnValue) {
			currentImport = returnValue;

			convert(prefix+'-'+previousDate+'.csv', function(returnValue) {
				previousImport = returnValue;
				compareFiles();
			});
		});
	}
	convertFiles();


	function compareFiles() {
		//updateKeywords(currentImport); // all products
		for (var i=0; i<currentImport.length; i++) {

			for (var j=0; j<previousImport.length; j++) {

				if (currentImport[i]['Id'] == previousImport[j]['Id']) {

					if (currentImport[i]['Term'] == previousImport[j]['Term'] &&
						currentImport[i]['Description'] == previousImport[j]['Description'] &&
						currentImport[i]['Url'] == previousImport[j]['Url'] &&
						currentImport[i]['Image Url'] == previousImport[j]['Image Url']) {
						currentImport.splice(i, 1);
					}

					previousImport.splice(j, 1);
					i--;
					j--;
					break;
				}
			}
		}
		// updateKeywords(currentImport); // new products
		uploadFeeds();
	}


	function uploadFeeds() {

		console.log('Removing '+previousImport.length+' items');
		console.log('Adding and updating '+currentImport.length+' items');

		var limit = 1000;

		function removeLoop() {

			if (previousImport.length) {

				var removeItems = [];
				for (var i=0; i<previousImport.length; i++) {
					if (i<limit) {
						removeItems.push({
							id: previousImport[i]['Id']
						});
					}
				}

				constructorio.removeItemBatch(
				{
					items: removeItems,
					section: "Products"
				},
				function(err, res) {
					if (err) {
						console.log(err.message);
					}
					else {
						console.log(removeItems.length+' items removed successfully');
					}

					if (previousImport.length > limit) {
						previousImport.splice(0,limit);
						setTimeout((function() {
							removeLoop();
						}), 1000);
					}
					else {
						addUpdateLoop();
					}
				}
				);

			}
			else {
				addUpdateLoop();
			}

		}
		removeLoop();


		function addUpdateLoop() {

			if (currentImport.length) {

				var addUpdateItems = [];
				for (var i=0; i<currentImport.length; i++) {
					if (i<limit) {
						addUpdateItems.push({
							id: currentImport[i]['Id'], 
							item_name: currentImport[i]['Term'], 
							description: currentImport[i]['Description'],
							url: currentImport[i]['Url'], 
							image_url: currentImport[i]['Image Url'],
							keywords: currentImport[i]['Keywords']
						});
					}
				}

				constructorio.addOrUpdateItemBatch(
				{
					items: addUpdateItems,
					section: "Products"
				},
				function(err, res) {
					if (err) {
						console.log(err.message);
					}
					else {
						console.log(addUpdateItems.length+' items added and updated successfully');
					}

					if (currentImport.length > limit) {
						currentImport.splice(0,limit);
						setTimeout((function() {
							addUpdateLoop();
						}), 1000);
					}
					else {
							removeFiles();
						}
					}
					);
			}
			else {
				removeFiles();
			}
		}
	}


	function removeFiles() {
		fs.unlink(path.resolve(__dirname, directory, prefix+'-'+currentDate+'.csv'), function(err) {
			if (err) return console.log(err);

			console.log(prefix+'-'+currentDate+'.csv removed from the files folder');

			fs.unlink(path.resolve(__dirname, directory, prefix+'-'+previousDate+'.csv'), function(err) {
				if (err) return console.log(err);

				console.log(prefix+'-'+previousDate+'.csv removed from the files folder');
			});
		});
	}


	function convert(file, callback) {
		var thisImport = [];

		fs.createReadStream(path.resolve(__dirname, directory, file))
			.pipe(csv.parse({ 
				headers: true,
				delimiter: '\t',
				quote: null
			}))
			.transform(function(data){

				var regExp = new RegExp('(.*) by (.*)', 'i');
				var product_title_clean = regExp.exec(data['Title']);
				if (product_title_clean) {
					data['Title'] = product_title_clean[1];
				}

				newData = {};
				newData['Id'] = data['Merchant Product ID'];
				newData['Term'] = data['Title'].replace("[", "").replace("]", "");
				newData['Description'] = data['Brand/Manufacturer'];
				newData['Url'] = data['Product URL'].replace("http://", "https://");
				newData['Image Url'] = data['Image URL'].replace("http://", "https://").replace("/main/", "/thumb/");
				newData['Keywords'] = [ data['Merchant Product ID'], data['Manufacturer Part #'], data['Brand/Manufacturer'] ];
				return newData;

			})
			.on('error', error => console.error(error))
			.on('data', row => thisImport.push(row))
			.on('end', rowCount => {
				console.log("Parsed "+rowCount+" rows from "+file);
				callback(thisImport);
			});

	}

}