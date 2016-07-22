
/**********Initialize Map**********
*******************************/

var map = L.map('map'); 

/* Loads map from MapBox:*/
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'yodio.0f6dbf50',
    accessToken: 'pk.eyJ1IjoieW9kaW8iLCJhIjoiY2lsM3c2OXQ5M3NqcXYybTNlNnY1bHN2cCJ9.hRndoB1yovuwoufn6kFQ6Q'
}).addTo(map);

/**********GEOLOCATION**********
*******************************/
$.get(
	"https://ipinfo.io?token=5d7acd7d74a25e", 
	function(response) {
		countryCode = response.country;
		latlng = response.loc; //latlng is returned in the format "lat,long" without a space after a comma. There must be a space to work correctly. 
		comma = latlng.indexOf(',');
		lat = latlng.substring(0, comma);
		long = latlng.substring(comma + 1, latlng.length);
		map.setView([lat, long], 4);

		L.marker([lat, long]).addTo(map).bindPopup(chosen_language.your_location).openPopup();
}, "jsonp");


/*******************************
*******************************/


/**********Info - Hover**********
*******************************/
var info =L.control();

info.onAdd = function (map) { 
	this._div = L.DomUtil.create('div', 'info'); //Create div with class info
	this.update();
	return this._div;
};

info.update = function (props) { //Content that populates info based on hovering location
	this._div.innerHTML = '<h4>' + chosen_language.HDI_rank_label + '</h4>' + (props ? 
		'<b>' + props.name + '</b><br />' + chosen_language.rank + ": " + convertNumber(props.HDI_Rank, languageLong) 
		: chosen_language.hover_instruction);
};

info.addTo(map);

/* Create GeoJSON layer */
L.geoJson(countryData).addTo(map); //Loads countryData based on selected GeoJSON file

function getColor(d) {

	if (d >= "0.8") { //Very high
		color = "#003399";
	}
	else if (d < "0.8" && d >= "0.7") { //High
		color = "#3072D9";
	}
	else if (d < "0.7" && d >= "0.5") { //Medium
		color = "#A8C3FF";
	}
	else if (d < "0.5" && d >= "0") { //Low
		color = "#E6EDFF";
	}
	else {
		color = "#858585"; //Unavailable
	}

	return color;
}

function style(feature) {

	return {
		fillColor: getColor(feature.properties.HDI),
		weight: 2,
		opacity: 1,
		color: 'white',
		dashArray: '3',
		fillOpacity: 0.5
	};
}

L.geoJson(countryData, {style: style}).addTo(map);

/**********LEGEND**********
*******************************/
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

	var div = L.DomUtil.create('div', 'info legend');

	div.innerHTML = 
		'<i style="background:#003399"></i>' + chosen_language.very_high +'<br>' + 
		'<i style="background:#3072D9"></i>' + chosen_language.high +'<br>' +
		'<i style="background:#A8C3FF"></i>' + chosen_language.medium +'<br>' +
		'<i style="background:#E6EDFF"></i>' + chosen_language.low +'<br>' +
		'<i style="background:#858585"></i>' + chosen_language.unavailable
	return div;
};

legend.addTo(map);
/*******************************
*******************************/


/**********Interaction**********
*******************************/

var popup = L.popup();

function clickFeature(e) {
	var layer = e.target;
	layer.setStyle({
		weight: 5,
		dashArray: '',
		fillOpacity: 0.7
	});

	var props = layer.feature.properties;


	if (props.HDI != undefined) {
	var GNI_capita_display = convertCurrency(props.GNI_capita, languageLong); //language long is the selected language including the country code
	var convertedExpSchool = convertNumber(props.exp_school, languageLong);
	var convertedMeanSchool = convertNumber(props.mean_school, languageLong);
	var convertedLifeExp = convertNumber(props.life_exp, languageLong);
	createCharityLinks(props);
}
	/*Popup*/
	if (props.HDI != undefined){ //To only display popup if data is available
		popup
			.setLatLng(e.latlng)
			.setContent('<div class="popup"><h4 class="popupHeader">' + props.name + '</h4>' +
				'<a target="_blank" href="'+ econLink +'"><div class="popupRow">' + chosen_language.GNI_label +': <div class="popupValue GNI">' + GNI_capita_display + '</div></div></a>' +
				'<a target="_blank" href="'+ healthLink +'"><div class="popupRow">' + chosen_language.life_exp_label +': <div class="popupValue">' + convertedLifeExp + ' ' + chosen_language.years + '</div></div></a>' +
				'<a target="_blank" href="'+ eduLink +'"><div class="popupRow">' + chosen_language.exp_school_label +': <div class="popupValue">' + convertedExpSchool + ' ' + chosen_language.years + '</div></div></a>' +
				'<a target="_blank" href="'+ eduLink +'"><div class="popupRow">' + chosen_language.mean_school_label +': <div class="popupValue">' + convertedMeanSchool + ' ' + chosen_language.years + '</div></div></a>' +
				'<p>' + chosen_language.click_instruction + '</p></div>')
			.openOn(map);
	}
	else {
		popup
			.setLatLng(e.latlng)
			.setContent('<p>'+ chosen_language.country_error_message +'</p>')
			.openOn(map);
	}
}

function createCharityLinks(props) {
	var countryName;

	if(selectedLanguage == "en")
		countryName = props.name;
	else
		countryName = props.english_name;

	switch (countryName) { //Changes below's country names to match the names on globalgiving.com so that hyperlink directs correctly
		
		case "Russian Federation":
		countryName = "Russia";
		break;

		case "Tanzania":
		countryName = "Tanzania, United Republic of";
		break;

		case "Democratic Republic of the Congo":
		countryName = "Congo, Democratic Republic of the";
		break;

		case "Republic of Congo":
		countryName = "Congo, Republic of the";
		break;

		case "The Gambia":
		countryName = "Gambia, The";
		break;

		case "Lao PDR":
		countryName = "Lao People's Democratic Republic";
		break;

		case "Macedonia":
		countryName = "Macedonia, Republic of";
		break;

		case "Moldova":
		countryName = "Moldova, Republic of";
		break;

		case "Bahamas":
		countryName = "The Bahamas";
		break;

		case "Russian Federation":
		countryName = "Russia";
		break;
		
		case "Syria":
		countryName = "Syrian Arab Republic";
		break; 
	}
	 //Href links for the different categories

	 healthLink = "https://www.globalgiving.org/dy/v2/content/search.html?fq=|publicSearchable%3Atrue|country%3A" + countryName + "|cb01_themeName_ms%3AHealth|cb01_themeName_ms%3AHunger|cb01_themeName_ms%3AHIV-AIDS|cb01_themeName_ms:Malaria";

	 eduLink = "https://www.globalgiving.org/dy/v2/content/search.html?fq=|publicSearchable%3Atrue|country%3A" + countryName + "|cb01_themeName_ms:Education";

	 econLink = "https://www.globalgiving.org/dy/v2/content/search.html?fq=|publicSearchable%3Atrue|country%3A" + countryName + "|cb01_themeName_ms%3AMicrofinance|cb01_themeName_ms:Economic%20Development"

}

//Stores current exchange rates
$.getJSON(
	'https://openexchangerates.org/api/latest.json?app_id=574ac8525871455a848010de3fe4002b',
	function (data) {
		//Checks that money.js has finished loading:
		if ( typeof fx !== "undefined" && fx.rates) {
			fx.rates = data.rates;
			fx.base = data.base;
		}
		else {
			// apply to fxSetup global:
			var fxSetup = {
				rates : data.rates,
				base : data.base
			}
		}
	}
);

function convertNumber(amount, language) {
	var number, convertedNumber;
	number = Number(amount);
	if (isNaN(number)) {
		convertedNumber = chosen_language.unavailable;
	} 	
	else convertedNumber = number.toLocaleString(language);
	
	return convertedNumber;
	
}

function convertCurrency(USDamount, language) {
	var number, convertedNumber, currency, total, USDLocale;
	currency = currencies[countryCode];
	if (currency == "USD") {
		total = "$" + USDamount;
	}
	else {
		//Removes commas from string and change format to number
		amount = USDamount.replace(/\,/g,''); 
		amount = parseInt(amount,10);

		convertedNumber = fx.convert(amount, {from: "USD", to: currency});
		convertedNumber = convertedNumber.toLocaleString(language, { style: "currency", currency: currency});

		USDLocale = amount.toLocaleString(language, {style: "currency", currency: "USD"})

		total = convertedNumber + " || " + USDLocale;
	}
	return total;
}

function hoverFeature(e) {
		var layer = e.target;

		layer.setStyle({
			weight: 5,
			dashArray: '',
			fillOpacity: 0.7
		});

		info.update(layer.feature.properties);
	
}

function resetHighlight(e) {
	geojson.resetStyle(e.target);
	info.update();
}


function onEachFeature(feature, layer) {
	layer.on({
		mouseover: hoverFeature,
		click: clickFeature,
		mouseout: resetHighlight
	});
	
}

geojson = L.geoJson(countryData, {
	style: style,
	onEachFeature: onEachFeature
}).addTo(map);
/*******************************
*******************************/




