//var db = openDatabase('places', '', 'the database of places', 4 * 1024 * 1024);
device = {};
device.uuid = 'aaaa';

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



function drawGroupMarkers(places, type, animation) {

    for (var k = 0; k < places.length; k++) {
        var myLatlng = new google.maps.LatLng(places[k].lat, places[k].long);
        var marker = addMarker(app.map, "img/marker_" + type + ".png", myLatlng, k);
        if (typeof animation != 'undefined') {
            marker.setAnimation(animation);
        }
        places[k].marker = marker;
        google.maps.event.addListener(marker, 'click', function () {
            var index = this.index;
            var dataParking = places[index];
            if (dataParking.img != "") {
                $(".footer-image").attr("src", "data:image/jpg;base64," + dataParking.img);
                $(".foot-link").attr("href", app.uploadsURL + dataParking.id + ".jpg");
            }else {
                $(".footer-image").attr("src", "img/foot_icon_" + type + ".png");
                $(".foot-link").removeAttr("href");
            }
            $('footer').slideDown(200);

            $('.gps1').addClass("gpstransition");
            $('footer').addClass("transitiion");

            addTextWithFade("footer .footer-info p.name", dataParking.name);
            addTextWithFade("footer .footer-info p.address", dataParking.address);
            addTextWithFade("footer .footer-info p.desc", dataParking.desc);
        });
    }
}

function addTextWithFade(selector, text) {
    $(selector).fadeOut(200, function () {
        $(selector).fadeIn(200).text(text);
    });

}

function load_place(i, places, map_size) {

    var output = "<div class='vot_wrap' id='vot_" + places[i].server_id + "' >";

    output += "<div class='vot_img_icon_wrap'>";
    if (places[i].img) {
        output += "<a class='swipebox_places " + places[i].type + "' rel='" + i + "' href='" + app.uploadsURL + places[i].server_id + ".jpg' onclick='return false;'><img class='vot_img' src='data:image/jpg;base64," + places[i].img + "' alt='' /></a>";
    } else {
        output += "<a class='swipebox_places noimage' onclick='return false;'>";
        if (places[i].type == "parking") {
            output += "<img class='vot_img' src='img/foot_icon_parking.png' />";
        } else if (places[i].type == "rent") {
            output += "<img class='vot_img' src='img/foot_icon_rent.png' />";
        } else if (places[i].type == "shop") {
            output += "<img class='vot_img' src='img/foot_icon_shop.png' />";
        } else if (places[i].type == "parts") {
            output += "<img class='vot_img' src='img/foot_icon_parts.png' />";
        }
        output += "</a>";
    }


    output += "<p>Name</p><p class='cont'>" + places[i].name + "</p><p>Address</p><p class='cont'>" + places[i].address + "</p>";

    if (places[i].desc) {
        output += "<p>Description</p><p class='cont'>" + places[i].desc + "</p>";
    }
    output += "</div>";
    output += "<div style='width:100%; margin: 15px auto; ' class='place_map' id='place_map_" + places[i].server_id + "'  data-src='https://maps.googleapis.com/maps/api/staticmap?center=" + places[i].lat + "," + places[i].long + "&markers=color:red%7C" + places[i].lat + "," + places[i].long + "&zoom=17&size=" + map_size.width + "x" + map_size.height + "&maptype=roadmap&sensor=false&key=AIzaSyDWni7BlYAkC1YNv-ACLopJ5kxoc1jTCWY'></div>";
    output += "<div class='new_place_icon_wrap'><img src='img/add_place.png' class='new_place_icon' alt='' data-value='1'><img src='img/new_place.png' class='new_place_icon' alt='' data-value='0'></div>";
    output += "<span class='hr'></span></div>";
    $("#new_places .content").append(output);
    
    app.activateSwipebox('#vot_' + places[i].server_id + ' .swipebox_places:not(".noimage")');
}

function elementInViewport(el) {

    var top = el.offsetTop;
    var left = el.offsetLeft;
    var width = el.offsetWidth;
    var height = el.offsetHeight;

    while (el.offsetParent) {
        el = el.offsetParent;
        top += el.offsetTop;
        left += el.offsetLeft;
    }

    var win = window;
    var scrollWin = $('#new_places .wrapper');

    return (
            top < (scrollWin.scrollTop() + win.innerHeight) &&
            left < (scrollWin.offset().left + win.innerWidth) &&
            (top + height) > scrollWin.scrollTop() &&
            (left + width) > scrollWin.offset().left
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

        $('#new_places .wrapper').unbind("scroll");
        var scrollTimer;
        $('#new_places .wrapper').scroll(function () {
            clearTimeout(scrollTimer);
            if (app.getActivePage() != 'new_places') {
                return true;
            }
            scrollTimer = setTimeout(function () {
                var allVoteElements = $('.vot_wrap:not(".loaded")');
                allVoteElements.each(function () {
                    if (elementInViewport($(this)[0])) {
                        $(this).addClass('loaded');
                        var $mapContainer = $(this).find('.place_map[data-src]');
                        var $img = $('<img />');
                        $img.css('opacity', 0);
                        $img[0].onload = function () {
                            $mapContainer.css('background-image', 'none');
                            $img.css('opacity', 1);
                        }
                        $mapContainer.html($img);
                        $img.attr('src', $mapContainer.data('src'));
                    }
                });
            }, 400);
        });
        $('#new_places .wrapper').trigger('scroll');

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
                error: function (error) {
                    navigator.notification.alert('Please, try later', alertVote, '', 'OK');
                }
            })

        });
    } else {
        $("#new_places .wrapper ").append("<p class='no_place_text'>There is no place to vote.</p>");
    }
}

function addMarker(map, myicon, pos, index) {

    var marker = new google.maps.Marker({
        map: map,
        position: pos,
        animation: google.maps.Animation.DROP,
        optimized: false,
        draggable: false,
        icon: myicon,
        opacity: 0.0,
        index: index
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

function fail() {
    navigator.notification.alert('Please, try later', alertVote, '', 'OK');
}

function alertDismissed() {
    $("#new_places").hide();
    $("#main").removeClass("left_pos");
    $("#main").addClass("null_pos");
}

function alertVote() {
    return false;
}