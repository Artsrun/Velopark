function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

$(document).ready(function () {
	
	if($('#upload-image').length){
		var change = new AjaxUpload('upload-image', {
			action: 'upload.php',
			name: 'change',
			autoSubmit: true,
			onSubmit: function (file, ext) {
				if (!(ext && /^(jpg|jpeg)$/i.test(ext))) {
					alert('Error: invalid file extension');
					return false;
				}
			},
			onComplete: function (file, response) {
				var rand = getRandomInt(0, 999999);
				$(this._button).closest("tr").find("td:first-child ").html("<a href='../admin/temp/tmp.jpg?"+rand+"' class='swipebox'><div class='place_thumb' style='background-image: url(../admin/temp/tmp.jpg?"+rand+");'></div></a>");				
				if ($(this._button).hasClass("add-image")) {
					
					
					$(this._button).text("change image");
				} 

			}
		});
	}


    $( '.swipebox' ).swipebox();

});
