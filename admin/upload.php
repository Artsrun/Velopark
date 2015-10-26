<?php

$uploaddir = 'temp/';
if (!empty($_FILES['change'])) {
    if (move_uploaded_file($_FILES['change']['tmp_name'], $uploaddir . "tmp.jpg")) {
        echo "success";
    } else {
        echo "error";
    }
}