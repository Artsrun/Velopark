/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
 

var app = {
    // Application Constructor
	apiURL: "http://velopark.am/api/",
	uploadsURL:'http://velopark.am/uploads/', 
	onlineStatus:'',
	positionWatchId:null,
	defaultLocation:{
		lat: 40.186027,
		long: 44.515030
	},
	getLocalVersion:function(){
		return localStorage.getItem("version");
	},
	db:null,
	mapOptions : {
			zoom: 14,
			scrollwheel: false,
			zoomControl: false,
			mapTypeControl: false,
			scaleControl: false,
			streetViewControl: false,
	},
	map:null,
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {	
		document.addEventListener("deviceready", this.onDeviceReady, false);
		/* if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {
		
		} else {
			this.onDeviceReady(); //this is the browser
		} */
	    document.addEventListener("online",  this.onLine, false);        
		document.addEventListener("offline", this.offLine, false); 
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
		app.db = openDatabase('places', '', 'the database of places', 4 * 1024 * 1024);
		
		var script_tag = document.createElement('script');
		script_tag.setAttribute("type", "text/javascript");
		script_tag.setAttribute("src", "https://maps.googleapis.com/maps/api/js?sensor=false&key=AIzaSyD7gPtsOo5EzPh1eD0n8hOLqA4CVgmZHEc&callback=app.start");
		(document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
		
		
		document.addEventListener("pause", app.onPause, false);
		document.addEventListener("resume", app.onResume, false);
		
    },
	onLine: function() {      
		 if(app.onlineStatus != '' && app.onlineStatus !='online' ){
				app.onlineStatus = 'online';
				$(".gps1, #arr_down").show();
				$("#map-canvas").html("");
				var script_tag = document.createElement('script');
				script_tag.setAttribute("type", "text/javascript");
				script_tag.setAttribute("src", "https://maps.googleapis.com/maps/api/js?sensor=false&key=AIzaSyD7gPtsOo5EzPh1eD0n8hOLqA4CVgmZHEc&callback=app.start");
                (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
			 app.receivedEvent('online');
		 }		 
    },
	offLine: function() { 
		 app.onlineStatus = 'offline';
		 app.receivedEvent('offline');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
		alert(id);
    },
	goToPage:function(pageId){
		if( $('#'+pageId).hasClass('active') ){
			return false;
		}else{
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
		
		if(pageId == 'main'){
			$(".gps1, footer").show();
			$(".arr-wrapper").removeClass('arr_back');
		}else{
			$(".gps1, footer").hide();
			$(".arr-wrapper").addClass('arr_back');
		}
		
		if( $('#'+pageId).data('scroll') == false){
			$('.container').addClass('overflow_hide');
		}else{
			$('.container').removeClass('overflow_hide');
		}
		/* correct menu */
		$('.menu li').removeClass("active_menu");
		$('.menu li[data-page="'+pageId+'"]').addClass("active_menu");
		
		/* hide other pages */
		$('.page').hide();
		/* show correct page */
		$('#'+pageId).addClass('active').show();
		location.hash = pageId;	
		return true;
	},
	getActivePage:function(){
		return $('.page.active').attr('id');
	},
	getNewPlaces:function(){
		$("#new_places .wrapper .content").empty();
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
			error:function(err){
				$("#new_places .wrapper .loader").remove();
				if( app.getActivePage() == 'new_places'){
					navigator.notification.alert('Places loading error',function(){
						app.goToPage('main');
					},
					'Loading problem',
					'Close');
				}
			}
		});
	},
	addNewPlace:function(options){
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
		function(){
			app.goToPage('main');
		}, 
		function(){
			if(app.getActivePage() == 'add_places' ){
				navigator.notification.alert('Problem while adding place',null,':( Sorry','OK');
			}			
		}, options);
	},
	onPause:function() {
		navigator.geolocation.clearWatch(app.positionWatchId);
	},
	onResume:function() {
		setTimeout(function(){
			app.positionWatchId = navigator.geolocation.watchPosition(showPosition, showError, {enableHighAccuracy: true, timeout: 3000, maximumAge: 100});
		},100);		
	},
	getNewPlacesCount:function(){
		$.ajax({
			url: app.apiURL,
			method: "POST",
			data: {
				action: "new_count",
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
			},
			error:function(err){
				//console.log(err);
			}
		});			
	},
	checkDBVersion:function(){
		$.ajax({
			url: app.apiURL,
			method: "POST",
			data: {
				action: "version"
			},
			success: function (res) {
				/* no updates on server */
				if (app.getLocalVersion() == res) {
					selectPlaces(app.db);
				} else { /* get updates from server and insert to local db */
					app.updateDB(res);
				}
			},
			error:function(r){
				//alert( JSON.stringify(r))
			}
                    });
	},
	updateDB : function(res){
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
					selectPlaces(app.db);
				});
			},
			error: function (err) {
				//console.log(err);
			}
		});
	},
	initMap:function(){
		var mainMarker = null;
		var positionStatus = false;
		function onPositionSuccess(position) {
			var myLatlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			if (mainMarker === null) {
				app.map.setCenter(myLatlng);
				mainMarker = addMarker(app.map, "img/marcer_main.png", myLatlng);
			}
			mainMarker.setPosition(myLatlng);
			mainMarker.setAnimation(null);
			app.currentLocation = {};
			app.currentLocation.lat = position.coords.latitude;
			app.currentLocation.long = position.coords.longitude;
			/* $(".gps1").unbind("click");
			$(".gps1").on("click", function (e) {
				app.map.panTo(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
			}); */
		}
		//window.flag = 1;
		function onPositionError(error) {
			var erLatlng = new google.maps.LatLng(app.defaultLocation.lat, app.defaultLocation.long);
			app.map.setCenter(erLatlng);
			positionStatus = false;
		}
		
		app.map = new google.maps.Map(document.getElementById('map-canvas'), this.mapOptions);

		/* hide splashscreen when map loaded */
		google.maps.event.addListenerOnce(app.map, 'idle', function () {
			if(navigator.splashscreen){
				navigator.splashscreen.hide();
			}
		});
		/* atach events to map */
		google.maps.event.addListener(app.map, "click", function () {
			$("footer").removeClass("transitiion");
			$("footer").addClass("tr1");
			$("footer").css({"marginBottom": 0 - $("footer").height() - 50});
			$(".gps1").removeClass("gpstransition").addClass("gpstransition1");
		});
		
		/* gps button functionality */
		$(".gps1").on("click", function (e) {
				if (positionStatus == false) {
					navigator.geolocation.getCurrentPosition(function(){
						positionStatus = true;
						navigator.geolocation.clearWatch(app.positionWatchId);
						app.positionWatchId = navigator.geolocation.watchPosition(onPositionSuccess, onPositionError, {enableHighAccuracy: true, timeout: 3000, maximumAge: 100});						
					}, 
					null, // do nothing on error;
					{enableHighAccuracy: true, timeout: 3000, maximumAge: 100});
				}
				else {
					app.map.panTo(new google.maps.LatLng(app.currentLocation.lat, app.currentLocation.lat));
				}
		});
			
		/* attach position watcher */
		app.positionWatchId = navigator.geolocation.watchPosition(onPositionSuccess, onPositionError, {enableHighAccuracy: true, timeout: 3000, maximumAge: 100});
	},
	start :function () {
		/*nav functionality*/
		$("nav").css("marginTop", 0 - 1.4 * $("nav").height());
		$("nav").css("display", "block");
		$("footer").css({"marginBottom": 0 - $("footer").height() - 50});
		
		$(".arr-wrapper").on('click', function () {
			if($(this).hasClass('arr_back')){
				app.goToPage('main');
			}else if ($(this).hasClass("arr_down")) {
				$("nav").removeClass("nav_down");
				$("nav").addClass("nav_up");				
				
				$(this).removeClass("arr_down");
				$(this).addClass("arr_up");
			}else{
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
			if( $('.menu').hasClass('active')){
				$(".menu").fadeOut(200,function(){
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
		
		$(window).on('hashchange', function() {
			if(location.hash != '#'+app.getActivePage() ){
				app.goToPage('main');
			}
		});
		
		/* activate swiepbox on add new place image*/
		$('.swipebox_add').swipebox();
		
		$(".menu li").on("click", function () {
			var pageId = $(this).data('page');
			if( app.goToPage(pageId) ){			
				if ( pageId == 'add_places') {
					navigator.notification.confirm("Take a picture or select from gallery", confirmCamera, "", ["camera", "gallery", "close"]);					
				} else if (pageId == 'new_places') {
					app.getNewPlaces();	
				}
			}
		});		
		
		
		$("#add_places .add_place_icon").on("click", function () {
			app.addNewPlace();			
		});
		
		app.initMap();	
	
		/* will check db version if anything new will call updateDB function; */
		app.checkDBVersion();

		/* get new places count */
		app.getNewPlacesCount();	

	}
};
app.initialize();