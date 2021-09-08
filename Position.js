/**
 * Created by cheesyeyes on 8/6/16.
 */

Location = function(){

	var that = this;

	var WATCH = false;

	this.geoOptions = {
		enableHighAccuracy: true,
		maximumAge        : 0,
		timeout           : 27000};

	this.latitude;
	this.longitude;

	this.LOCATIONS = [];

	console.log('*NEW LOCATION');

	function deg2rad(deg) {

	  return deg * (Math.PI/180)
	}

	function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
	  var R = 6371; // Radius of the earth in km
	  var dLat = deg2rad(lat2-lat1);  // deg2rad below
	  var dLon = deg2rad(lon2-lon1);
	  var a =
	    Math.sin(dLat/2) * Math.sin(dLat/2) +
	    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
	    Math.sin(dLon/2) * Math.sin(dLon/2)
	    ;
	  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	  var d = R * c; // Distance in km
	  return d;
	}

	//UPDATE DISTANCES
	function updateDistances(){
		for(var i = 0; that.LOCATIONS.length>i; i++){

			that.LOCATIONS[i].distance = that.distanceTo(that.LOCATIONS[i]);

		}
	}

	//WATCH POSITION
	if ("geolocation" in navigator) {

		WATCH = navigator.geolocation.watchPosition(function(position) {

			that.latitude = position.coords.latitude;
			that.longitude = position.coords.longitude;

			//console.log('*WATCH POSITION '+that.latitude+', '+that.longitude);

			updateDistances();

		}, function(err){

		    console.log('*ERROR WATCHING geolocation: '+err);

		}, that.geoOptions);} else {
		/* geolocation IS NOT available */
		console.log('*GEO LOCATION NOT AVIABLE')
		}

	this.get = function(){
		if(WATCH!=false){
			return {"latitude": this.latitude,
					"longitude": this.longitude

			}
		}
	}


	this.getLocation = function(index){
		if(index===undefined){
			return that.LOCATIONS;
		}else{
			return that.LOCATIONS[index];
		}}

	this.distanceTo = function(location){

		var lat1 = that.latitude;
		var lon1 = that.longitude;

		var lat2 = location.latitude;
		var lon2 = location.longitude;

		//simple difference
		var diffLatitude = lat1-lat2;
		var diffLongitude = lon1-lon2;

		//calculate
		var km = getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2);
		var m = km*1000;

		//console.log('dist:'+m)

		return {
			        "latitide": diffLatitude,
			        "longitude": diffLongitude,
			        "m": m,
			        "km": km
			    };}

	//SAVE a location to the list
	this.save = function(location){

		//if no location is provided take the current
		var location = (location===undefined) ? that.current() : location;

		that.LOCATIONS.push(location);

		return [that.LOCATIONS.length, location];}


	//RETURN LOCATIONS
	this.locations = function(){

		return that.LOCATIONS;
	}

	this.containerPosition = function (latitude, longitude, containerWidth, containerHeight){


		var x =  ((containerWidth/360.0) * (180 + longitude));
		var y =  ((containerHeight/180.0) * (90 - latitude));

		/*
			 ____________
		     |          |
		     |          |
		     |          |
		     |          |
		     |          |
		   x ------------

		   x(0,0)
		*/

		var xCenter = (x-containerWidth/2);
		var yCenter = -(y-containerHeight/2);

		/*
			   ____________
			   |          |
		     |          |
		     |     x    |
		     |          |
		     |          |
		     ------------

		  x(0,0)
		*/



		//LOG.innerHTML = x+','+y;

		//INFO.innerHTML = xCenter+','+yCenter;



		return {"x":x,
				"y":y,
				"xCenter":xCenter,
				"yCenter":yCenter}
	}

}

