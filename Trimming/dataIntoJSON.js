$(window).load(function() {

	$.get("custom.geo.json", function (response) {
		var f = response;

		$.get("spanish-HDI.json", function (response) {
			var g = response;
			/*The following loops thorugh both objects and inserts the index data from HDI.json to the relevant country in custom.geo.json*/

			for (i in f.features){
				var name = f.features[i].properties.name;
				// alert(name);
				for (k in g.countries) {
				var testName = g.countries[k].english_name;
				if (name == testName){
					for (s in g.countries[k]){
						alert('succes');
						// f.features[i].properties = {
						// 	name: g.countries[k].name,
						// 	english_name: g.countries[k].english_name,
						// }
						f.features[i].properties.name = g.countries[k].name;
						f.features[i].properties.english_name = g.countries[k].english_name;
					}
				}
				// else continue;
				}
			}

	//$(".output").html(result);
	 $(".output").html(JSON.stringify(f, null, " "));


		}, 'json');
	}, 'json');


});