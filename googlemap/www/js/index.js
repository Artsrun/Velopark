/* MAIN APP CLASS */
var DEBUG = false;
if (DEBUG) {
    device = {};
    device.uuid = '546546';
    device.platform = 'android';
    device.version = '2.3.1';
}

var app = {
    // Application Constructor
    apiURL: "http://velopark.am/api/",
    uploadsURL: 'http://velopark.am/uploads/',
    map: null,
    db: null,
    data: {
        parking: null,
        rent: null,
        shop: null,
        parts: null
    },
    positionWatchId: null,
    firstLoad: true,
    defaultType: 'parking',
    onlineStatus: '',
    gMapApiKey: 'AIzaSyBiXhsB_EDoECMR_bJiRSGnRllbLQPAeXA', // 'AIzaSyBSTzxHlrxgWyu3k59l4nf-c6kfuDf1D-U',
    defaultLocation: {
        latitude: 40.1778541,
        longitude: 44.5136349
    },
    geolocationOptions: {
        enableHighAccuracy: true,
        timeout: 3000,
        maximumAge: 0
    },
    mapOptions: {
        zoom: 14,
        scrollwheel: false,
        zoomControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false
    },
    markerOptions: {
        places: {
            w: 28,
            h: 44
        },
        me: {
            w: 15,
            h: 15
        }
    },
    getLocalVersion: function () {
        if (localStorage.getItem("version")) {
            return localStorage.getItem("version");
        } else {
            return 0;
        }

    },
    initialize: function () {
        if (DEBUG) {
            $(document).ready(function () {
                app.bindEvents();
            });
        } else {
            app.bindEvents();
        }
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        if (DEBUG) {
            app.onDeviceReady();
        } else {
            document.addEventListener("deviceready", this.onDeviceReady, false);
        }
        document.addEventListener("online", this.onLine, false);
        document.addEventListener("offline", this.offLine, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        app.db = openDatabase('places', '', 'the database of places', 4 * 1024 * 1024);
        $('html').addClass(device.platform.toLowerCase());
        if (device.platform.toLowerCase() == 'android' && parseInt(device.version) <= 3) {
            $('html').addClass('oldAndroid');
        }
        if (DEBUG) {
            app.onlineStart = true;
            app.googleMapEmbed();
        } else {
            if (navigator.connection && navigator.connection.type != "none") {
                app.onlineStart = true;
                app.googleMapEmbed();
            } else {
                app.onlineStart = false;
                app.start('offlineMap');
            }
        }
        document.addEventListener("pause", app.onPause, false);
        document.addEventListener("resume", app.onResume, false);
        document.addEventListener('backbutton', app.backButton, false);
    },
    backButton: function () {
        if (location.hash == '' || location.hash == '#main') {
            navigator.app.exitApp();
        } else if (location.hash == '#swipebox') {
            $.swipebox.close();
            app.setLocationHash(app.getActivePage());
        } else {
            app.goToPage('main');
        }
    },
    onLine: function () {
        if (app.onlineStatus != '' && app.onlineStatus != 'online') {
            app.onlineStatus = 'online';
            /* add class to body for further usage */

            $('html').removeClass('offline');
            $('html').removeClass('offlineMap');
            $('html').addClass('online');

            if (app.getActivePage() == 'new_places') {
                app.getNewPlaces();
            }

            if (app.getActivePage() == 'add_places') {
                app.openCameraDialog();
            }
            //$(".gps1, #arr_down").show();
            if (app.onlineStart == false) {
                app.onlineStart = true;
                app.googleMapEmbed();
            }
        }
    },
    offLine: function () {
        if (app.onlineStatus != 'offline') {
            app.onlineStatus = 'offline';
            /* add class to body for further usage */
            $('html').removeClass('online');
            $('html').addClass('offline');
        }
    },
    // Update DOM on a Received Event
    receivedEvent: function (id) {
        console.log(id);
    },
    goToPage: function (pageId) {
        if ($('#' + pageId).hasClass('active')) {
            return false;
        } else {
            $('.page').removeClass('active');
        }
        /* hide menu */
        fadeOut('.menu');


        /* reset to default state */
        $('#add_places input, #add_places textarea').val('');
        $("#add_places .add-src").css("background-image", "none");
        $("#add-map").html("");
        $(".radio-wrap .add_img_icon").removeClass("add_img_icon_park");
        $(".radio-wrap .add_img_icon").removeClass("active_icon");
        $(".radio-wrap .add_img_icon:first-child").addClass("add_img_icon_park").addClass("active_icon");
        $("input.error, textarea.error").removeClass('error');

        if (pageId == 'main') {
            if (!app.positionStatus) {
                this.onResume();
            }
            //$(".gps1, footer").show();
            $(".arr-wrapper").removeClass('arr_back');
        } else {
            this.onPause();
            //$(".gps1, footer").hide();
            $(".arr-wrapper").addClass('arr_back');
        }

        if (pageId == 'new_places') {
            $('header').removeClass('new_not');
        }
        /* correct menu */
        $('.menu li').removeClass("active_menu");
        $('.menu li[data-page="' + pageId + '"]').addClass("active_menu");

        /* hide other pages */
        $('.page').addClass('hidden');
        /* show correct page */
        $('#' + pageId).removeClass('hidden').addClass('active');
        $('html').attr('data-active', pageId);
        app.setLocationHash(pageId);
        window.scrollTo(0, 0)
        return true;
    },
    getActivePage: function () {
        return $('.page.active').attr('id');
    },
    getNewPlaces: function () {
        $("#new_places .wrapper .content").empty();

        if (this.onlineStatus === 'offline') {
            this.noConnection();
            return false;
        }
        $.ajax({
            url: app.apiURL,
            method: "POST",
            data: {
                action: "get_votes",
                unique_id: device.uuid
            },
            dataType: 'json',
            beforeSend: function () {
                $('html').addClass('fullHeight');
                addLoader('#new_places');
                //$("#new_places .wrapper").append("<img src='img/ajax_loader.gif' alt='' class='loader'>");
            },
            success: function (res) {
                //$("#new_places .wrapper .loader").remove();
                removeLoader('#new_places');
                if (res.status == 'success') {
                    app.showPlacesForVote(res.data);
                } else {
                    if (app.getActivePage() === 'new_places') {
                        app.notification('Oops', 'Something went wrong', 'Close', function () {
                            app.goToPage('main');
                        });
                    }
                }
            },
            error: function (err) {
                removeLoader('#new_places');
                //$("#new_places .wrapper .loader").remove();
                if (app.getActivePage() === 'new_places') {
                    app.notification('Oops', 'Something went wrong', 'Close', function () {
                        app.goToPage('main');
                    });
                }
            }
        });
    },
    notification: function (title, text, button, callback) {
        if (callback == null) {
            callback = function () {
            };
        }
        if (DEBUG) {
            alert(text)
        } else {
            navigator.notification.alert(text, callback, title, button);
        }
    },
    noConnection: function (txt) {
        if (typeof txt == 'undefined') {
            txt = 'There is no internet connection';
        }
        console.log(txt);
    },
    addNewPlace: function (options) {

        if (this.onlineStatus === 'offline') {
            this.noConnection();
            return false;
        }
        $('.error_msg').removeClass('show');
        $('#add_places .error').removeClass('error');

        var error = false;
        if ($.trim($(".add-address").val()) == '') {
            $(".add-address").addClass('error');
            error = true;
        }

        if ($.trim($(".add-name").val()) == '') {
            $(".add-name").addClass('error');
            error = true;
        }

        if ($(".add-descript").val().length > 250) {
            $(".add-descript").addClass('error');
            error = true;
        }

        if ($(".add-name").val().length > 50) {
            $(".add-name").addClass('error');
            error = true;
        }

        if ($(".add-address").val().length > 100) {
            $(".add-address").addClass('error');
            error = true;
        }

        if (error) {
            $('.error_msg').addClass('show');
            setTimeout(function () {
                $('.error_msg').removeClass('show');
            }, 2000);
        } else {
            var options = new FileUploadOptions();
            options.fileKey = "file";
            options.fileName = "name.jpg";
            options.mimeType = "image/jpeg";

            var params = {};
            params.device_id = device.uuid;
            params.lat = $(".hidden-lat").val();
            params.long = $(".hidden-long").val();
            params.address = $(".add-address").val();
            params.name = $(".add-name").val();
            params.desc = $(".add-descript").val();
            params.type = $('.active_icon').attr("data-type");
            params.action = "add_place";
            options.params = params;

            var image = $(".add-image").attr("src");
            var ft = new FileTransfer();

            addLoader('#add_places');

            ft.upload(image, encodeURI(app.apiURL),
                    function () {
                        removeLoader('#add_places');
                        if (app.getActivePage() === 'add_places') {
                            app.goToPage('main');
                        }
                    },
                    function () {
                        removeLoader('#add_places');
                        if (app.getActivePage() === 'add_places') {
                            app.notification('Oops', 'Something went wrong', 'Close', null);
                        }
                    }, options);
        }
    },
    showPlacesForVote: function (places) {
        $("#new_places .wrapper .content").empty();

        var map_width = parseInt($("#new_places .wrapper").outerWidth(true));
        var map_size = {
            width: map_width,
            height: parseInt(map_width / 2)
        }
        if (places.length) {
            for (var i = 0; i < places.length; i++) {
                var output = "<div class='vot_wrap' id='vot_" + places[i].server_id + "' data-id='" + places[i].server_id + "' >";

                output += "<div class='vot_img_icon_wrap'>";
                if (places[i].image) {
                    output += "<a class='swipebox_places " + places[i].type + "' rel='" + i + "' href='" + app.uploadsURL + places[i].server_id + ".jpg' onclick='return false;'><img class='vot_img' src='data:image/jpg;base64," + places[i].image + "' alt='' /></a>";
                } else {
                    output += "<a class='swipebox_places noimage' ontouch='return false;'>";
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
                output += "</div>";
                if (places[i].description) {
                    output += "<p>Description</p><p class='cont'>" + places[i].description + "</p>";
                }
                output += "<div style='height:" + map_size.height + "px' class='place_map' id='place_map_" + places[i].server_id + "'  data-src='https://maps.googleapis.com/maps/api/staticmap?center=" + places[i].latitude + "," + places[i].longitude + "&markers=icon:http://velopark.am/images/marker_" + places[i].type + "_small.png|" + places[i].latitude + "," + places[i].longitude + "&zoom=17&size=" + map_size.width + "x" + map_size.height + "&maptype=roadmap&sensor=false&scale=2&key=" + this.gMapApiKey + "'></div>";
                output += "<div class='new_place_icon_wrap'><a  href='javascript:void(0);' class='new_place_icon accept' data-value='1'></a><a href='javascript:void(0);' class='new_place_icon decline' data-value='0'></a></div>";
                output += "<span class='hr'></span></div>";
                $("#new_places .content").append(output);

                app.activateSwipebox('#vot_' + places[i].server_id + ' .swipebox_places:not(".noimage")');
            }
            $(app.pageScrollTarget).trigger('scroll');
            $('html').removeClass('fullHeight');
        } else {
            $("#new_places .wrapper .content ").html("<p class='no_place_text'>Nothing to review</p>");
        }
    },
    voteForPlace: function (voteData) {

        if (this.onlineStatus === 'offline') {
            this.noConnection();
            return false;
        }
        $.ajax({
            url: app.apiURL,
            method: "POST",
            data: {
                action: "add_vote",
                device_id: voteData['device_id'],
                vote: voteData['vote'],
                place_id: voteData['place_id']
            },
            dataType: 'json',
            beforeSend: function () {
                addLoader('[data-id="' + voteData['place_id'] + '"]');
            },
            success: function (res) {
                if (res.status == 'success') {
                    localStorage.setItem("count", parseInt(localStorage.getItem("count")) - 1);
                    var $blockEl = $('[data-id="' + voteData['place_id'] + '"]');
                    var curHeight = $blockEl.outerHeight(true);//arsen
//                    $blockEl.css('height', $blockEl.outerHeight());//arshak
                    $('.vot_wrap').addClass('vot_transition');//arsen
                    $blockEl.addClass('swipe');

                    setTimeout(function () {
//                        $blockEl.removeClass('loading').empty();//arshak
//                        $blockEl.addClass('hideHeight');//arshak
//                        //$blockEl[0].offsetHeight;
//                        $blockEl.css('height', 0);//arshak
//                        $blockEl.css('margin', 0);//arshak
                        $blockEl.nextAll().css('transform', 'translateY(-' + curHeight + 'px)').css('-webkit-transform', 'translateY(-' + curHeight + 'px)');//arsen
                    }, 250);

                    setTimeout(function () {
                        $('.vot_wrap').removeClass('vot_transition');//arsen
                        $blockEl.nextAll().removeAttr('style');//arsen
                        $blockEl.remove();
                        $(app.pageScrollTarget).trigger('scroll');
                        if ($("#new_places .wrapper .content .vot_wrap").length == 0) {
                            $("#new_places .wrapper .content").html("<p class='no_place_text'>Nothing to review</p>");
                        }
                    }, 500);
                } else {
                    removeLoader('[data-id="' + voteData['place_id'] + '"]');
                    app.notification('Oops', 'Something went wrong', 'Close', null);
                }
            },
            error: function (error) {
                removeLoader('[data-id="' + voteData['place_id'] + '"]');
                app.notification('Oops', 'Something went wrong', 'Close', null);
            }
        });
    },
    onPause: function () {
        app.positionStatus = false;
        navigator.geolocation.clearWatch(app.positionWatchId);
    },
    onResume: function () {
        setTimeout(function () {
            if (app.getActivePage() == 'main') {
                navigator.geolocation.clearWatch(app.positionWatchId);
                app.positionWatchId = navigator.geolocation.watchPosition(app.onPositionSuccess, app.onPositionError, app.geolocationOptions);
            }
        }, 100);
    },
    getNewPlacesCount: function () {
        if (this.onlineStatus === 'offline') {
            this.noConnection();
            return false;
        }
        $.ajax({
            url: app.apiURL,
            method: "POST",
            data: {
                action: "get_count",
                device_id: device.uuid
            },
            dataType: 'json',
            success: function (res) {
                if (res.status == 'success') {
                    var data = res.data;
                    if (!isNaN(parseInt(localStorage.getItem("count")))) {
                        var count = parseInt(data) - parseInt(localStorage.getItem("count"));
                        if (count > 0) {
                            $('header').addClass('new_not');
                        }
                        localStorage.setItem("count", data);
                    } else {
                        localStorage.setItem("count", data);
                    }
                } else {
                    // error while trying to get count, do nothing
                }
            },
            error: function (err) {
                // error while trying to get new places count, do nothing
            }
        });
    },
    checkDBVersion: function () {
        if (this.onlineStatus === 'offline') {
            this.noConnection();
            return false;
        }
        $.ajax({
            url: app.apiURL,
            method: "POST",
            data: {
                action: "get_version"
            },
            dataType: 'json',
            success: function (res) {
                if (res.status == 'success') {
                    /* no updates on server */
                    if (app.getLocalVersion() != res.data) {
                        /* get updates from server and insert to local db */
                        app.updateDB(res.data);
                    }
                }
            }
        });
    },
    updateDB: function (version) {
        if (this.onlineStatus === 'offline') {
            this.noConnection();
            return false;
        }
        $.ajax({
            url: app.apiURL,
            method: "POST",
            data: {
                action: "get_places",
                version: app.getLocalVersion()
            },
            dataType: 'json',
            success: function (res) {
                if (res.status == 'success') {
                    var response = res.data;
                    app.db.transaction(function (tx) {
                        tx.executeSql('CREATE TABLE IF NOT EXISTS places(server_id integer PRIMARY KEY unique,latitude REAL, longitude REAL, name text, address varchar, description text, image text, type varchar, status varchar)', []);
                        for (var i = 0; i < response.length; i++) {
                            if (response[i].status === "1") {
                                tx.executeSql("UPDATE places SET latitude=?, longitude=?, name=?, address=?, description=?, image=?, type=?, status=? WHERE server_id=?", [response[i].latitude, response[i].longitude, response[i].name, response[i].address, response[i].description, response[i].image, response[i].type, response[i].status, response[i].id], null, null);
                                tx.executeSql("INSERT OR IGNORE INTO places(server_id, latitude, longitude, name, address, description, image, type, status) values(?, ?, ?, ?, ?, ?, ?, ?, ?)", [response[i].id, response[i].latitude, response[i].longitude, response[i].name, response[i].address, response[i].description, response[i].image, response[i].type, response[i].status], null, null);
                            } else {
                                tx.executeSql("DELETE FROM places WHERE server_id=?", [response[i].id], null, null);
                            }
                        }
                        if (app.getLocalVersion() == 0) {
                            app.selectPlaces(app.defaultType);
                        }
                        localStorage.setItem("version", version);
                    });
                }
            }
        });
    },
    getPlaceFromDB: function (server_id, callback) {
        app.db.transaction(function (tx) {
            tx.executeSql("SELECT * FROM places WHERE server_id='" + server_id + "'", [], function (tx, results) {
                var row = results.rows.item(0);
                if (row) {
                    callback(row);
                }
            });
        });
    },
    initMap: function () {
        var mainMarker = null;
        app.positionStatus = false;
        app.currentLocation = {
            latitude: app.defaultLocation.latitude,
            longitude: app.defaultLocation.longitude
        };
        app.onPositionSuccess = function (position) {
            app.positionStatus = true;

            app.currentLocation.latitude = position.coords.latitude;
            app.currentLocation.longitude = position.coords.longitude;

            var myLatlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            if (mainMarker == null) {
                app.map.setCenter(myLatlng);
                var image = {
                    url: "img/marcer_main.png",
                    scaledSize: new google.maps.Size(app.markerOptions.me.w, app.markerOptions.me.h)
                };
                mainMarker = addMarker(app.map, image, myLatlng);
            }
            mainMarker.setPosition(myLatlng);
            mainMarker.setAnimation(null);
        }

        app.onPositionError = function (error) {
            //if(device.platform.toLowerCase() == 'android'){		//            var erLatlng = new google.maps.LatLng(app.defaultLocation.latitude, app.defaultLocation.longitude);
            setTimeout(function () {		//            app.map.setCenter(erLatlng);
                navigator.geolocation.clearWatch(app.positionWatchId);
                app.positionWatchId = navigator.geolocation.watchPosition(app.onPositionSuccess, app.onPositionError, app.geolocationOptions);
            }, 3000);
            //}
        }

        this.mapOptions['center'] = new google.maps.LatLng(app.defaultLocation.latitude, app.defaultLocation.longitude);

        app.map = new google.maps.Map(document.getElementById('map-canvas'), this.mapOptions);

        /* hide splashscreen when map loaded */
        google.maps.event.addListenerOnce(app.map, 'idle', function () {
            if (navigator.splashscreen) {
                navigator.splashscreen.hide();
            }
            /* select places if exist */
            if (app.getLocalVersion() != 0) {
                app.selectPlaces(app.defaultType);
            }

        });
        /* atach events to map */
        google.maps.event.addListener(app.map, "click", function () {
            if (app.activeMarker) {
                app.activeMarker.setAnimation(null);
                app.activeMarker = null;
            }
            $(".controls").removeClass("transition");
        });
        /* gps button functionality */
        $(".gps1").off("click.gps");
        $(".gps1").on("click.gps", function (e) {
            if (app.positionStatus == false) {
                navigator.geolocation.clearWatch(app.positionWatchId);
                app.positionWatchId = navigator.geolocation.watchPosition(app.onPositionSuccess, app.onPositionError, app.geolocationOptions);
            } else {
                app.map.panTo(new google.maps.LatLng(app.currentLocation.latitude, app.currentLocation.longitude));
            }
        });
        /* attach position watcher */
        navigator.geolocation.clearWatch(app.positionWatchId);
        app.positionWatchId = navigator.geolocation.watchPosition(app.onPositionSuccess, app.onPositionError, app.geolocationOptions);
    },
    start: function (onlineMap) {
        if (typeof onlineMap != 'undefined') {
            $('html').addClass('offlineMap');
        }
        /*nav functionality*/
        if (this.firstLoad == true) {
            this.firstLoad = false;
            $(".arr-wrapper").on('click', function () {
                if ($(this).hasClass('arr_back')) {
                    app.goToPage('main');
                } else if ($(this).hasClass("arr_down")) {
                    $("nav").removeClass("nav_down");
                    $("nav").addClass("nav_up");

                    $(this).removeClass("arr_down");
                    $(this).addClass("arr_up");
                } else {
                    $("nav").removeClass("nav_up");
                    $("nav").addClass("nav_down");

                    $(this).addClass("arr_down");
                    $(this).removeClass("arr_up");
                }
            });

            /* menu functionality*/
            $(".backg-cubs").on('click', function () {
                fadeIn('.menu', function () {
                    $(".menu").addClass('active');
                });
                $("nav").removeClass("nav_up");
                $("nav").addClass("nav_down");

                $(".arr-wrapper").removeClass("arr_up");
                $(".arr-wrapper").addClass("arr_down");
                return false;
            });
            $(document).on("click", function () {
                if ($('.menu').hasClass('active')) {
                    fadeOut('.menu', function () {
                        $(".menu").removeClass('active');
                    });
                }
            });

            /* add new page checkbox */
            $(".radio-wrap .add_img_icon").on("click", function () {
                $(".radio-wrap .add_img_icon").removeClass("active_icon");
                $(".radio-wrap .add_img_icon").removeClass("add_img_icon_park");

                $(this).addClass("add_img_icon_park");
                $(this).addClass("active_icon");
            });

            /* activate swiepbox on footer image*/
            app.activateSwipebox('.foot-link.swipebox');

            $('.swipebox_add').on('click', function () {
                app.openCameraDialog(true);
            });

            $(".menu li").on("click", function () {
                var pageId = $(this).data('page');
                if (app.goToPage(pageId)) {
                    if (pageId == 'add_places' && app.onlineStatus != 'offline') {
                        if (DEBUG) {
                            var center = new google.maps.LatLng(app.defaultLocation.latitude, app.defaultLocation.longitude);
                            newPlace(center);
                        } else {
                            app.openCameraDialog();
                        }
                    } else if (pageId == 'new_places') {
                        app.getNewPlaces();
                    }
                }
            });

            $("#add_places .add_place_icon").on("click", function () {
                app.addNewPlace();
            });

            $('.menu_list img[data-type]').on('click', function () {
                if (app.data.status == 'ready') {
                    var type = $(this).data('type');
                    if (!$(this).hasClass('active')) {
                        app.selectPlaces(type);
                    } else {
                        $(this).removeClass('active');
                        for (var j in  app.data[type]['markers']) {
                            if (typeof app.data[type]['markers'][j] != 'object') {
                                continue;
                            }
                            removeMarker(app.data[type]['markers'][j]);
                        }
                        app.clearPlaces(type);
                    }
                }
            });

            $(document).on("click", "#new_places .new_place_icon_wrap .new_place_icon", function () {
                var div_wrapper = $(this).closest(".vot_wrap");
                app.voteForPlace({
                    device_id: device.uuid,
                    vote: $(this).attr("data-value"),
                    place_id: $(div_wrapper).data("id")
                });
            });

            var scrollTimer;
            if ($('html').hasClass('oldAndroid')) {
                app.pageScrollTarget = window;
            } else {
                app.pageScrollTarget = '#new_places .wrapper';
            }
            $(app.pageScrollTarget).scroll(function () {
                clearTimeout(scrollTimer);
                if (app.getActivePage() != 'new_places') {
                    return true;
                }
                scrollTimer = setTimeout(function () {
                    var allVoteElements = $('.vot_wrap:not(".loaded")');
                    allVoteElements.each(function () {
                        console.log(elementInViewport($(this)[0]))
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
        }
        if (app.onlineStart == true) {
            app.initMap();

            /* will check db version if anything new will call updateDB function; */
            app.checkDBVersion();

            /* get new places count */
            app.getNewPlacesCount();
        }

    },
    activateSwipebox: function (selector) {
        $(selector).swipebox({
            removeBarsOnMobile: false,
            beforeOpen: function () {
                app.setLocationHash('swipebox');
            }
        });
    },
    setLocationHash: function (hash) {
        location.hash = hash;
    },
    openCameraDialog: function (samePage) {
        if (typeof samePage == 'undefined') {
            samePage = false;
        }
        navigator.notification.confirm("Use camera or select from gallery",
                function confirmCamera(buttonIndex) {
                    if (buttonIndex == 1) {
                        navigator.camera.getPicture(function (imageURI) {
                            setTimeout(function () {
                                app.cameraSuccess(imageURI);
                            }, 0);
                        }, function () {
                            app.cameraError(samePage);
                        }, {quality: 75, sourceType: Camera.PictureSourceType.CAMERA, destinationType: Camera.DestinationType.NATIVE_URI, encodingType: Camera.EncodingType.JPEG, targetWidth: 800, targetHeight: 800, correctOrientation: true});
                    } else if (buttonIndex == 2) {
                        navigator.camera.getPicture(function (imageURI) {
                            setTimeout(function () {
                                app.cameraSuccess(imageURI, true);
                            }, 0);
                        }, function () {
                            app.cameraError(samePage);
                        }, {quality: 75, sourceType: Camera.PictureSourceType.PHOTOLIBRARY, destinationType: Camera.DestinationType.NATIVE_URI, encodingType: Camera.EncodingType.JPEG, targetWidth: 800, targetHeight: 800, correctOrientation: true});
                    } else {
                        if (samePage == false) {
                            app.goToPage('main');
                        }
                    }
                }, "Choose", ["Camera", "Gallery", "Close"]);
    },
    googleMapEmbed: function () {
        $("#map-canvas").html("");
        var script_tag = document.createElement('script');
        script_tag.setAttribute("type", "text/javascript");
        script_tag.setAttribute("src", "https://maps.googleapis.com/maps/api/js?v=3&key=" + this.gMapApiKey + "&language=en&callback=app.start");
        (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
    },
    selectPlaces: function (type) {
        if (typeof type == 'undefined') {
            type = 'parking';
        }
        var query = "SELECT server_id, latitude, longitude , type  FROM places WHERE status='1' AND type='" + type + "'";
        app.db.transaction(function (tx) {
            tx.executeSql(query, [], function (tx, results) {
                app.data[type] = {
                    markers: {}
                };
                app.data.status = 'ready';
                /* show markesr on map by type*/
                app.drawGroupMarkers(results.rows, type);
            });
        }, function () {
            console.log('error')
            app.data.status = 'error';
        });
    },
    clearPlaces: function (type) {
        app.data[type] = null;
        if (app.activeMarker) {
            app.activeMarker.setAnimation(null)
            app.activeMarker = null;
        }
        $(".controls").removeClass("transition");
    },
    drawGroupMarkers: function (places, type) {

        /* if there is no matched places do nothing */
        if (places.length == 0) {
            return;
        }

        $('img[data-type="' + type + '"]').addClass('active');
        $('header .green-menu .arr').addClass('visible');

        var image = {
            url: "img/marker_" + type + ".png",
            scaledSize: new google.maps.Size(app.markerOptions.places.w, app.markerOptions.places.h)
        };
        for (var k = 0; k < places.length; k++) {
            var place = places.item(k);
            var myLatlng = new google.maps.LatLng(place.latitude, place.longitude);
            var marker = addMarker(app.map, image, myLatlng, place.server_id, place.type);

            app.data[place.type].markers[k] = marker;
            app.atachInfoWindow(marker);
        }
    },
    atachInfoWindow: function (marker) {
        marker.addListener('click', function () {
            if (app.activeMarker) {
                app.activeMarker.setAnimation(null);
            }
            app.activeMarker = this;
            this.setAnimation(google.maps.Animation.BOUNCE);

            app.getPlaceFromDB(this.server_id, function (data) {
//                $(".footer-image img").attr("src", "");
                if (data.image) {
                    $(".footer-image").attr("src", "data:image/jpg;base64," + data.image);
                    $(".foot-link").attr("href", app.uploadsURL + data.server_id + ".jpg");
                    $(".foot-link").removeAttr("ontouchstart");
                } else {
                    $(".footer-image").attr("src", "img/foot_icon_" + data.type + ".png");
                    $(".foot-link").removeAttr("href");
                    $(".foot-link").attr("ontouchstart", "return false;");
                }
                $(".footer-image img").css('border', 'none');

                $("footer .footer-info p.name, footer .footer-info p.address, footer .footer-info p.desc").empty();

                $("footer .footer-info p.name").text(data.name);
                $("footer .footer-info p.address").text(data.address);
                if (data.description) {
                    $("footer .footer-info .label.fordesc").show();
                    $("footer .footer-info p.desc").text(data.description);
                } else {
                    $("footer .footer-info .label.fordesc").hide();
                    $("footer .footer-info p.desc").text('');
                }
                $('.controls').addClass("transition");
            });
        });
    },
    cameraSuccess: function (imageURI, fromGallery) {

        /* set image and activate default type */

        $(".add-image").attr("src", imageURI);
        $(".add-src").attr("href", imageURI);
        $(".add-src").css("background-image", "url(" + imageURI + ")");

        if (fromGallery) {
            window.resolveLocalFileSystemURI(imageURI,
                    function (entry) {
                        entry.file(function (file) {
                            var GPSLatitude, GPSLongitude;
                            EXIF.getData(file, function () {
                                GPSLatitude = EXIF.getTag(this, 'GPSLatitude');
                                GPSLongitude = EXIF.getTag(this, 'GPSLongitude');
                                if (GPSLatitude && GPSLongitude) {
                                    var latitude = (GPSLatitude[0] + (GPSLatitude[1] / 60) + (GPSLatitude[2] / 3600)).toFixed(7);
                                    var longitude = (GPSLongitude[0] + (GPSLongitude[1] / 60) + (GPSLongitude[2] / 3600)).toFixed(7);
                                    center = new google.maps.LatLng(latitude, longitude);
                                    newPlace(center, true);
                                } else {
                                    getCurrrentLocation();
                                }
                            });
                        }, function () {
                            getCurrrentLocation();
                        });
                    },
                    function (e) {
                        getCurrrentLocation();
                    }
            );
        } else {
            getCurrrentLocation(true);
        }

        function getCurrrentLocation(setMarker) {
            if (typeof setMarker == 'undefined') {
                setMarker = false;
            }
            navigator.geolocation.getCurrentPosition(function (pos) {
                center = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                newPlace(center, setMarker);
            }, function () {
                center = new google.maps.LatLng(app.defaultLocation.latitude, app.defaultLocation.longitude);
                newPlace(center);
            }, app.geolocationOptions);
        }
    },
    cameraError: function (samePage) {
        if (samePage) {
            return true;
        } else {
            app.goToPage('main');
        }
    }
};
app.initialize();

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
    var scrollWin = $(app.pageScrollTarget);

    if (typeof app.pageScrollTarget == 'object') {
        return (
                top < (window.pageYOffset + window.innerHeight) &&
                left < (window.pageXOffset + window.innerWidth) &&
                (top + height) > window.pageYOffset &&
                (left + width) > window.pageXOffset
                );
    }
    return (
            top < (scrollWin.scrollTop() + win.innerHeight) &&
            left < (scrollWin.offset().left + win.innerWidth) &&
            (top + height) > scrollWin.scrollTop() &&
            (left + width) > scrollWin.offset().left
            );
}


function addMarker(map, image, pos, id, type) {
    var marker = new google.maps.Marker({
        map: map,
        position: pos,
        optimized: true,
        draggable: false,
        icon: image,
        opacity: 1,
        server_id: id || null,
        type: type || null
    });
    return marker;
}

function removeMarker(marker) {
    marker.setMap(null);
}

function newPlace(center, setAddress) {
    $('.add-src').height($('.add-src').width());
    var options = {
        center: center,
        zoom: 18,
        scrollwheel: false,
        zoomControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false
    };
    var new_map = new google.maps.Map(document.getElementById('add-map'), options);

    var image = {
        url: "img/marker.png",
        scaledSize: new google.maps.Size(app.markerOptions.places.w, app.markerOptions.places.h)
    };
    var new_marker = new google.maps.Marker({
        map: new_map,
        position: center,
        optimized: true,
        draggable: true,
        icon: image
    });
    $(".hidden-lat").val(parseFloat(new_marker.getPosition().lat()).toFixed(7));
    $(".hidden-long").val(parseFloat(new_marker.getPosition().lng()).toFixed(7));
    var geocoder = new google.maps.Geocoder();
    if (setAddress) {
        geocoder.geocode({'location': center}, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                $(".add-address").val(results[0].formatted_address);
            }
        });
    }
    new_marker.addListener('dragend', function (event) {
        setNewAddress(event.latLng);
    });

    google.maps.event.addListener(new_map, 'click', function (event) {
        new_marker.setPosition(event.latLng);
        setNewAddress(event.latLng);
    });

    function setNewAddress(latLng) {
        var latitude = parseFloat(latLng.lat()).toFixed(7);
        var longitude = parseFloat(latLng.lng()).toFixed(7);

        $(".hidden-lat").val(latitude);
        $(".hidden-long").val(longitude);

        geocoder.geocode({'location': latLng}, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                $(".add-address").removeClass('error');
                $(".add-address").val(results[0].formatted_address);
            }
        });
    }
}


function addLoader(selector) {
    $(selector).addClass('loading');
    $(selector)[0].offsetHeight;
    $(selector).addClass('visibility');
}

function removeLoader(selector) {
    $(selector).removeClass('visibility');
    setTimeout(function () {
        $(selector).removeClass('loading');
    }, 200);
}

function fadeIn(selector, callback) {
    $(selector).addClass('fadeInStart');
    $(selector).removeClass('fadeOutComplete');
    $(selector).removeClass('fadeOut');
    $(selector).removeClass('fadeOutStart');

    $(selector)[0].offsetHeight;
    $(selector).addClass('fadeIn');

    if (typeof callback == 'function') {
        setTimeout(function () {
            callback();
        }, 300);
    }
}

function fadeOut(selector, callback) {
    $(selector).addClass('fadeOutStart');
    $(selector).removeClass('fadeInStart');
    $(selector).removeClass('fadeIn');
    $(selector)[0].offsetHeight;
    $(selector).addClass('fadeOut');
    setTimeout(function () {
        $(selector).addClass('fadeOutComplete');
        if (typeof callback == 'function') {
            callback();
        }
    }, 300);
}