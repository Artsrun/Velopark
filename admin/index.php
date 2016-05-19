<?php

define('VELOPARK', TRUE);

session_start();
if (!empty($_GET['do'])) {
    if ($_GET['do'] == "logout") {
        unset($_SESSION['auth']);
    }
}

require_once '../config.php';
if (!isset($_SESSION['auth']['admin'])) {
    include 'auth/index.php';
}
$link = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
$link->set_charset('utf8');
require_once 'functions.php';

$view = empty($_GET['view']) ? 'places' : $_GET['view'];

switch ($view) {
    case('places'):

        $perpage = 10;
        if (isset($_GET['page'])) {
            $page = (int) $_GET['page'];
            if ($page < 1)
                $page = 1;
        }else {
            $page = 1;
        }
        $count_rows = count_places($link);
        $pages_count = ceil($count_rows / $perpage);
        if (!$pages_count)
            $pages_count = 1;
        if ($page > $pages_count)
            $page = $pages_count;
        $start_pos = ($page - 1) * $perpage;

        $places = places($link, $start_pos, $perpage);
        break;

    case('edit_place'):
        $place_id = abs((int) $_GET['place_id']);
        $get_place = get_place($place_id, $link);
		
		$perm_delete = isset($_GET['delete_perm'])?$_GET['delete_perm']:'';		
		if($perm_delete == 'yes'){
			if(delete_perm($place_id, $link)){
				redirect('?view=places&page='.(isset($_GET['page'])?$_GET['page']:1).(isset($_GET['search'])?'&search='.$_GET['search']:''));
			}else{
				redirect('?view=edit_place&place_id='.$place_id.'&page='.(isset($_GET['page'])?$_GET['page']:1).(isset($_GET['search'])?'&search='.$_GET['search']:''));
			}
		}
		
        if ($_POST) {
            if (edit_place($place_id, $link))
                redirect('?view=places&page='.(isset($_GET['page'])?$_GET['page']:1).(isset($_GET['search'])?'&search='.$_GET['search']:''));
            else
                redirect();
        }else {
            array_map('unlink', glob("temp/tmp.*"));
			

        }

        break;

    case('add_place'):
        if ($_POST) {
            if (add_place($link))
                redirect('?view=places');
            else
                redirect();
        }else {
            array_map('unlink', glob("temp/tmp.*"));
            
        }

        break;

    case("delete_place"):
        $place_id = abs((int) $_GET['place_id']);
        delete_place($place_id, $link);
        redirect('?view=places&page='.(isset($_GET['page'])?$_GET['page']:1).(isset($_GET['search'])?'&search='.$_GET['search']:''));

        break;
	case("undelete_place"):
        $place_id = abs((int) $_GET['place_id']);
        undelete_place($place_id, $link);
        redirect('?view=places&page='.(isset($_GET['page'])?$_GET['page']:1).(isset($_GET['search'])?'&search='.$_GET['search']:''));

        break;
	case("confirm_place"):
	    $place_id = abs((int) $_GET['place_id']);
        confirm_place($place_id, $link);
        redirect('?view=places&page='.(isset($_GET['page'])?$_GET['page']:1).(isset($_GET['search'])?'&search='.$_GET['search']:''));

        break;

    case("vote_place"):
        $place_id = abs((int) $_GET['place_id']);
        $get_place = get_place($place_id, $link);
        if ($_POST) {
            if (vote_place($place_id, $link))
                redirect('?view=places&page='.(isset($_GET['page'])?$_GET['page']:1).(isset($_GET['search'])?'&search='.$_GET['search']:''));
            else
                redirect();
        }
        break;
	case("stats"):
		$stats = get_stats($link);
		break;
	case("msg"):	
		if(isset($_GET['delete'])){			
			delete_msg(abs((int) $_GET['delete']),$link);
			redirect('?view=msg');
		}
		if ($_POST) {
			if(add_msg($link)){
				redirect('?view=msg');
			}
		}
		$msg = get_msg($link);
		
		break;
    default:
        $view = 'places';
        $perpage = 10;
        if (isset($_GET['page'])) {
            $page = (int) $_GET['page'];
            if ($page < 1)
                $page = 1;
        }else {
            $page = 1;
        }
        $count_rows = count_places($link);
        $pages_count = ceil($count_rows / $perpage);
        if (!$pages_count)
            $pages_count = 1;
        if ($page > $pages_count)
            $page = $pages_count;
        $start_pos = ($page - 1) * $perpage;

        $places = places($link, $start_pos, $perpage);
        break;
}
$link->close();
// HEADER
include 'templates/header.php';

// TOPBAR
include 'templates/topbar.php';

// CONTENT
include 'templates/' . $view . '.php';
?>