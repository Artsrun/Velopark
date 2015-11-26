<?php

$uploaddir = 'temp/';
if (!empty($_FILES['change'])) {
	$ext = pathinfo($_FILES["change"]["name"], PATHINFO_EXTENSION);
    if (move_uploaded_file($_FILES['change']['tmp_name'], $uploaddir . "tmp.".$ext)) {
        echo $uploaddir . "tmp.".$ext;
    } else {
        echo "error";
    }
}