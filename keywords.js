var fs = require('fs'),
    ConstructorIO = require('constructorio');

module.exports = function(currentImport) {

	var terms = [];
	var terms_array = [];

	var stopsymbols = [	"(", ")", ",", "$", "w/", "*" ];

	var stopwords = [ "", "-", "&", "w", "with", "and", "the", "for", "over", "pcs", "per", "yard", "ready", "Ready", "assemble", "Assemble", "to", "of", "in", "pc", "pcs" ];


	if (currentImport.length > 0) {
		explodeTerms();
	}


	function explodeTerms() {
		for (var i=0; i<currentImport.length; i++) {
			terms[i] = keywords(currentImport[i]['Term']);
		}

		countTerms();
	}


	function keywords(term,limit) {
		var keywords = [];
		keywords = filterKeywords(term.split(/[ \/]/));

		var phrases = [];
		//phrases.push(keywords[0]);
		phrases.push(keywords[0]+' '+keywords[1]);
		phrases.push(keywords[0]+' '+keywords[1]+' '+keywords[2]);

		return phrases;
	}


	function filterKeywords(keywords) {
		for (var i=0; i<keywords.length; i++) {
			for (var j=0; j<stopsymbols.length; j++) {
				if (keywords[i].indexOf(stopsymbols[j]) > -1) {
					//console.log(keywords[i]+'\t to replace');
					keywords[i] = keywords[i].replace(stopsymbols[j], '');
				}
			}
			for (var j=0; j<stopwords.length; j++) {
				if (keywords[i] == stopwords[j]) {
					//console.log(keywords[i]+'\t to remove');
					keywords.splice(i, 1);
				}
			}

		}
		
		return keywords;
	}


	function countTerms() {

		for (var i=0; i<terms.length; i++) {
			for (var j=0; j<terms[i].length; j++) {
				terms_array.push(terms[i][j].toLowerCase());
			}
		}
		//console.log(terms_array.length);

		var counts = {};
		terms_array.forEach( function(x) { 
			counts[x] = (counts[x] || 0)+1; 
		});

		return orderTerms(counts);
	}

	function orderTerms(counts) {

		var ordered = [];
		for (var prop in counts) {
			if (counts[prop] > 1) {
				counts[prop] = parseInt(counts[prop]/10);
				ordered.push([counts[prop],prop]);
			}
		}
		ordered = ordered.sort(function(a,b) {
			return a[0] > b[0];
		});
		console.log(ordered.length+" keywords generated...");
		//console.log(ordered);

		submitKeywords(ordered);
	}


	function submitKeywords(keywords) {

		var constructorio = new ConstructorIO({
			apiToken: "jO0lkOIKXAkWQniCb0Bz",
			apiKey: "anbtAGy3ebXPRjpKaP8b",
		});

		var limit = 1000;

		if (keywords.length) {

			var addUpdateItems = [];
			for (var i=0; i<keywords.length; i++) {
				if (i<limit) {
					addUpdateItems.push({
						item_name: keywords[i][1]
					});
				}
			}

			constructorio.addOrUpdateItemBatch(
				{
					items: addUpdateItems,
					section: "Search Suggestions"
				},
				function(err, res) {
					if (err) {
						console.log(err.message);
					}
					else {
						console.log('Keywords added and updated successfully');
					}

					if (keywords.length > limit) {
						keywords.splice(0,limit);
						submitKeywords(keywords);
					}
					else {
						return;
					}
				}
			);
		}
		else {
			return;
		}

	}

}