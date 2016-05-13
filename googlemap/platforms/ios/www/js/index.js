/* MAIN APP CLASS */
var DEBUG = false;
if (DEBUG) {
    device = {};
    device.uuid = '5465sdfsdf46';
    device.platform = 'ios';
    device.version = '5.3.1';
    device.model = 'debug';
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
    systemMessage: {
        'title': 'Hey',
        'message': '',
        'show': false
    },
    positionWatchId: null,
    firstLoad: true,
    defaultType: 'parking',
    onlineStatus: '',
    gmapKeys: {
        'android': 'AIzaSyBiXhsB_EDoECMR_bJiRSGnRllbLQPAeXA',
        'ios': 'AIzaSyBZUh_y4RG1sUi5tSRFUBn6LduphbfP--s'
    },
    defaultLocation: {
        latitude: 40.1778541,
        longitude: 44.5136349
    },
    geolocationOptions: {
        enableHighAccuracy: true,
        timeout: 5000,
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
            this.onLine();
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
        /* hide splashscreen manually */
        setTimeout(function () {
            if (navigator.splashscreen) {
                navigator.splashscreen.hide();
            }
        }, 10000);

        app.db = openDatabase('places', '', 'the database of places', 4 * 1024 * 1024);
        if (app.db.version == "1") {
            app.db.changeVersion("1", "1.1", function (tx) {
                tx.executeSql('ALTER TABLE places  ADD COLUMN delete_counter integer DEFAULT  0;');
            });
        }
        if (app.db.version == "") {
            app.db.changeVersion("", "1.1");
        }
        
        app.platform = device.platform.toLowerCase();

        $('html').addClass(app.platform);

        app.gMapApiKey = app.gmapKeys[ app.platform];

        if (app.platform == 'android' && parseInt(device.version) < 3) {
            $('html').addClass('oldAndroid');
        }
        if (DEBUG) {
            app.onlineStart = true;
            app.onlineStatus = 'online';
            $('html').addClass('online');
            app.googleMapEmbed();
        } else {
            if (navigator.connection && navigator.connection.type != "none") {
                app.onlineStatus = 'online';
                $('html').addClass('online');

                app.onlineStart = true;
                app.googleMapEmbed();
            } else {
                app.onlineStart = false;
                app.start('offlineMap');
                if (navigator.splashscreen) {
                    navigator.splashscreen.hide();
                    app.systemMessage.show = true;
                    app.systemAlert();
                }
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
            $('html').addClass('online');

            if (app.getActivePage() == 'new_places') {
                app.getNewPlaces();
            }

            if (app.getActivePage() == 'add_places') {
                app.openCameraDialog();
            }
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
    goToPage: function (pageId) {
        if ($('#' + pageId).hasClass('active')) {
            return false;
        } else {
            $('.page').removeClass('active');
        }
        /* hide menu */
        fadeOut('.menu', function () {
            $(".menu").removeClass('active');
        });


        /* reset to default state */
        $('#add_places input, #add_places textarea ,#add_places .add-image').val('');
        $("#add_places .add-src").css('background-image', 'none');
        $("#add_places .add-src-cont").addClass('chooseLoader');
        $("#add_places .add-src-cont").removeClass('chooseImageDone');
        $("#add-map").html("");
        $(".radio-wrap .add_img_icon").removeClass("add_img_icon_park");
        $(".radio-wrap .add_img_icon").removeClass("active_icon");
        $(".radio-wrap .add_img_icon:first-child").addClass("add_img_icon_park").addClass("active_icon");
        $("input.error, textarea.error").removeClass('error');

        if (pageId == 'main') {
            $(".arr-wrapper").removeClass('arr_back');
        } else {
            $(".arr-wrapper").addClass('arr_back');
            if (pageId == 'new_places') {
                $('header').removeClass('new_not');
            }
        }
        /* correct menu */
        $('.menu li').removeClass("active_menu");
        $('.menu li[data-page="' + pageId + '"]').addClass("active_menu");

        /* hide other pages */
        $('.page').addClass('hidden');
        /* show correct page */
        app.scrollFix = -1;
        $('#' + pageId).removeClass('hidden').addClass('active');
        $('html').attr('data-active', pageId);
        app.setLocationHash(pageId);
        if ($('html').hasClass('oldAndroid')) {
            window.scrollTo(0, 0);
        } else {
            $('#' + pageId + ' .wrapper').animate({
                scrollTop: 0
            }, 0);
        }

        if (pageId == 'main' || pageId == 'add_places') {
            app.gpsStart();
        } else {
            app.gpsStop();
        }
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
                if ($('html').hasClass('oldAndroid')) {
                    $('html').addClass('fullHeight');
                }
                addLoader('#new_places');
            },
            success: function (res) {
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
            alert('title:' + title + " text:" + text);
        } else {
            navigator.notification.alert(text, callback, title, button);
        }
    },
    noConnection: function (txt) {
        if (typeof txt == 'undefined') {
            txt = 'There is no internet connection';
        }
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

            var params = {};
            params.device_id = device.uuid;
            params.lat = $(".hidden-lat").val();
            params.long = $(".hidden-long").val();
            params.address = $(".add-address").val();
            params.name = $(".add-name").val();
            params.desc = $(".add-descript").val();
            params.country = $('.add-country').val();
            params.type = $('.active_icon').attr("data-type");
            params.action = "add_place";
            options.params = params;

            var image = $(".add-image").val();
            var ft = new FileTransfer();

            addLoader('#add_places');

            ft.upload(image, encodeURI(app.apiURL),
                    function (data) {
                        removeLoader('#add_places');
                        var response;
                        try {
                            response = JSON.parse(data.response)
                        } catch (e) {
                            // invalid json input, set to null
                            response = null
                        }
                        if (response && response.status == 'success') {
                            if (app.getActivePage() == 'add_places') {
                                app.goToPage('main');
                            }
                        } else {
                            if (app.getActivePage() == 'add_places') {
                                app.notification('Oops', 'Something went wrong', 'Close', null);
                            }
                        }
                    },
                    function () {
                        removeLoader('#add_places');
                        if (app.getActivePage() == 'add_places') {
                            app.notification('Oops', 'Something went wrong', 'Close', null);
                        }
                    }, options);
        }
    },
    showPlacesForVote: function (places) {
        $("#new_places .wrapper .content").empty();

        var wrapper_width = parseInt($("#new_places .content").outerWidth(true));
        var wrapper_height = parseInt(wrapper_width / 2);

        var map_height = (wrapper_height > 320) ? 320 : wrapper_height;

        var map_size = {
            width: map_height * 2,
            height: map_height
        }
        if (places.length) {
            for (var i = 0; i < places.length; i++) {
                var output = "<div class='vot_wrap' id='vot_" + places[i].server_id + "' data-id='" + places[i].server_id + "' >";
                output += "<div class='vot_img_icon_wrap'>";
                if (places[i].image) {
                    output += "<a style='background-image:url(data:image/jpg;base64," + places[i].image + ")' class='swipebox_places " + places[i].type + "' rel='" + i + "' href='" + app.uploadsURL + places[i].server_id + ".jpg' onclick='return false;'></a>";
                } else {
                    output += "<a style='background-image:url(img/foot_icon_" + places[i].type + ".png)'  class='swipebox_places noimage' ontouch='return false;'></a>";
                }
                output += "<p>Name</p><p class='cont'>" + places[i].name + "</p><p>Address</p><p class='cont'>" + places[i].address + "</p>";
                output += "</div>";
                if (places[i].description) {
                    output += "<p>Description</p><p class='cont'>" + places[i].description + "</p>";
                }
                output += "<div style='height:" + wrapper_height + "px' class='place_map' id='place_map_" + places[i].server_id + "'  data-src='https://maps.googleapis.com/maps/api/staticmap?center=" + places[i].latitude + "," + places[i].longitude + "&markers=icon:http://velopark.am/images/marker_" + places[i].type + "_small.png|" + places[i].latitude + "," + places[i].longitude + "&zoom=17&size=" + map_size.width + "x" + map_size.height + "&maptype=roadmap&sensor=false&scale=2&key=" + this.gMapApiKey + "'></div>";
                output += "<div class='new_place_icon_wrap'><a href='javascript:void(0);' class='new_place_icon accept' data-value='1' ><img  src='img/add_place.png'  alt='' /></a><a href='javascript:void(0);' class='new_place_icon decline' data-value='0' ><img  src='img/new_place.png' alt='' /></a></div>";
                output += "<span class='hr'></span></div>";
                $("#new_places .content").append(output);

                app.activateSwipebox('#vot_' + places[i].server_id + ' .swipebox_places:not(".noimage")');
            }
            app.showReviewMap();
            if ($('html').hasClass('oldAndroid')) {
                $('html').removeClass('fullHeight');
            }
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
                    var curHeight = $blockEl.outerHeight(true);
                    $blockEl.addClass('swipe');
                    $blockEl.nextAll().addClass('up_trans').css('transform', 'translateY(-' + curHeight + 'px)').css('-webkit-transform', 'translateY(-' + curHeight + 'px)');

                    setTimeout(function () {
                        $blockEl.nextAll().removeClass('up_trans').removeAttr('style');
                        $blockEl.remove();
                        app.showReviewMap();
                        if ($("#new_places .wrapper .content .vot_wrap").length == 0) {
                            app.getNewPlaces();
                        }
                    }, 400);
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
    markDelete: function () {
        $.ajax({
            url: app.apiURL,
            method: "POST",
            data: {
                action: "add_delete",
                device_id: device.uuid,
                place_id: app.activeMarker.server_id
            },
            dataType: 'json',
            success: function (res) {
                if (res.status == 'success') {
                    app.db.transaction(function (tx) {
                        tx.executeSql("UPDATE places SET delete_counter = 1 WHERE server_id=?", [app.activeMarker.server_id], function (tx, results) {
                            if (results.rowsAffected) {
                                $('.mark-delete').removeClass('active');
                            }
                        }, null);
                    });
                } else {
                    // error while trying to get count, do nothing
                }
            },
            error: function (err) {
                app.notification('Oops', 'Something went wrong', 'Close', null);
                // error while trying to get new places count, do nothing
            }
        });

    },
    systemAlert: function () {
        if (app.systemMessage.show && $.trim(app.systemMessage.message) != '' && typeof app.systemMessage.timer == 'undefined') {
            app.systemMessage.timer = setTimeout(function () {
                if ($.trim(app.systemMessage.message) != '') {
                    app.notification(app.systemMessage.title, app.systemMessage.message, 'Close', null);
                    app.systemMessage.message = '';
                    app.systemMessage.show = false;
                }
            }, 3000);
        }
    },
    onPause: function () {
        app.gpsStop();
    },
    onResume: function () {
        setTimeout(function () {
            app.gpsStart();
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
                    var localCount = isNaN(parseInt(localStorage.getItem("count"))) ? 0 : parseInt(localStorage.getItem("count"));
                    var remoteCount = parseInt(data);
                    if (remoteCount > localCount) {
                        $('header').addClass('new_not');
                    }
                    localStorage.setItem("count", remoteCount);
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
                action: "get_version",
                device_id: device.uuid,
                platform: app.platform,
                model: device.model,
                version: device.version
            },
            dataType: 'json',
            success: function (res) {
                if (res.status == 'success') {
                    /* no updates on server */
                    if (app.getLocalVersion() != res.data) {
                        /* get updates from server and insert to local db */
                        app.updateDB(res.data);
                    }
                    if (typeof res.msg.message != 'undefined') {
                        app.systemMessage.title = $.trim(res.msg.title) == '' ? 'Hey' : res.msg.title;
                        app.systemMessage.message = res.msg.message;
                        app.systemAlert();
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
                        tx.executeSql('CREATE TABLE IF NOT EXISTS places(server_id integer PRIMARY KEY unique,latitude REAL, longitude REAL, name text, address varchar, description text, image text, type varchar, status varchar, delete_counter integer DEFAULT 0)', []);
                        for (var i = 0; i < response.length; i++) {
                            if (response[i].status === "1") {
                                tx.executeSql("UPDATE places SET latitude=?, longitude=?, name=?, address=?, description=?, image=?, type=?, status=?, delete_counter = 0 WHERE server_id=?", [response[i].latitude, response[i].longitude, response[i].name, response[i].address, response[i].description, response[i].image, response[i].type, response[i].status, response[i].id], null, null);
                                tx.executeSql("INSERT OR IGNORE INTO places(server_id, latitude, longitude, name, address, description, image, type, status) values(?, ?, ?, ?, ?, ?, ?, ?, ?)", [response[i].id, response[i].latitude, response[i].longitude, response[i].name, response[i].address, response[i].description, response[i].image, response[i].type, response[i].status], null, null);
                            } else {
                                tx.executeSql("DELETE FROM places WHERE server_id=?", [response[i].id], null, null);
                            }
                        }
                        if (app.getLocalVersion() == 0) {
                            app.firstDraw = true;
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
    gpsStart: function () {
        if ((app.getActivePage() == 'main' || app.getActivePage() == 'add_places') && app.positionWatchId == null) {
            app.positionWatchId = navigator.geolocation.watchPosition(app.onPositionSuccess, app.onPositionError, app.geolocationOptions);
        }
    },
    gpsStop: function () {
        if (app.positionWatchId != null) {
            navigator.geolocation.clearWatch(app.positionWatchId);
            app.positionStatus = false;
            app.positionWatchId = null;
        }
    },
    initMap: function () {
        var mainMarker = null;
        app.positionStatus = false;
        app.positionWatchId = null;

        app.currentLocation = {
            latitude: null,
            longitude: null
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
                $('.gps1').addClass('displayBLock');
                setTimeout(function () {
                    $('.gps1').addClass('visible');
                }, 0);

            }
            mainMarker.setPosition(myLatlng);
            mainMarker.setAnimation(null);
        }

        app.onPositionError = function (error) {
            app.gpsStop();
            setTimeout(function () {
                app.gpsStart();
            }, 2000);
        }

        this.mapOptions['center'] = new google.maps.LatLng(app.defaultLocation.latitude, app.defaultLocation.longitude);

        app.map = new google.maps.Map(document.getElementById('map-canvas'), this.mapOptions);

        /* hide splashscreen when map loaded */
        google.maps.event.addListenerOnce(app.map, 'tilesloaded', function () {
            if (navigator.splashscreen) {
                navigator.splashscreen.hide();
                app.systemMessage.show = true;
                app.systemAlert();
            }
            /* select places if exist */
            if (app.getLocalVersion() != 0 && typeof app.firstDraw == 'undefined') {
                app.selectPlaces(app.defaultType);
            }
            app.setLocationHash('gmapfix');
            app.setLocationHash(app.getActivePage());

            $('img[src ^= "https://maps.gstatic.com/mapfiles/api-3/images/google"]').parents('a[href ^= "https://maps.google.com/maps"]').parent().addClass('google-fix');
            $("span:contains('Map data ©')").parents('.gmnoprint').addClass('google-fix');
            $("a:contains('Terms of Use')").parents('.gmnoprint').addClass('google-fix');

        });

        /* atach events to map */
        google.maps.event.addListener(app.map, "click", function () {
            app.closeInfoWindow();
        });
        /* gps button functionality */
        $(".gps1").off("click.gps");
        $(".gps1").on("click.gps", function (e) {
            if (app.currentLocation.latitude != null) {
                app.map.panTo(new google.maps.LatLng(app.currentLocation.latitude, app.currentLocation.longitude));
            }
        });
        /* attach position watcher */
        app.gpsStart();
    },
    start: function (onlineMap) {
        if (typeof onlineMap != 'undefined') {
            $('html').removeClass('onlineMap');
            $('html').addClass('offlineMap');
        } else {
            $('html').removeClass('offlineMap');
            $('html').addClass('onlineMap');
        }
        /*nav functionality*/
        if (this.firstLoad == true) {
            this.firstLoad = false;

            if ($('html').hasClass('ios')) {
                $(document).on('touchstart', function (e) {
                    if ($(e.target).prop("tagName").toLowerCase() != 'input' && $(e.target).prop("tagName").toLowerCase() != 'textarea' && $('input,textarea').is(':focus')) {
                        $('input,textarea').trigger('blur');
                        return false;
                    }
                });
                $(document).on('focus', 'input, textarea', function () {
                    $('header').hide();
                    $('html').addClass('ios-keyboard-fix');
                });
                $(document).on('blur', 'input, textarea', function (e) {
                    $('html').removeClass('ios-keyboard-fix');
                    $('header').show();
                });
            }


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
            $(document).on("click touchend", function (e) {
                if (!$(e.target).hasClass('menu') && $(e.target).parents('.menu').length == 0) {
                    if ($('.menu').hasClass('active')) {
                        fadeOut('.menu', function () {
                            $(".menu").removeClass('active');
                        });
                    }
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

            $('.add-src-cont').on('click', function () {
                app.openCameraDialog(true);
                return false;
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

            /* mark delete */
            $('.mark-delete').on('click', function () {
                if (app.activeMarker && app.activeMarker.server_id) {
                    navigator.notification.confirm("Want to ask community to delete this spot?",
                            function confirmDelete(buttonIndex) {
                                if (buttonIndex == 2) {
                                    app.markDelete();
                                }
                            }, "Really", ["No", "Yes"]);
                }
            });

            var scrollTimer;
            if ($('html').hasClass('oldAndroid')) {
                app.pageScrollTarget = window;
            } else {
                app.pageScrollTarget = '#new_places .wrapper';
            }
            $(app.pageScrollTarget).scroll(function () {

                if (app.scrollFix == $(app.pageScrollTarget).scrollTop()) {
                    return false;
                }
                app.scrollFix = $(app.pageScrollTarget).scrollTop();
                clearTimeout(scrollTimer);
                if (app.getActivePage() != 'new_places') {
                    return true;
                }
                scrollTimer = setTimeout(function () {
                    app.showReviewMap();
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
    showReviewMap: function () {
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
                        }, {quality: 75, sourceType: Camera.PictureSourceType.CAMERA, destinationType: Camera.DestinationType.FILE_URI, encodingType: Camera.EncodingType.JPEG, targetWidth: 800, targetHeight: 800, correctOrientation: true});
                    } else if (buttonIndex == 2) {
                        navigator.camera.getPicture(function (imageURI) {
                            setTimeout(function () {
                                app.cameraSuccess(imageURI, true);
                            }, 0);
                        }, function () {
                            app.cameraError(samePage);
                        }, {quality: 75, sourceType: Camera.PictureSourceType.PHOTOLIBRARY, destinationType: Camera.DestinationType.FILE_URI, encodingType: Camera.EncodingType.JPEG, targetWidth: 800, targetHeight: 800, correctOrientation: true});
                    } else {
                        if (samePage == false) {
                            app.goToPage('main');
                        }
                    }
                }, "Choose", ["Camera", "Gallery", "Close"]);
        return false;
    },
    googleMapEmbed: function () {
        $("#map-canvas").html("");
        var script_tag = document.createElement('script');
        script_tag.setAttribute("type", "text/javascript");
        script_tag.setAttribute("src", "https://maps.googleapis.com/maps/api/js?v=3.22&key=" + this.gMapApiKey + "&language=en&callback=app.start");
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
            app.data.status = 'error';
        });
    },
    clearPlaces: function (type) {
        app.data[type] = null;
        app.closeInfoWindow();
    },
    drawGroupMarkers: function (places, type) {

        /* if there is no matched places do nothing */
        if (places.length == 0) {
            return;
        }

        $('img[data-type="' + type + '"]').addClass('active');
        if (!$('header .green-menu .arr').hasClass('visible')) {
            $('header .green-menu .arr').addClass('displayBLock');
            setTimeout(function () {
                $('header .green-menu .arr').addClass('visible');
            }, 0);

        }


        var image = {
            url: "img/marker_" + type + ".png",
            scaledSize: new google.maps.Size(app.markerOptions.places.w, app.markerOptions.places.h)
        };
        for (var k = 0; k < places.length; k++) {
            var place = places.item(k);
            var myLatlng = new google.maps.LatLng(place.latitude, place.longitude);
            var marker = addMarker(app.map, image, myLatlng, place.server_id, place.type);

            app.data[place.type].markers[k] = marker;
            app.attachInfoWindow(marker);
        }
    },
    attachInfoWindow: function (marker) {
        marker.addListener('click', function () {
            if (app.activeMarker && app.activeMarker.server_id == this.server_id) {
                app.closeInfoWindow();
                return;
            }

            if (app.activeMarker) {
                app.activeMarker.setAnimation(null);
            }
            app.activeMarker = this;

            app.getPlaceFromDB(this.server_id, function (data) {
                if (data.delete_counter == 0) {
                    $(".mark-delete").addClass('active');
                } else {
                    $(".mark-delete").removeClass('active');
                }
                if (data.image) {
                    $(".foot-link").css('background-image', "url(data:image/jpg;base64," + data.image + ")");
                    $(".foot-link").css('background-size', 'cover');

                    $(".foot-link").attr("href", app.uploadsURL + data.server_id + ".jpg");
                    $(".foot-link").removeAttr("ontouchstart");
                } else {
                    $(".foot-link").css('background-image', "url(img/foot_icon_" + data.type + ".png)");
                    $(".foot-link").css('background-size', 'cover');
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
                if ($('.controls').hasClass('transition')) {
                    app.activeMarker.setAnimation(google.maps.Animation.BOUNCE);
                } else {
                    $('.controls').addClass("transition");
                    setTimeout(function () {
                        app.activeMarker.setAnimation(google.maps.Animation.BOUNCE);
                    }, 250);
                }
            });
        });
    },
    closeInfoWindow: function () {
        if (app.activeMarker) {
            app.activeMarker.setAnimation(null)
            app.activeMarker = null;
        }
        setTimeout(function () {
            $(".controls").removeClass("transition");
        }, 50);

    },
    cameraSuccess: function (imageURI, fromGallery) {

        $(".add-image").val(imageURI);
        $(".add-address").val('');
        $(".add-country").val('');

        if (fromGallery) {
            if ($('html').hasClass('oldAndroid') || typeof window.FileReader == 'undefined') {
                setImage(imageURI);
                getCurrrentLocation();
            } else {
                window.resolveLocalFileSystemURI(imageURI,
                        function (entry) {
                            entry.file(function (file) {
                                var GPSLatitude, GPSLongitude, Orientation;
                                EXIF.getData(file, function () {
                                    GPSLatitude = EXIF.getTag(this, 'GPSLatitude');
                                    GPSLongitude = EXIF.getTag(this, 'GPSLongitude');
                                    Orientation = EXIF.getTag(this, 'Orientation');
                                    /* rotate default state */
                                    $(".add-src").removeClass(function (index, css) {
                                        return (css.match(/(^|\s)correct_\S+/g) || []).join(' ');
                                    });
                                    switch (Orientation) {
                                        case 2:
                                            // horizontal flip
                                            $(".add-src").addClass('correct_h_flip');
                                            break;
                                        case 3:
                                            // 180° rotate left
                                            $(".add-src").addClass('correct_180_rot');
                                            break;
                                        case 4:
                                            // vertical flip
                                            $(".add-src").addClass('correct_v_flip');
                                            break;
                                        case 5:
                                            // vertical flip + 90 rotate right
                                            $(".add-src").addClass('correct_v_flip_90_rot');
                                            break;
                                        case 6:
                                            // 90° rotate right
                                            $(".add-src").addClass('correct_90_rot');
                                            break;
                                        case 7:
                                            // horizontal flip + 90 rotate right
                                            $(".add-src").addClass('correct_h_flip_90_rot');
                                            break;
                                        case 8:
                                            // 90° rotate left
                                            $(".add-src").addClass('correct_90_rot_left');
                                            break;
                                    }
                                    setImage(imageURI, true);

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
                                setImage(imageURI);
                                getCurrrentLocation();
                            });
                        },
                        function () {
                            setImage(imageURI);
                            getCurrrentLocation();
                        }
                );
            }
        } else {
            setImage(imageURI);
            getCurrrentLocation(true);
        }

        function setImage(imageURI, orientation) {
            if (typeof orientation == 'undefined') {
                /* rotate default state */
                $(".add-src").removeClass(function (index, css) {
                    return (css.match(/(^|\s)correct_\S+/g) || []).join(' ');
                });
            }
            /* image selected */
            $(".add-src").css("background-image", "url(" + imageURI + ")");
            $(".add-src-cont").removeClass('chooseLoader').addClass('chooseImageDone');
            /* image selected */
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

    var options = {
        center: center,
        zoom: 18,
        scrollwheel: false,
        zoomControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false
    };

    var map_width = parseInt($("#add_places .wrapper").outerWidth(true));
    var map_height = parseInt(map_width * 2 / 3);
    $('#add-map').css('height', map_height);

    var new_map = new google.maps.Map(document.getElementById('add-map'), options);

    google.maps.event.addListenerOnce(new_map, 'tilesloaded', function () {

        $('img[src ^= "https://maps.gstatic.com/mapfiles/api-3/images/google"]').parents('a[href ^= "https://maps.google.com/maps"]').parent().addClass('google-fix');
        $("span:contains('Map data ©')").parents('.gmnoprint').addClass('google-fix');
        $("a:contains('Terms of Use')").parents('.gmnoprint').addClass('google-fix');

    });

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

    geocoder.geocode({'location': center}, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            if (setAddress) {
                $(".add-address").removeClass('error');
                $(".add-address").val(results[0].formatted_address);
            }
            var country = '';
            for (var i = 0; i < results[0].address_components.length; i++) {
                var component = results[0].address_components[i];
                if (component.types[0] == 'country') {
                    country = component.long_name;
                    break;
                }
            }
            $(".add-country").val(country);
        } else {
            $(".add-address").val('');
            $(".add-country").val('');
        }
    });
    var greenTimer;
    new_marker.addListener('dragend', function (event) {
        setNewAddress(event.latLng);
    });

    google.maps.event.addListener(new_map, 'click', function (event) {
        new_marker.setPosition(event.latLng);
        setNewAddress(event.latLng);
        $('input,textarea').trigger('blur');
    });

    function setNewAddress(latLng) {
        var latitude = parseFloat(latLng.lat()).toFixed(7);
        var longitude = parseFloat(latLng.lng()).toFixed(7);

        $(".hidden-lat").val(latitude);
        $(".hidden-long").val(longitude);

        geocoder.geocode({'location': latLng}, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                clearTimeout(greenTimer);
                $(".add-address").removeClass('error');
                $(".add-address").addClass('green');
                greenTimer = setTimeout(function () {
                    $(".add-address").removeClass('green');
                }, 800);
                $(".add-address").val(results[0].formatted_address);
                var country = '';
                for (var i = 0; i < results[0].address_components.length; i++) {
                    var component = results[0].address_components[i];
                    if (component.types[0] == 'country') {
                        country = component.long_name;
                        break;
                    }
                }
                $(".add-country").val(country);
            } else {
                $(".add-address").val('');
                $(".add-country").val('');
            }
        });
    }
}


function addLoader(selector) {
    $(selector).addClass('loading');
    setTimeout(function () {
        $(selector).addClass('visibility');
    }, 0);
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

    setTimeout(function () {
        $(selector).addClass('fadeIn');
    }, 0);

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
    setTimeout(function () {
        $(selector).addClass('fadeOut');
    }, 0);
    setTimeout(function () {
        $(selector).addClass('fadeOutComplete');
        if (typeof callback == 'function') {
            callback();
        }
    }, 300);
}