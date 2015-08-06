var initialPlace = function() {
    var myLatLng = new google.maps.LatLng(29.8, 121.5);
    var mapOptions = {
        center: myLatLng,
        zoom: 8,
        scaleControl: true,
        panControl:true
    };
    var mapMarker = new google.maps.Marker({
          position: myLatLng,
          map: map,
          title: 'Hello World!',
          animation: google.maps.Animation.DROP
    });
    this.mapMarkers = ko.observableArray([]);
    this.mapMarkers[0] = mapMarker;
};

var Map = function() {
    this.coordinates = myLatLng;
};

var ViewModel = function() {
    var self = this;
    self.myMap = ko.observable({
        lat: ko.observable(55),
        lng: ko.observable(11)
    });
};
ko.applyBindings(new ViewModel());
/*this.MapCoordsList = ko.observableArray([]);
    this.MapCoordsList.push(this.coordinate);

    this.mapInit = function() {
        var map = new google.maps.Map(document.getElementById('map-canvas'),
            mapOptions);
        google.maps.event.addDomListener(window, 'load', initialize);

        google.maps.event.addListener(marker, 'click', toggleBounce);

        function toggleBounce() {
            if(marker.getAnimation() != null) {
                marker.setAnimation(null);
            } else {
                marker.setAnimation(google.maps.Animation.BOUNCE);
            }
        }();

    this.markerUpdate = function() {

    }
    this.makeList = function() {


};*/
