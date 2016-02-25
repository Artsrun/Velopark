//http://185.8.2.232:7002/velopark/
if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {
    document.addEventListener("deviceready", devicered, false);
} else {
    devicered(); //this is the browser
}


function devicered() {
    if (navigator.connection.type == "none") {
        $(document).ready(function () {
            $(".gps1, #arr_down").hide();
            $("#about, #add_places, #new_places").hide();
            $("nav").css("marginTop", 0 - 1.4 * $("nav").height());
            $("nav").css("display", "block");
            $(".menu").fadeOut(1);
            $("#map-canvas").html('<img src="img/no_internet.png" alt="" style="height: 19%; width: 38%; position: absolute; left: 31%; top: 32%">');
            document.addEventListener("online", onLine, false);
            function onLine() {
                $(".gps1, #arr_down").show();
                $("#map-canvas").html("");
                var script_tag = document.createElement('script');
                script_tag.setAttribute("type", "text/javascript");
                script_tag.setAttribute("src", "https://maps.googleapis.com/maps/api/js?sensor=false&key=AIzaSyD7gPtsOo5EzPh1eD0n8hOLqA4CVgmZHEc&callback=inits");
                (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
            }
        });
        return;
    } else {
        $(document).ready(function () {
            var script_tag = document.createElement('script');
            script_tag.setAttribute("type", "text/javascript");
            script_tag.setAttribute("src", "https://maps.googleapis.com/maps/api/js?sensor=false&key=AIzaSyD7gPtsOo5EzPh1eD0n8hOLqA4CVgmZHEc&callback=inits");
            (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
        })
    }


}


function inits() {
    $("#about, #add_places, #new_places").hide();
    openNav();
    openMenu();
    $('.swipebox_new').swipebox();

    $(".logo").on("click", function () {
        if ($("#main").hasClass("left_pos")) {
            $(window).unbind("scroll");
            $("#about, #add_places, #new_places").hide();
            $("#new_places .wrapper").html("");
            $("#new_places .wrapper").append("<h1>Review</h1>");
            $(".gps1, footer, .arr-wrapper").show();
            $("#main").removeClass("left_pos");
            $("#main").addClass("null_pos");
            $(".add-name").val("");
            $(".add-descript").val("");
            $(".add-src").css("background-image", "none");
            $("#add-map").html("");
            $(".menu").fadeOut(200);
            $(".radio-wrap .add_img_icon").removeClass("add_img_icon_park");
            $(".radio-wrap .add_img_icon").removeClass("active_icon");
            $(".radio-wrap .add_img_icon:first-child").addClass("add_img_icon_park").addClass("active_icon");
            $(".container").addClass("overflow_hide");
            $(".menu li").removeClass("active_menu");
            $(".add-src").css("background-image", "none");
        }

    });

    $(".menu a").on("click", function () {
        if ($(this).hasClass("addpl")) {
            $(window).unbind("scroll");
            $("#new_places .wrapper").html("");
            $("#new_places .wrapper").append("<h1>Review</h1>");
            $("#about, #new_places").hide();
            $("#main").removeClass("null_pos");
            $("#main").addClass("left_pos");
            $(".gps1, .arr-wrapper, footer").hide();
            $(".container").removeClass("overflow_hide");
            $(".menu").hide();
            $(".backg-cubs").removeClass("backg_up");
            $(".menu li").removeClass("active_menu");
            $(".menu li:first-child").addClass("active_menu");

            addPlace();
            $("#add_places .add_place_icon").on("click", function () {
                var options = new FileUploadOptions();
                options.fileKey = "file";
                options.fileName = "name.jpg";
                options.mimeType = "image/jpeg";
                var params = {};
              //  params.device_id = "dfdfdfdfsdf";
                 params.device_id = device.uuid;
                params.lat = $(".hidden-lat").val();
                params.long = $(".hidden-long").val();
                params.address = $(".add-address").val();
                params.name = $(".add-name").val();
                params.desc = $(".add-descript").val();
                params.type = $('.active_icon').attr("data-type");
                params.action = "upload";
                options.params = params;
                var image = $(".add-image").attr("src");
                var ft = new FileTransfer();
                ft.upload(image, encodeURI("http://185.8.2.232:7002/velopark/"), win, fail, options);
            })

        } else if ($(this).hasClass("newpl")) {
            if (!$("#new_places").is(":visible")) {
                $("#about,  #add_places").hide();
                $("#main").removeClass("null_pos");
                $("#main").addClass("left_pos");
                $(".gps1, .arr-wrapper, footer").hide();
                $(".container").removeClass("overflow_hide");
                $(".menu").hide();
                $(".backg-cubs").removeClass("backg_up");
                $(".radio-wrap .add_img_icon").removeClass("add_img_icon_park");
                $(".radio-wrap .add_img_icon").removeClass("active_icon");
                $(".radio-wrap .add_img_icon:first-child").addClass("add_img_icon_park").addClass("active_icon");
                $("#new_places").show();
                $(".menu li").removeClass("active_menu");
                $(".menu li:nth-child(2)").addClass("active_menu");
                $(".pl_count").css("display", "none");
                $(".add-name").val("");
                $(".add-descript").val("");
                $(".add-src").css("background-image", "none");
                $("#add-map").html("");
            //    var uuid = "dfdfdfdfsdf";
                  var uuid = device.uuid;
                $.ajax({
                    url: "http://185.8.2.232:7002/velopark/",
                    method: "POST",
                    data: {
                        action: "addplaces",
                        unique_id: uuid
                    },
                    dataType: 'json',
                    beforeSend: function () {
                        $("#new_places .wrapper").append("<img src='img/ajax_loader.gif' alt='' class='loader'>");
                    },
                    success: function (res) {
                        $("#new_places .wrapper .loader").remove();
                        selectVoting(res);
                    },
                    error:function(err){
                        $("#new_places .wrapper .loader").remove();
                        navigator.notification.alert('Please, try later',alertDismissed,'','OK');
                    }
                })
            }
        } else if ($(this).hasClass("ab")) {
            if (!$("#about").is(":visible")) {
                $(window).unbind("scroll");
                $("#new_places .wrapper").html("");
                $("#new_places .wrapper").append("<h1>Review</h1>");
                $("#add_places, #new_places").hide();
                $(".add-name").val("");
                $(".add-descript").val("");
                $(".add-src").css("background-image", "none");
                $("#add-map").html("");
                $("#main").removeClass("null_pos");
                $("#main").addClass("left_pos");
                $(".gps1, .arr-wrapper, footer").hide();
                $(".container").addClass("overflow_hide");
                $(".menu").hide();
                $(".backg-cubs").removeClass("backg_up");
                $(".radio-wrap .add_img_icon").removeClass("add_img_icon_park");
                $(".radio-wrap .add_img_icon").removeClass("active_icon");
                $(".radio-wrap .add_img_icon:first-child").addClass("add_img_icon_park").addClass("active_icon");
                $("#about").show();
                $(".menu li").removeClass("active_menu");
                $(".menu li:nth-child(3)").addClass("active_menu");
            }
        }
    });

    var mainmarkers = [];
    showPosition.count = 1;
    function showPosition(position) {
        if (showPosition.count == 1) {
            var myLatlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            map.setCenter(myLatlng);
            var mainMarker = addMarker(map, "img/marcer_main.png", myLatlng);
            mainmarkers.push(mainMarker);
            showPosition.count = 2;

        }
        mainmarkers[0].setPosition(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
        mainmarkers[0].setAnimation(null);
        $(".gps1").unbind("click");
        $(".gps1").on("click", function (e) {
            map.panTo(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
        });
    }
    window.flag = 1;
    function showError(error) {
        var erLatlng = new google.maps.LatLng(40.186027, 44.515030);
        map.setCenter(erLatlng);
        window.flag = 1;
        $(".gps1").unbind("click");
        $(".gps1").on("click", function (e) {
            if (window.flag == 1) {
                map.panTo(new google.maps.LatLng(40.186027, 44.515030));
                navigator.geolocation.getCurrentPosition(showPosition2, showError2, {enableHighAccuracy: true, timeout: 3000, maximumAge: 100});
            }
            else {
                map.panTo(new google.maps.LatLng(40.186027, 44.515030));
            }
        });
    }

    function showPosition2() {
        window.flag = 2;
        navigator.geolocation.clearWatch(window.watchid);
        window.watchid = navigator.geolocation.watchPosition(showPosition, showError, {enableHighAccuracy: true, timeout: 3000, maximumAge: 100});
    }

    function showError2() {
        return false;
    }


    var mapOptions = {
        zoom: 14,
        scrollwheel: false,
        zoomControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
    };

    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    google.maps.event.addListenerOnce(map, 'idle', function () {
        navigator.splashscreen.hide();
    });

    window.watchid = navigator.geolocation.watchPosition(showPosition, showError, {enableHighAccuracy: true, timeout: 3000, maximumAge: 100});

    document.addEventListener("pause", onPause, false);
    document.addEventListener("resume", onResume, false);
    function onPause() {
        navigator.geolocation.clearWatch(window.watchid);
    }

    function onResume() {
        window.watchid = navigator.geolocation.watchPosition(showPosition, showError, {enableHighAccuracy: true, timeout: 3000, maximumAge: 100});
    }

    $.ajax({
        url: "http://185.8.2.232:7002/velopark/",
        method: "POST",
        data: {
            action: "version"
        },
        success: function (res) {
            if (localStorage.getItem("version") == res) {
                selectPlaces(db);
                
//                   db.transaction(function (tx) {
//                                tx.executeSql('DROP TABLE places', []);
//                                localStorage.clear();
//                            });
            } else {

                $.ajax({
                    url: "http://185.8.2.232:7002/velopark/",
                    method: "POST",
                    data: {
                        action: "index",
                        version: localStorage.getItem("version")
                    },
                    dataType: 'json',
                    success: function (response) {
                        db.transaction(function (tx) {
                            tx.executeSql('CREATE TABLE IF NOT EXISTS places(server_id integer unique,latitude varchar, longitude varchar, name text, address varchar, description text, image text, type varchar, status varchar)', []);
                            for (var i = 0; i < response.length; i++) {
                                if (response[i].status == "1") {
                                    tx.executeSql("UPDATE places SET latitude=?, longitude=?, name=?, address=?, description=?, image=?, type=?, status=? WHERE server_id=?", [response[i].latitude, response[i].longitude, response[i].name, response[i].address, response[i].description, response[i].image, response[i].type, response[i].status, response[i].id], null, null);
                                    tx.executeSql("INSERT OR IGNORE INTO places(server_id, latitude, longitude, name, address, description, image, type, status) values(?, ?, ?, ?, ?, ?, ?, ?, ?)", [response[i].id, response[i].latitude, response[i].longitude, response[i].name, response[i].address, response[i].description, response[i].image, response[i].type, response[i].status], null, null);
                                } else {
                                    tx.executeSql("DELETE FROM places WHERE server_id=?", [response[i].id], null, null);
                                }

                            }

                            localStorage.setItem("version", res);
                            selectPlaces(db);
                        });
                    },
                    error: function (err) {

                    }
                })

            }
        }
    });


    $.ajax({
        url: "http://185.8.2.232:7002/velopark/",
        method: "POST",
        data: {
            action: "new_count",
         //   device_id: "dfdfdfdfsdf",
            device_id: device.uuid,
        },
        success: function (data) {
            if (!isNaN(parseInt(localStorage.getItem("count")))) {
                var count = parseInt(data) - parseInt(localStorage.getItem("count"));
                if (count > 0) {
                    $(".pl_count").text(count);
                    $(".pl_count").css("display", "inline-block");
                }
                localStorage.setItem("count", data);
            } else {
                localStorage.setItem("count", data);
            }
        }
    })
    google.maps.event.addListener(map, "click", function () {

        $("footer").removeClass("transitiion");
        $("footer").addClass("tr1");
        $("footer").css({"marginBottom": 0 - $("footer").height() - 50});

        $(".gps1").removeClass("gpstransition").addClass("gpstransition1");
    });

    $(".radio-wrap .add_img_icon").on("click", function () {
        $(".radio-wrap .add_img_icon").removeClass("active_icon");
        $(".radio-wrap .add_img_icon").removeClass("add_img_icon_park");
        $(this).addClass("add_img_icon_park");
        $(this).addClass("active_icon");
    })

}







