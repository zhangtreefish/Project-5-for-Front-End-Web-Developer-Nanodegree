//create a global map named map1 for later addition of markers
var map1;
function createMap(){
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
  this.name = ko.observable(data.name);
  this.lat = ko.observable(data.location.coordinate.latitude);
  this.lon = ko.observable(data.location.coordinate.longitude);
  this.info = data.url;
  this.marker = {};
  this.contentString = '<div id="content">'+
            '<h4 id="firstHeading" class="firstHeading">Url</h4>'+
            '<div id="siteUrl">'+this.info+'</div>'+
            '</div>';
  // this.infowindow = {};
};

//set up auth tokens for the Yelp request
var auth = {
  consumerKey: "vJDdZm0QvnzPtjptn4BqSQ",
  consumerSecret: "18nkUx80NEC6qnpQILDZwOfoXgY",
  accessToken: "LTpWUkoGmR443wsVqCuTC_p0RRxwV2Cs",
  accessTokenSecret: "zdDqJZMrhjwQJXqjQYfPYu3vCcw",
  serviceProvider: {
    signatureMethod: "HMAC-SHA1"
  }
};

var accessor = {
  consumerSecret: auth.consumerSecret,
  tokenSecret: auth.accessTokenSecret
};

//set up the Yelp query
var terms = "retirement homes";
var near = "San+Antonio";

var parameters = [];
parameters.push(["term", terms]);
parameters.push(["location", near]);
parameters.push(["limit", 6]);
parameters.push(["callback", "cb"]);
parameters.push(["oauth_consumer_key", auth.consumerKey]);
parameters.push(["oauth_consumer_secret", auth.consumerSecret]);
parameters.push(["oauth_token", auth.accessToken]);
parameters.push(["oauth_signature_method", "HMAC-SHA1"]);

var message = {
  "action": "http://api.yelp.com/v2/search",
  "method": "GET",
  "parameters": parameters
};

OAuth.setTimestampAndNonce(message);
OAuth.SignatureMethod.sign(message, accessor);
var parameterMap = OAuth.getParameterMap(message.parameters);
parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature);
// console.log(parameterMap);this works

function MyViewModel() {
  var self = this;

  self.query = ko.observable('');
  self.placeList = ko.observableArray([]);
  self.currentPlace = ko.observable('');

  $.ajax({
    "url": message.action,
    "data": parameterMap,
    "cache": true,
    "dataType": "jsonp",
    "jsonpCallback": "cb",
    "success":function(data) {
      data.businesses.forEach(function(business) {
        self.placeList.push(new Place(business));//not placeList() per NathanM
        //call live update of the list here
        // self.searchResults();
      });//foreach
      //call showMarker here
      self.showMarker(self.placeList());
    },//success
    error: function(exception) {
      alert("data not available at present");
    }
  });//.ajax

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
      markerObject.position = {lat: currentValue.lat(), lng: currentValue.lon()};
      markerObject.map = map1;
      markerObject.animation = google.maps.Animation.DROP;
      currentValue.marker = new google.maps.Marker(markerObject);

      //make the marker bounce on click to either the marker of the list item
      // currentValue.marker.addListener('click', bounceThrice);

      //create an info content for display in the infowindow
      // var contentString =
      //   '<div id="content">'+
      //       '<h4 id="firstHeading" class="firstHeading">Url</h4>'+
      //       '<div id="siteUrl">'+currentValue.info+'</div>'+
      //   '</div>';
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

      //TODO: bounce and show infowindow when list item clicked

    });//map
  };//showMarker

  //The live filtering function has to be placed near the end;
  self.searchResults = ko.computed(function(){
    var search = self.query().toLowerCase();//set outside for performance per Karol
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
    return ko.utils.arrayFilter(self.placeList(), function(place){
       return place.name().toLowerCase().indexOf(search) >= 0;
    });
  },this);//TODO:this is optional here. I guess because "self" is used.

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
};//MyViewModel

var viewModel = new MyViewModel();
ko.applyBindings(viewModel);
