<?php
/*define('VELOPARK', TRUE);
session_start();*/
require_once '../config.php';
if(!isset($_SESSION['auth']['admin'])){
    header("Location:".PATH."admin/auth/enter.php");
    exit;
}else{
    header("Location:".PATH ."admin/");
    exit;
}