function initMap(){	 
	var lat = parseFloat( $('input[name="latitude"]').val() );
	var longt = parseFloat( $('input[name="longitude"]').val() );
	
	if( ( lat && typeof lat == 'number' ) && (longt && typeof longt == 'number') ){
		var position = new google.maps.LatLng( $('input[name="latitude"]').val(), $('input[name="longitude"]').val() );
	}else{
		var position = new google.maps.LatLng( 40.1778541, 44.5136349 );
	}
	
	var  mapOptions = {
        zoom: 14,
        scrollwheel: true,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
		center: position
    }


    var map = new google.maps.Map(document.getElementById('google-map'), mapOptions);
	
	
	var image = {
            url: "//velopark.aparg.com/images/marker_" + $('.add-type:checked').val() + ".png",
            scaledSize: new google.maps.Size(28, 44)
        };
	
	var marker = new google.maps.Marker({
        map: map,
        position: position,
        optimized: true,
        draggable: true,
        icon: image,
        opacity: 1
    });
	
	var geocoder = new google.maps.Geocoder();
	$('.add-type').on('change',function(){
		var image = {
            url: "//velopark.aparg.com/images/marker_" + $(this).val() + ".png",
            scaledSize: new google.maps.Size(28, 44)
        };
		marker.setIcon(image);		
	});
	
	marker.addListener('dragend', function (event) {
        setNewAddress(event.latLng);
    });

    google.maps.event.addListener(map, 'click', function (event) {
        marker.setPosition(event.latLng);
        setNewAddress(event.latLng);
    });

    function setNewAddress(latLng) {
        var latitude = parseFloat(latLng.lat()).toFixed(7);
        var longitude = parseFloat(latLng.lng()).toFixed(7);

        $('input[name="latitude"]').val(latitude);
        $('input[name="longitude"]').val(longitude);
		$(".add-country").val('');
        geocoder.geocode({'location': latLng}, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                $('input[name="address"]').val(results[0].formatted_address);
				var country = '';
                for (var i = 0; i < results[0].address_components.length; i++) {
                    var component = results[0].address_components[i];
                    if (component.types[0] == 'country') {
                        country = component.short_name.toLowerCase();
                        break;
                    }
                }
                $(".add-country").val(country);
            }
        });
    }
	
 }