<?php defined('VELOPARK') or die('Access denied'); ?>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <link rel="stylesheet" type="text/css" href="templates/style.css" />
        <link rel="stylesheet" type="text/css" href="templates/css/swipebox.min.css" />
        <script type="text/javascript" src="templates/js/jquery-2.1.4.js"></script>
        <script type="text/javascript" src="templates/js/ajaxupload.js"></script>    
        <script type="text/javascript" src="templates/js/jquery.swipebox.min.js"></script>
        <script type="text/javascript" src="templates/js/workscripts.js"></script>
        <script type="text/javascript" src="templates/js/map.js"></script>
        <script type="text/javascript" src="templates/js/exif.js"></script>   
        <title>Velopark</title>
    </head>

    <body>
        <div class="wrapper">
            <div class="head">
                <a class="logo" href="<?= PATH ?>admin/"></a>
                <p><a href="#"><?= $_SESSION['auth']['admin'] ?></a> | <a href="?do=logout"><strong>Logout</strong></a></p>
            </div> 
