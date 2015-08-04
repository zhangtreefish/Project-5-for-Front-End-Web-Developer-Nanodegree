var viewModel = function() {
    function initialize() {
        var mapOptions = {
            center: new google.maps.LatLng(29.8, 121.5),
            zoom: 8,
            scaleControl: true,
            panControl:true
        };
        var map = new google.maps.Map(document.getElementById('map-canvas'),
            mapOptions);
        map.style.width='500px';//?
    }
    google.maps.event.addDomListener(window, 'load', initialize);
};