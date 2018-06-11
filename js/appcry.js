//   // Top Tourist Locations in SF. Modified code from "Devil in the Details" lesson.
var places = [
  {
    name: 'Golden Gate Bridge',
    location: {
      lat:  37.821879,
lng: -122.478452
    }
  },
  {
    name: 'Golden Gate Park',
      location: {
        lat: 37.771851,
        lng: -122.454748
    }
  },
  {
    name: 'Fishermans Wharf',
      location: {
        lat: 37.810139,
        lng: -122.417762

    }
  },
  {
    name: 'San Francisco Zoo',
      location: {
        lat: 37.733645,
        lng: -122.504989

    }
  },
  {
    name: 'AT&T Park',
      location: {
        lat: 37.779256,
        lng: -122.390097

    }
  },
  {
    name: "Ferry Building",
    location: {
      lat: 37.7955,
      lng: -122.3933
    }
  }
];


var Place = function(data) {          // creates each new place
  var self = this;
  this.name = data.name;
  this.lat = data.location.lat;
  this.lng = data.location.lng;
  this.id = data.id;

  this.visible = ko.observable(true);     // will be used for filtering

// Foursquare api URL along with the Client_id and the Client_secret_Id I created
var foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll='+ this.lat + ',' + this.lng + '&client_id=WEOSJYPSSW5XC33V11EJOMI3ULSOBJFQOMRYGTUMEFK3BH4P&client_secret=RYUXNWEETQARHBSRBPJIZZLI04OKBY3LVWZBBN34XNSYHCQ5&v=20170627&query=' + this.name;

  $.getJSON(foursquareURL)  //requesting information back in JSON format (not XML) and process the data
  .done(function(data){
    var result = data.response.venues[0];
    self.address = result.location.formattedAddress ? result.location.formattedAddress: "Address not available";  //returns address or tells you if unavailable
  })
  .fail(function(data){     //error handling in case foursquare fails to load
    self.address = "We are Sorry. The Foursquare API returned an error. Please refresh the page and try again";
  });



  this.marker = new google.maps.Marker({        // Create a marker for each location
    position: new google.maps.LatLng(data.location),
    map: map,
    address: "",
    title: data.name,
    animation: google.maps.Animation.DROP        // marker drops from top of screen when first loaded
  });


  this.markerVisibility = ko.computed(function() {   //shows marker depending on visible variable. If typing in search bar, the markers will be removed when they don't match
		if(this.visible()) {
			return this.marker.setMap(map);
		} else {
			return this.marker.setMap(null);
    }
		}, this);


  this.marker.addListener('click', function(){              // adds a click listener on marker to use infowindow on it
    content = '<div>'+data.name+'<br>'+self.address+'</div>';
    self.marker.setAnimation(google.maps.Animation.BOUNCE);    // marker will bounce for 3 seconds (3000ms) when clicked
    setTimeout(function() {
      		self.marker.setAnimation(null);
     	}, 3000);
    infoWindow.setPosition(self.location);
    infoWindow.setContent(content);
    infoWindow.open(map, this);
	});






                          /*
                                        creates a click listener on the navigation bar to set infowindow
                                            https://stackoverflow.com/questions/20548472/how-to-trigger-google-maps-marker-from-outside-of-map
                                                */
	this.openInfoWindow = function() {
    google.maps.event.trigger(self.marker, 'click');
	};
};

var map = function(){
    map = new google.maps.Map(document.getElementById('map'), {   // Constructor creates a new map and centers it on San Francisco. Modified code from "Devil in the Details" lesson.
        center: {
          lat: 37.79544,
          lng: -122.4477},
        zoom: 11
    });

infoWindow = new google.maps.InfoWindow();  // create a new infowindow. Code from "Devil in the Details" lesson.

ko.applyBindings(new viewModel());


};

//error handling in case the maps API fails to load
var mapError = function(){
  alert("We are Sorry. The Google Maps API failed to load correctly. Please try again later.");
};


var viewModel = function() {
  var self = this;     // setting up variables

  this.query = ko.observable("");
  this.placesList = ko.observableArray([]);                 //observable array used to respond to or detect changes in list of places


  places.forEach(function(placesItem){                        // create list of places that are available on the map
    self.placesList.push(new Place(placesItem));
  });


//  filters list of places based on input
  this.filteredPlacesList = ko.computed( function() {     //by using ko.computed, your able to sort out places and make them visible or not visible in the list  Use w/data-bind in HTML
    		var filter = self.query().toLowerCase();
    		if (!filter) {                                   // if no input in search bar, display the whole list of places
			self.placesList().forEach(function(placesItem){
				placesItem.visible(true);
			});
			return self.placesList();
  } else {                                              // listens for any input in the search bar. Iterates through the list as user types
			return ko.utils.arrayFilter(self.placesList(), function(placesItem) {
				var placeName = placesItem.name.toLowerCase();
        if(placeName.search(filter)!=-1) {
          placesItem.visible(true);                   // if a match, show only places that match input. ( this also affects the markers visibility)
                    return true;
        } else {                                     //If not, don't show the names of the nonmatching places
          placesItem.visible(false);
          return false;
        }
			});
		}
	}, self);
};
