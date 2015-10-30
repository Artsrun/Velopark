function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

$(document).ready(function () {
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
            if ($(this._button).hasClass("add-image")) {
                $(this._button).closest("tr").find("td:first-child ").html("<a href='../admin/temp/tmp.jpg?' class='swipebox'><img src='../admin/temp/tmp.jpg?" + rand + "' alt='' height='150' width='150' style='border-radius:3px;'></a>");
                $(this._button).text("change image");
            } else {
                $(this._button).closest("tr").find("td:first-child img").attr("src", "../admin/temp/tmp.jpg?" + rand);
                $(this._button).closest("tr").find("td:first-child a").attr("href", "../admin/temp/tmp.jpg?" + rand);
            }

        }
    });



    $( '.swipebox' ).swipebox();

});
