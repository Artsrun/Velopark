function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

$(document).ready(function () {

    if ($('#upload-image').length) {
        var change = new AjaxUpload('upload-image', {
            action: 'upload.php',
            name: 'change',
            autoSubmit: true,
            onSubmit: function (file, ext) {
                if (!(ext && /^(jpg|jpeg|png)$/i.test(ext))) {
                    alert('Error: invalid file extension');
                    return false;
                }
            },
            onComplete: function (file, response) {
                if (response == 'error') {
                    return false;
                }
                var rand = getRandomInt(0, 999999);


                $(".file_loader").removeClass(function (index, css) {
                    return (css.match(/(^|\s)correct_\S+/g) || []).join(' ');
                });
                var img = new Image();
                img.src = response + '?' + (new Date()).getTime();
                img.onload = function () {
                    EXIF.getData(img, function () {
                        var orientation = EXIF.getTag(this, 'Orientation');
                        switch (orientation) {
                            case 2:
                                // horizontal flip
                                $(".file_loader").addClass('correct_h_flip');
                                break;
                            case 3:
                                // 180° rotate left
                                $(".file_loader").addClass('correct_180_rot');
                                break;
                            case 4:
                                // vertical flip
                                $(".file_loader").addClass('correct_v_flip');
                                break;
                            case 5:
                                // vertical flip + 90 rotate right
                                $(".file_loader").addClass('correct_v_flip_90_rot');
                                break;
                            case 6:
                                // 90° rotate right
                                $(".file_loader").addClass('correct_90_rot');
                                break;
                            case 7:
                                // horizontal flip + 90 rotate right
                                $(".file_loader").addClass('correct_h_flip_90_rot');
                                break;
                            case 8:
                                // 90° rotate left
                                $(".file_loader").addClass('correct_90_rot_left');
                                break;
                        }
                    });
                }

                $(this._button).closest("tr").find("td:first-child ").html("<a href='../admin/" + response + "?" + rand + "' class='swipebox'><div class='place_thumb' style='background-image: url(../admin/" + response + "?" + rand + ");'></div></a>");
                if ($(this._button).hasClass("add-image")) {


                    $(this._button).text("change image");
                }

            }
        });
    }


    $('.swipebox').swipebox();

});
