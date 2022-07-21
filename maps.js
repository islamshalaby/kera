/**
 * mark pick points
 */
function myMap() {
    var mapProp= {
    center:new google.maps.LatLng(51.508742,-0.120850),
    zoom:5,
    };
    var map = new google.maps.Map(document.getElementById("googleMap"),mapProp);
    
    google.maps.event.addListener(map, 'click', function(event) {
        placeMarker(map, event.latLng);
    });

    function placeMarker(map, location) {
        var marker = new google.maps.Marker({
            position: location,
            map: map
        });
        
        var infowindow = new google.maps.InfoWindow({
            content: 'Latitude: ' + location.lat() +
            '<br>Longitude: ' + location.lng()
        });
        infowindow.open(map,marker);
    }
}

/**
 * pick location
 */

 /*
* declare map as a global variable
*/
var map;
var previousMarker;
/*
* use google maps api built-in mechanism to attach dom events
*/
google.maps.event.addDomListener(window, "load", function () {

/*
* create map
*/
var map = new google.maps.Map(document.getElementById("googleMap"), {
    center: new google.maps.LatLng(26.8349009, 35.3730127),
    zoom: 5,
    mapTypeId: google.maps.MapTypeId.ROADMAP
});

    map.addListener('click', function(e) {
        if (previousMarker)
        previousMarker.setMap(null);
        placeMarker(e.latLng, map);
    });
    return marker;


/*
* add markers to map
*/
var marker0 = createMarker({
    position: new google.maps.LatLng(33.808678, -117.918921),
    map: map,
    icon: "http://1.bp.blogspot.com/_GZzKwf6g1o8/S6xwK6CSghI/AAAAAAAAA98/_iA3r4Ehclk/s1600/marker-green.png"
}, "<h1>Marker 0</h1><p>This is the home marker.</p>");
});



function placeMarker(position, map) {
    previousMarker = new google.maps.Marker({
        position: position,
        map: map
    });
    var lat = document.getElementById('lat').value = position.lat(),
        long = document.getElementById('long').value = position.lng()
    
    // map.setPosition(position);
}