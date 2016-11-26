var map1;
function createMap(){
  'use strict';
  var myOptions = {
      zoom: 10,
      center: new google.maps.LatLng(29.54, -98.51),
      mapTypeId: "terrain"
  };
  map1 = new google.maps.Map($("#map")[0], myOptions);
}//semicolon not necessary at the end of function declaration
createMap();

//set a global infowindow-set as global so that only one infowindow opens, vs. one infowindow for each marker
var infowindow = new google.maps.InfoWindow();

//set up a class called Place for later construction of place objects; it is essential to declare the name as ko.observable since we want to display the names. So is with lat and lon since we want to display the markers, a derivative of lat and lon; if lat or lon is not declared ko.observable, the markers would not show. The marker property is added so that it can be accessed in the marker construction function showMarker and filtering function searchResults.
var Place = function(data) {
  'use strict';
  this.name = ko.observable(data.name);
  this.lat = ko.observable(data.location.lat);
  this.lng = ko.observable(data.location.lng);
  this.info = data.location.address;
  this.marker = {};
  this.contentString = '<div id="content">'+
            '<h4 id="firstHeading" class="firstHeading">Address</h4>'+
            this.name() +
            '<div id="siteAddress">'+this.info+'</div>'+
            '</div>';
 };

function encodeQueryData(data) {
  'use strict';
  var ret = [];
  for (let d in data)
    ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
  return ret.join('&');
}


function MyViewModel() {
  var self = this;

  self.query = ko.observable("retirement");
  self.locale = ko.observable("san antonio");
  self.placeList = ko.observableArray([]);
  self.currentPlace = ko.observable('');

  var url_bit = encodeQueryData({"query": self.query(), "near": self.locale()});
  console.log('url', url_bit);
  var url = 'https://api.foursquare.com/v2/venues/search?query='+url_bit+'&client_id=UZTDD0DNGXWBBNXSE5N3EOEU2ZSO5LTQ2PICPIAY5ZTUZR1U&client_secret=N1VQRVFHBJMJDCLZBMBA5ANEKCY1LSIYYY0B2WEHZV33QFLI&v=20161120';

  $.ajax({
    "type": 'GET',
    "url": url,
    "cache": true,
    "dataType": "jsonp",
    "success":function(data) {
      console.log('data', data);
      data.response.venues.forEach(function(venue) {
        self.placeList.push(new Place(venue));//not placeList() per NathanM
      });
      console.log('placeListAjax', self.placeList());
      self.showMarker(self.placeList());
    },
    error: function(exception) {
      alert("data not available at present");
    }
  });

  //define a function for use in showMarker; one bounce takes about 700ms, use setTimeout to limit the nubmer of bounces; otherwise the bounce persists
  function bounceThrice() {
    var self = this;
    self.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      self.setAnimation(null);
    }, 2100);
  }

  //insert marker with view model instead of custom binding per suggestion of Udacity student leader mcs
  self.showMarker = function(anArray) {
    anArray.map(function(currentValue, index, array) {
      //construct and show marker
      var markerObject = {};
      markerObject.position = {lat: currentValue.lat(), lng: currentValue.lng()};
      markerObject.map = map1;
      markerObject.animation = google.maps.Animation.DROP;
      currentValue.marker = new google.maps.Marker(markerObject);

      //bounce and show info window for each marker when clicked
      google.maps.event.addListener(currentValue.marker,'click',function() {
        var self = currentValue.marker;
        self.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
          self.setAnimation(null);
        }, 2100);
        infowindow.setContent(currentValue.contentString);
        infowindow.open(map1,this);
      });
    });
  };

  //The live filtering function has to be placed near the end;
  self.searchResults = ko.computed(function(){
    var search = self.query().toLowerCase();//set outside for performance per Karol
    console.log('search:', search);
    //hide a marker if its location name does not appear in the user input
    self.placeList().forEach(function(currentValue,index,array) {
      if (currentValue.marker.setVisible) {
        if (currentValue.name().toLowerCase().indexOf(search) === -1) {
          currentValue.marker.setVisible(false);
        } else {
          currentValue.marker.setVisible(true);
        }
      }
    });
    //filter the list view based on the user input
    var searchResults = ko.computed(function() {
      return ko.utils.arrayFilter(self.placeList(), function(place){
        return place.name().toLowerCase().indexOf(search) >= 0;
      });
    });
    console.log('self.searchResults in', searchResults());
    return searchResults();

  },this);//Note:this is optional here. I guess because "self" is used.
  console.log('self.searchResults out', self.searchResults());
  console.log('self.placeList()', self.placeList());
  //show info window and animate marker when list item gets clicked
  // self.placeClicked = function(place) {
  //   place.marker.setAnimation(google.maps.Animation.DROP);
  //   infowindow.setContent(place.contentString);
  //   infowindow.open(map1,place.marker);
  // }
  //Alternatively, simply trigger marker click like below-per reviewer suggestion
  self.placeClicked = function(place) {
    google.maps.event.trigger(place.marker,'click');
  };
};

var viewModel = new MyViewModel();
ko.applyBindings(viewModel);
