//var db = openDatabase('places', '', 'the database of places', 4 * 1024 * 1024);
 device = {};
 device.uuid = 'aaaa'; 
function selectPlaces(database) {
    var data = {}; 
    var parking = [];
    var rent = [];
    var shop = [];
    var parts = [];
    database.transaction(function (tx) {
        tx.executeSql("SELECT * FROM places WHERE status='1'", [], function (tx, results) {

            for (var i = 0; i < results.rows.length; i++) {
                var obj = {
                    "lat": results.rows.item(i).latitude,
                    "long": results.rows.item(i).longitude,
                    "name": results.rows.item(i).name,
                    "address": results.rows.item(i).address,
                    "desc": results.rows.item(i).description,
                    "img": results.rows.item(i).image,
                    "id": results.rows.item(i).server_id
                };
                if (results.rows.item(i).type == "parking")
                    parking.push(obj);
                else if (results.rows.item(i).type == "rent")
                    rent.push(obj);
                else if (results.rows.item(i).type == "shop")
                    shop.push(obj);
                else if (results.rows.item(i).type == "parts")
                    parts.push(obj);
            }
            data = {
                "parking": parking,
                "rent": rent,
                "shop": shop,
                "parts": parts,
            }
            addAllMarkers(data);

        });
    });
}


function selectVoting(data) {
    var places = [];
    for (var i = 0; i < data.length; i++) {
        var obj = {
            "lat": data[i].latitude,
            "long": data[i].longitude,
            "name": data[i].name,
            "address": data[i].address,
            "desc": data[i].description,
            "img": data[i].image,
            "server_id": data[i].id,
            "type": data[i].type,
        }
        places.push(obj);
    }
	
    printPlaces(places);

}

function addAllMarkers(data) {
    var markers_parking = [];
    var markers_rent = [];
    var markers_shop = [];
    var markers_parts = [];
    $("#icon_park").addClass("border_icon_park");
    for (var i = 0; i < data.parking.length; i++) {
        var myLatlng = new google.maps.LatLng(data.parking[i].lat, data.parking[i].long);
        var marker = addMarker(app.map, "img/marker1.png", myLatlng);
        marker.setAnimation(null);
        markers_parking.push(marker);
    }
    for (var k = 0; k < markers_parking.length; k++) {
        google.maps.event.addListener(markers_parking[k], 'click', function () {
            var lat = parseFloat(this.getPosition().lat()).toFixed(7);
            var long = parseFloat(this.getPosition().lng()).toFixed(7);

            for (var t = 0; t < data.parking.length; t++) {
                if (data.parking[t].lat == lat && data.parking[t].long == long) {
                    var dataParking = data.parking[t];
                    if (data.parking[t].img != "") {
                        $(".footer-image").attr("src", "data:image/jpg;base64," + data.parking[t].img);
                        $(".foot-link").attr("href", app.uploadsURL + data.parking[t].id + ".jpg");
                    }
                    else {
                        $(".footer-image").attr("src", "img/foot_icon1.png");
                    }
                    $('footer').slideDown(200);

                    $('.gps1').addClass("gpstransition");
                    $('footer').addClass("transitiion");


                    $("footer .footer-info p.desc").fadeOut(200, function () {
                        $("footer .footer-info p.desc").fadeIn(200).text(dataParking.name + ", " + dataParking.address);
                    });
                    $("footer .footer-info p.count").fadeOut(200, function () {
                        $("footer .footer-info p.count").fadeIn(200).text(data.parking.length + " parking places");
                    })
                }
            }
            $('.swipebox').swipebox();
        });
    }


    $("#icon_park").on('click', function () {

        if (!$(this).hasClass("border_icon_park")) {

            for (var i = 0; i < data.parking.length; i++) {
                var myLatlng = new google.maps.LatLng(data.parking[i].lat, data.parking[i].long);
                var marker = addMarker(app.map, "img/marker1.png", myLatlng);
                markers_parking.push(marker);
            }
            for (var k = 0; k < markers_parking.length; k++) {
                google.maps.event.addListener(markers_parking[k], 'click', function () {
                    var lat = parseFloat(this.getPosition().lat()).toFixed(7);
                    var long = parseFloat(this.getPosition().lng()).toFixed(7);

                    for (var t = 0; t < data.parking.length; t++) {
                        if (data.parking[t].lat == lat && data.parking[t].long == long) {
                            var dataParking = data.parking[t];
                            if (data.parking[t].img != "") {
                                $(".footer-image").attr("src", "data:image/jpg;base64," + data.parking[t].img);
                                $(".foot-link").attr("href", app.uploadsURL + data.parking[t].id + ".jpg");
                            }
                            else {
                                $(".footer-image").attr("src", "img/foot_icon1.png");
                            }
                            $('footer').slideDown(200);

                            $('.gps1').addClass("gpstransition");
                            $('footer').removeClass("tr1");
                            $('footer').addClass("transitiion");


                            $("footer .footer-info p.desc").fadeOut(200, function () {
                                $("footer .footer-info p.desc").fadeIn(200).text(dataParking.name + ", " + dataParking.address);
                            });
                            $("footer .footer-info p.count").fadeOut(200, function () {
                                $("footer .footer-info p.count").fadeIn(200).text(data.parking.length + " parking places");
                            })
                        }
                    }


                });
            }
            $(this).addClass("border_icon_park");
        }
        else {
            for (var j = 0; j < markers_parking.length; j++) {
                removeMarker(markers_parking[j]);
            }
            markers_parking = [];
            $(this).removeClass("border_icon_park");

        }

    });
    $("#icon_rent").on('click', function () {
        if (!$(this).hasClass("border_icon_rent")) {

            for (var i = 0; i < data.rent.length; i++) {
                var myLatlng = new google.maps.LatLng(data.rent[i].lat, data.rent[i].long);
                var marker = addMarker(app.map, "img/marker2.png", myLatlng);
                markers_rent.push(marker);
            }
            for (var k = 0; k < markers_rent.length; k++) {
                google.maps.event.addListener(markers_rent[k], 'click', function () {
                    var lat = parseFloat(this.getPosition().lat()).toFixed(7);
                    var long = parseFloat(this.getPosition().lng()).toFixed(7);

                    for (var t = 0; t < data.rent.length; t++) {
                        if (data.rent[t].lat == lat && data.rent[t].long == long) {
                            var dataRent = data.rent[t];

                            if (data.rent[t].img != "") {
                                $(".footer-image").attr("src", "data:image/jpg;base64," + data.rent[t].img);
                                $(".foot-link").attr("href", app.uploadsURL + data.rent[t].id + ".jpg");
                            }
                            else {
                                $(".footer-image").attr("src", "img/foot_icon2.png");
                            }
                            $('footer').slideDown(200);
                            $('.gps1').addClass("gpstransition");
                            $('footer').removeClass("tr1");
                            $('footer').addClass("transitiion");



                            $("footer .footer-info p.desc").fadeOut(200, function () {
                                $("footer .footer-info p.desc").fadeIn(200).text(dataRent.name + ", " + dataRent.address);
                            });
                            $("footer .footer-info p.count").fadeOut(200, function () {
                                $("footer .footer-info p.count").fadeIn(200).text(data.rent.length + " rent");
                            })
                        }
                    }

                });
            }
            $(this).addClass("border_icon_rent");
        }
        else {
            for (var j = 0; j < markers_rent.length; j++) {
                removeMarker(markers_rent[j]);
            }
            markers_rent = [];
            $(this).removeClass("border_icon_rent");


        }
    })

    $("#icon_shop").on('click', function () {
        if (!$(this).hasClass("border_icon_shop"))
        {
            for (var i = 0; i < data.shop.length; i++) {
                var data_result = data.shop[i];
                var myLatlng = new google.maps.LatLng(data.shop[i].lat, data.shop[i].long);
                var marker = addMarker(app.map, "img/marker3.png", myLatlng);
                markers_shop.push(marker);
            }
            for (var k = 0; k < markers_shop.length; k++) {
                google.maps.event.addListener(markers_shop[k], 'click', function () {
                    var lat = parseFloat(this.getPosition().lat()).toFixed(7);
                    var long = parseFloat(this.getPosition().lng()).toFixed(7);

                    for (var t = 0; t < data.shop.length; t++) {
                        if (data.shop[t].lat == lat && data.shop[t].long == long) {
                            var dataShop = data.shop[t];
                            if (data.shop[t].img != "") {
                                $(".footer-image").attr("src", "data:image/jpg;base64," + data.shop[t].img);
                                $(".foot-link").attr("href", app.uploadsURL + data.shop[t].id + ".jpg");
                            }
                            else {
                                $(".footer-image").attr("src", "img/foot_icon3.png");
                            }

                            $('footer').slideDown(200);

                            $('.gps1').addClass("gpstransition");
                            $('footer').removeClass("tr1");
                            $('footer').addClass("transitiion");


                            $("footer .footer-info p.desc").fadeOut(200, function () {
                                $("footer .footer-info p.desc").fadeIn(200).text(dataShop.name + ", " + dataShop.address);
                            });
                            $("footer .footer-info p.count").fadeOut(200, function () {
                                $("footer .footer-info p.count").fadeIn(200).text(data.shop.length + " shop");
                            })
                        }
                    }

                });
            }
            $(this).addClass("border_icon_shop");
        }
        else {
            for (var j = 0; j < markers_shop.length; j++) {
                removeMarker(markers_shop[j]);
            }
            markers_shop = [];
            $(this).removeClass("border_icon_shop");
        }



    })

    $("#icon_parts").on('click', function () {
        if (!$(this).hasClass("border_icon_parts")) {

            for (var i = 0; i < data.parts.length; i++) {
                var data_result = data.parts[i];
                var myLatlng = new google.maps.LatLng(data.parts[i].lat, data.parts[i].long);
                var marker = addMarker(app.map, "img/marker4.png", myLatlng);
                markers_parts.push(marker);
            }
            for (var k = 0; k < markers_parts.length; k++) {
                google.maps.event.addListener(markers_parts[k], 'click', function (e) {
                    var lat = parseFloat(this.getPosition().lat()).toFixed(7);
                    var long = parseFloat(this.getPosition().lng()).toFixed(7);
                    for (var t = 0; t < data.parts.length; t++) {
                        if (data.parts[t].lat == lat && data.parts[t].long == long) {

                            var dataParts = data.parts[t];
                            if (data.parts[t].img != "") {
                                $(".footer-image").attr("src", "data:image/jpg;base64," + data.parts[t].img);
                                $(".foot-link").attr("href", app.uploadsURL + data.parts[t].id + ".jpg");
                            }
                            else {
                                $(".footer-image").attr("src", "img/foot_icon4.png");
                            }

                            $('.gps1').addClass("gpstransition");
                            $('footer').removeClass("tr1");
                            $('footer').addClass("transitiion");


                            $("footer .footer-info p.desc").fadeOut(200, function () {
                                $("footer .footer-info p.desc").fadeIn(200).text(dataParts.name + ", " + dataParts.address);
                            });

                            $("footer .footer-info p.count").fadeOut(200, function () {
                                $("footer .footer-info p.count").fadeIn(200).text(data.parts.length + " parts places");
                            })

                        }
                    }


                });
            }
            $(this).addClass("border_icon_parts");

        }
        else {
            for (var j = 0; j < markers_parts.length; j++) {
                removeMarker(markers_parts[j]);
            }
            markers_parts = [];
            $(this).removeClass("border_icon_parts");

        }



    })


}

function load_place(i, places, map_size) {

    var output = "<div class='vot_wrap' id='vot_" + places[i].server_id + "' >";

    if (places[i].img) {
        output += "<a class='swipebox_places' rel='"+i+"' href='"+app.uploadsURL + places[i].server_id + ".jpg' onclick='return false;'><img class='vot_img' src='data:image/jpg;base64," + places[i].img + "' alt='' /></a>";
    } else {
        if (places[i].type == "parking") {
            output += "<img class='vot_img' src='img/foot_icon1.png' />";
        } else if (places[i].type == "rent") {
            output += "<img class='vot_img' src='img/foot_icon2.png' />";
        } else if (places[i].type == "shop") {
            output += "<img class='vot_img' src='img/foot_icon3.png' />";
        } else if (places[i].type == "parts") {
            output += "<img class='vot_img' src='img/foot_icon4.png' />";
        }
    }

    if (places[i].type == "parking") {
        output += "<img class='vot_img_icon' src='img/menu_icon1.png' />";
    } else if (places[i].type == "rent") {
        output += "<img class='vot_img_icon' src='img/menu_icon2.png' />";
    } else if (places[i].type == "shop") {
        output += "<img class='vot_img_icon' src='img/menu_icon3.png' />";
    } else if (places[i].type == "parts") {
        output += "<img class='vot_img_icon' src='img/menu_icon4.png' />";
    }
    output += "<div class='vot_img_icon_wrap'>"
    output += "<p>Name</p><p class='cont'>" + places[i].name + "</p><p>Address</p><p class='cont'>" + places[i].address + "</p>";

    if (places[i].desc) {
        output += "<p>Description</p><p class='cont'>" + places[i].desc + "</p>";
    }
    output += "</div>";
    output += "<div style='width:100%; margin: 15px auto; ' class='place_map' id='place_map_" + places[i].server_id + "'  data-src='https://maps.googleapis.com/maps/api/staticmap?center=" + places[i].lat + "," + places[i].long + "&markers=color:red%7C" + places[i].lat + "," + places[i].long + "&zoom=18&size=" + map_size.width + "x" + map_size.height + "&maptype=roadmap&sensor=false&key=AIzaSyDWni7BlYAkC1YNv-ACLopJ5kxoc1jTCWY'></div>";
    output += "<div class='new_place_icon_wrap'><img src='img/add_place.png' class='new_place_icon' alt='' data-value='1'><img src='img/new_place.png' class='new_place_icon' alt='' data-value='0'></div>"
    output += "<div class='overlay'></div></div>";
    $("#new_places .content").append(output);
	
	$('#vot_' + places[i].server_id + ' .swipebox_places').swipebox();
}

function elementInViewport(el) {
  var top = el.offsetTop;
  var left = el.offsetLeft;
  var width = el.offsetWidth;
  var height = el.offsetHeight;

  while(el.offsetParent) {
    el = el.offsetParent;
    top += el.offsetTop;
    left += el.offsetLeft;
  }

  return (
    top < (window.pageYOffset + window.innerHeight) &&
    left < (window.pageXOffset + window.innerWidth) &&
    (top + height) > window.pageYOffset &&
    (left + width) > window.pageXOffset
  );
}

function printPlaces(places) {
	$("#new_places .wrapper .content").empty();
    
	var map_size = {
		width: Math.round($("#new_places").width() * 92 / 100),
		height: 180
	}
	
    var limit = 5;

    if (places.length) {
        for (var i = 0; i < places.length; i++) {
            load_place(i, places, map_size);
        }

        $(window).unbind("scroll");
		var scrollTimer;
        $(window).scroll(function () {
			clearTimeout(scrollTimer);
			if( app.getActivePage() != 'new_places'){
				return true;
			}			
			scrollTimer = setTimeout(function(){
				var allVoteElements = $('.vot_wrap:not(".loaded")');
				allVoteElements.each(function(){
					if(elementInViewport( $(this)[0] ) ){
						$(this).addClass('loaded');
						var $mapContainer = $(this).find('.place_map[data-src]');
						var $img = $('<img />');
						$img.css('opacity',0);
						$img[0].onload = function(){
							$mapContainer.css('background-image','none');
							console.log( $(this))
							$img.css('opacity',1);
						}						
						$mapContainer.html($img);
						$img.attr('src',$mapContainer.data('src'));
					}
				});				
			},400);
        });
		$(window).trigger('scroll');
		
        $("#new_places .new_place_icon_wrap .new_place_icon").unbind("click");
        $(document).on("click", "#new_places .new_place_icon_wrap .new_place_icon", function () {
            $(this).closest(".vot_wrap").find(".overlay").show();
            var div_wrapper = $(this).closest(".vot_wrap");
            var vote_id = parseInt($(div_wrapper).attr("id").substring(4));
            var unique_id = device.uuid;
            var vote = $(this).attr("data-value");

            $.ajax({
                url: app.apiURL,
                method: "POST",
                data: {
                    action: "voting",
                    device_id: unique_id,
                    vote: vote,
                    place_id: vote_id
                },
                success: function (res) {
                    $(div_wrapper).fadeOut(1, function () {

                        $(div_wrapper).remove();
                        $.each(places, function (el, i) {
                            if (this.server_id == vote_id) {
                                places.splice(el, 1);
                            }

                        });

                        if ($("#new_places .wrapper").height() < $(window).height()) {
                            if ($(".vot_wrap").length < places.length) {
                                load_place($(".vot_wrap").length, places, map_size);
                            }

                        }
                        localStorage.setItem("count", parseInt(localStorage.getItem("count")) - 1);
                        if (!places.length) {
                            $("#new_places .wrapper").append("<p class='no_place_text'>There is no place to vote.</p>");
                        }
                    })
                },
                error:function(error){
                    navigator.notification.alert('Please, try later',alertVote,'','OK');
                }
            })

        });
    } else {
        $("#new_places .wrapper ").append("<p class='no_place_text'>There is no place to vote.</p>");
    }
}

function addMarker(map, myicon, pos) {

    var marker = new google.maps.Marker({
        map: map,
        position: pos,
        animation: google.maps.Animation.DROP,
        optimized: false,
        draggable: false,
        icon: myicon,
        opacity: 0.0
    });

    window.setTimeout(function () {
        marker.setOpacity(1.0);
    }, 200);
    return marker;

}

function removeMarker(marker) {
    marker.setMap(null);
}

function printDesc(marker, data) {

    google.maps.event.addListener(marker, 'click', function () {
        var lat = this.getPosition().lat().toFixed(6);
        var lng = this.getPosition().lng().toFixed(6);
        for (var i = 0; i < data.length; i++)
        {
            for (var j = 0; j < data.i.length; j++) {
                if (data.i[j].lat == lat && data.i[j].long == lng) {
                    break;
                }
            }
        }
    });
}


/* function addPlace() {
    $("#add_places").show();
    navigator.notification.confirm("Take a picture or select from gallery", confirmCamera, "", ["camera", "gallery", "close"]);
    //cameraSuccess();
} */

function confirmCamera(buttonIndex) {
    if (buttonIndex == 1) {
        navigator.camera.getPicture(cameraSuccess, cameraError, {quality: 75, sourceType: Camera.PictureSourceType.CAMERA, destinationType: Camera.DestinationType.FILE_URI, encodingType: Camera.EncodingType.JPEG, targetWidth: 800, targetHeight: 800});
    } else if (buttonIndex == 2) {
        navigator.camera.getPicture(cameraSuccess, cameraError, {quality: 75, sourceType: Camera.PictureSourceType.PHOTOLIBRARY, destinationType: Camera.DestinationType.FILE_URI, encodingType: Camera.EncodingType.JPEG, targetWidth: 800, targetHeight: 800});
    } else {
		app.goToPage('main');
    }

}

function cameraSuccess(imageURI) {
    $(".add-image").attr("src", imageURI);
    $(".add-src").attr("href", imageURI);
    $(".add-src").css("background-image", "url(" + imageURI + ")");
    $(".radio-wrap .add_img_icon").removeClass("add_img_icon_park");
    $(".radio-wrap .add_img_icon").removeClass("active_icon");
    $(".radio-wrap .add_img_icon:first-child").addClass("add_img_icon_park").addClass("active_icon");

    navigator.geolocation.getCurrentPosition(showPlace, errorPlace, {enableHighAccuracy: true, timeout: 3000, maximumAge: 100});
}

function cameraError() {
    $("#add_places").hide();
    $(".gps1, footer, .arr-wrapper").show();
    $("#main").removeClass("left_pos");
    $("#main").addClass("null_pos");
    $(".add-name").val("");
    $(".add-descript").val("");
    $(".add-src").css("background-image", "none");
    $("#add-map").html("");
    $(".container").addClass("overflow_hide");
    $(".menu li").removeClass("active_menu");
}

function showPlace(pos) {
    center = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
    newPlace(center)
}

function errorPlace(err) {
    center = new google.maps.LatLng(40.186027, 44.515030);
    newPlace(center)
}

function newPlace(center) {
    $('.add-src').height($('.add-src').width());
    var options = {
        center: center,
        zoom: 18,
        scrollwheel: false,
        zoomControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
    }
    var new_map = new google.maps.Map(document.getElementById('add-map'), options);
    var new_marker = new google.maps.Marker({
        map: new_map,
        position: center,
        optimized: false,
        draggable: true,
    });
    $(".hidden-lat").val(parseFloat(new_marker.getPosition().lat()).toFixed(7));
    $(".hidden-long").val(parseFloat(new_marker.getPosition().lng()).toFixed(7));
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({'location': center}, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            $(".add-address").val(results[0].formatted_address);
        }
    });
    new_marker.addListener('dragend', function () {
        $(".hidden-lat").val(parseFloat(new_marker.getPosition().lat()).toFixed(7));
        $(".hidden-long").val(parseFloat(new_marker.getPosition().lng()).toFixed(7));
        var latlng = new google.maps.LatLng(parseFloat(new_marker.getPosition().lat()).toFixed(7), parseFloat(new_marker.getPosition().lng()).toFixed(7));
        geocoder.geocode({'location': latlng}, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                $(".add-address").val(results[0].formatted_address);
            }
        });
    })
}

/* function win(res) {
    $("#add_places").hide();
    $(".add-name").val("");
    $(".add-descript").val("");
    $(".add-src").css("background-image", "none");
    $("#add-map").html("");
    $(".gps1, footer, .arr-wrapper").show();
    $("#main").removeClass("left_pos");
    $("#main").addClass("null_pos");
    $(".radio-wrap .add_img_icon)").removeClass("add_img_icon_park");
    $(".radio-wrap .add_img_icon").removeClass("active_icon");
    $(".radio-wrap .add_img_icon:first-child").addClass("add_img_icon_park").addClass("active_icon");
    $(".container").addClass("overflow_hide");
    $(".menu li").removeClass("active_menu");

} */

function fail() {
    navigator.notification.alert('Please, try later',alertVote,'','OK');
}

function alertDismissed(){
    $("#new_places").hide();
    $("#main").removeClass("left_pos");
    $("#main").addClass("null_pos");  
}

function alertVote(){
    return false;
}