var viewModel = function() {
    function initialize() {
        var myLatLng = new google.maps.LatLng(29.8, 121.5);

        var mapOptions = {
            center: myLatLng,
            zoom: 8,
            scaleControl: true,
            panControl:true
        };
        var map = new google.maps.Map(document.getElementById('map-canvas'),
            mapOptions);
        map.style.width='500px';//?

        var marker = new google.maps.Marker({
          position: myLatLng,
          map: map,
          title: 'Hello World!'
        });
    }
    google.maps.event.addDomListener(window, 'load', initialize);
}();
