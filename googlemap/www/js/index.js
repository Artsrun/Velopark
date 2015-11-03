/* MAIN APP CLASS */
var app = {
    // Application Constructor
    apiURL: "http://velopark.am/api/",
    uploadsURL: 'http://velopark.am/uploads/',
    onlineStatus: '',
    positionWatchId: null,
    firstLoad: true,
    defaultLocation: {
        lat: 40.186027,
        long: 44.515030
    },
    getLocalVersion: function () {
        return localStorage.getItem("version");
    },
    gMapApiKey: 'AIzaSyD7gPtsOo5EzPh1eD0n8hOLqA4CVgmZHEc',
    db: null,
    mapOptions: {
        zoom: 14,
        scrollwheel: false,
        zoomControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false
    },
    map: null,
    data: {
        parking: [],
        rent: [],
        shop: [],
        parts: []
    },
    defaultType: 'parking',
    initialize: function () {
       app.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
       document.addEventListener("deviceready", this.onDeviceReady, false);
        document.addEventListener("online", this.onLine, false);
        document.addEventListener("offline", this.offLine, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        app.db = openDatabase('places', '', 'the database of places', 4 * 1024 * 1024);

        if (navigator.connection && navigator.connection.type != "none") {
            app.onlineStart = true;
            app.googleMapEmbed();
        } else {
            app.onlineStart = false;
            app.start('offlineMap');
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

            $('body').removeClass('offline');
            $('body').removeClass('offlineMap');
            $('body').addClass('online');

            if (app.getActivePage() == 'new_places') {
                app.getNewPlaces();
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
            $('body').removeClass('online');
            $('body').addClass('offline');
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
        $('.menu').fadeOut(200);

        /* reset to default state */
        $('#add_places input, #add_places textarea').val('');
        $("#add_places .add-src").css("background-image", "none");
        $("#add-map").html("");
        $(".radio-wrap .add_img_icon").removeClass("add_img_icon_park");
        $(".radio-wrap .add_img_icon").removeClass("active_icon");
        $(".radio-wrap .add_img_icon:first-child").addClass("add_img_icon_park").addClass("active_icon");

        if (pageId == 'main') {
            $(".gps1, footer").show();
            $(".arr-wrapper").removeClass('arr_back');
        } else {
            $(".gps1, footer").hide();
            $(".arr-wrapper").addClass('arr_back');
        }

        /* correct menu */
        $('.menu li').removeClass("active_menu");
        $('.menu li[data-page="' + pageId + '"]').addClass("active_menu");

        /* hide other pages */
        $('.page').addClass('hidden');
        /* show correct page */
        $('#' + pageId).removeClass('hidden').addClass('active');
        app.setLocationHash(pageId);
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
                action: "addplaces",
                unique_id: device.uuid
            },
            dataType: 'json',
            beforeSend: function () {
                $("#new_places .wrapper").append("<img src='img/ajax_loader.gif' alt='' class='loader'>");
            },
            success: function (res) {
                $("#new_places .wrapper .loader").remove();
                selectVoting(res);
            },
            error: function (err) {
                $("#new_places .wrapper .loader").remove();
                if (app.getActivePage() === 'new_places') {
                    navigator.notification.alert('Places loading error', function () {
                        app.goToPage('main');
                    },
                            'Loading problem',
                            'Close');
                }
            }
        });
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
        params.action = "upload";
        options.params = params;

        var image = $(".add-image").attr("src");
        var ft = new FileTransfer();

        ft.upload(image, encodeURI(app.apiURL),
                function () {
                    app.goToPage('main');
                },
                function () {
                    if (app.getActivePage() === 'add_places') {
                        navigator.notification.alert('Problem while adding place', null, ':( Sorry', 'OK');
                    }
                }, options);
    },
    onPause: function () {
        app.positionStatus = false;
        navigator.geolocation.clearWatch(app.positionWatchId);
    },
    onResume: function () {
        setTimeout(function () {
            app.positionWatchId = navigator.geolocation.watchPosition(app.onPositionSuccess, app.onPositionError, {enableHighAccuracy: true, timeout: 3000, maximumAge: 100});
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
                action: "new_count",
                device_id: device.uuid
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
            },
            error: function (err) {
                //console.log(err);
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
                action: "version"
            },
            success: function (res) {
                /* no updates on server */
                if (app.getLocalVersion() == res) {
                    app.selectPlaces(app.db);
                } else { /* get updates from server and insert to local db */
                    app.updateDB(res);
                }
            },
            error: function (r) {
                //alert( JSON.stringify(r))
            }
        });
    },
    updateDB: function (res) {
        if (this.onlineStatus === 'offline') {
            this.noConnection();
            return false;
        }
        $.ajax({
            url: app.apiURL,
            method: "POST",
            data: {
                action: "index",
                version: app.getLocalVersion()
            },
            dataType: 'json',
            success: function (response) {
                app.db.transaction(function (tx) {
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
                    app.selectPlaces(app.db);
                });
            },
            error: function (err) {
                //console.log(err);
            }
        });
    },
    initMap: function () {
        var mainMarker = null;
        app.positionStatus = false;
        app.currentLocation = {};
        app.onPositionSuccess = function (position) {
            app.positionStatus = true;

            app.currentLocation.lat = position.coords.latitude;
            app.currentLocation.long = position.coords.longitude;

            var myLatlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            if (mainMarker == null) {
                app.map.setCenter(myLatlng);
                mainMarker = addMarker(app.map, "img/marcer_main.png", myLatlng);
            }
            mainMarker.setPosition(myLatlng);
            mainMarker.setAnimation(null);
        }

        app.onPositionError = function (error) {
            app.positionStatus = false;
            var erLatlng = new google.maps.LatLng(app.defaultLocation.lat, app.defaultLocation.long);
            app.map.setCenter(erLatlng);
        }

        app.map = new google.maps.Map(document.getElementById('map-canvas'), this.mapOptions);

        /* hide splashscreen when map loaded */
        google.maps.event.addListenerOnce(app.map, 'idle', function () {
            if (navigator.splashscreen) {
                navigator.splashscreen.hide();
            }
        });
        /* atach events to map */
        google.maps.event.addListener(app.map, "click", function () {
            $("footer").removeClass("transitiion");
            $("footer").addClass("tr1");
            $(".gps1").removeClass("gpstransition").addClass("gpstransition1");
        });
        /* gps button functionality */
        $(".gps1").off("click.gps");
        $(".gps1").on("click.gps", function (e) {
            if (app.positionStatus == false) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    app.positionStatus = true;
                    app.currentLocation.lat = position.coords.latitude;
                    app.currentLocation.long = position.coords.longitude;

                    navigator.geolocation.clearWatch(app.positionWatchId);
                    app.positionWatchId = navigator.geolocation.watchPosition(app.onPositionSuccess, app.onPositionError, {enableHighAccuracy: true, timeout: 3000, maximumAge: 100});
                },
                        null, // do nothing on error;
                        {enableHighAccuracy: true, timeout: 3000, maximumAge: 100});
            } else {
                app.map.panTo(new google.maps.LatLng(app.currentLocation.lat, app.currentLocation.long));
            }
        });
        /* attach position watcher */
        app.positionWatchId = navigator.geolocation.watchPosition(app.onPositionSuccess, app.onPositionError, {enableHighAccuracy: true, timeout: 3000, maximumAge: 100});
    },
    start: function (onlineMap) {
        if (typeof onlineMap != 'undefined') {
            $('body').addClass('offlineMap');
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
                $(".menu").addClass('active').fadeIn(200);
                $("nav").removeClass("nav_up");
                $("nav").addClass("nav_down");

                $(".arr-wrapper").removeClass("arr_up");
                $(".arr-wrapper").addClass("arr_down");
                return false;
            });
            $(document).on("click", function () {
                if ($('.menu').hasClass('active')) {
                    $(".menu").fadeOut(200, function () {
                        $(this).removeClass('active');
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
                    if (pageId == 'add_places' && navigator.notification && app.onlineStatus != 'offline') {
                        app.openCameraDialog();
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
                        drawGroupMarkers(app.data[type], type);
                        $(this).addClass('active');
                    } else {
                        $(this).removeClass('active');
                        for (var j = 0; j < app.data[type].length; j++) {
                            removeMarker(app.data[type][j].marker);
                        }
                    }
                }
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
            beforeOpen: function () {
                app.setLocationHash('swipebox');
            }
        });
    },
    setLocationHash: function (hash) {
        location.hash = hash;
    },
    openCameraDialog: function (samePage) {
        navigator.notification.confirm("Take a picture or select fromgallery",
                function confirmCamera(buttonIndex) {
                    if (buttonIndex == 1) {
                        navigator.camera.getPicture(cameraSuccess, cameraError, {quality: 75, sourceType: Camera.PictureSourceType.CAMERA, destinationType: Camera.DestinationType.FILE_URI, encodingType: Camera.EncodingType.JPEG, targetWidth: 800, targetHeight: 800});
                    } else if (buttonIndex == 2) {
                        navigator.camera.getPicture(cameraSuccess, cameraError, {quality: 75, sourceType: Camera.PictureSourceType.PHOTOLIBRARY, destinationType: Camera.DestinationType.FILE_URI, encodingType: Camera.EncodingType.JPEG, targetWidth: 800, targetHeight: 800});
                    } else {
                        if (typeof samePage == 'undefined' || samePage == false) {
                            app.goToPage('main');
                        }
                    }
                }, "", ["camera", "gallery", "close"]);
    },
    googleMapEmbed: function () {
        $("#map-canvas").html("");
        var script_tag = document.createElement('script');
        script_tag.setAttribute("type", "text/javascript");
        script_tag.setAttribute("src", "https://maps.googleapis.com/maps/api/js?sensor=false&key=" + this.gMapApiKey + "&callback=app.start");
        (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
    },
    selectPlaces: function (database) {
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
                        app.data.parking.push(obj);
                    else if (results.rows.item(i).type == "rent")
                        app.data.rent.push(obj);
                    else if (results.rows.item(i).type == "shop")
                        app.data.shop.push(obj);
                    else if (results.rows.item(i).type == "parts")
                        app.data.parts.push(obj);
                }
                app.data.status = 'ready';

                /* show parkings by default*/
                if (app.defaultType != 'none') {
                    drawGroupMarkers(app.data[app.defaultType], app.defaultType, null);
                    $('img[data-type="' + app.defaultType + '"]').addClass('active');
                }

            });
        });
    }
};
app.initialize();