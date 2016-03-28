<?php

defined('VELOPARK') or die('Access denied');

function clear_admin($var, $link) {
    $var = strip_tags($link->real_escape_string($var));
    return $var;
}

function places($link, $start_pos, $perpage) {
    $query = "SELECT * FROM places WHERE type!='DELETED' ORDER BY id DESC LIMIT $start_pos, $perpage";
    $places = array();
    $result = $link->query($query);
    while ($row = $result->fetch_assoc()) {
        $places[] = $row;
    }
    $result->free();

    return $places;
}

function get_place($place_id, $link) {
    $query = "SELECT * FROM places WHERE id = $place_id";
    $result = $link->query($query);
    $place = array();
    $place = $result->fetch_assoc();
    $result->free();
    return $place;
}

function count_places($link) {
    $query = "SELECT COUNT(id) FROM places";
    $res = $link->query($query);
    $count_places = $res->fetch_row();
    $res->free();
    return $count_places[0];
}

function edit_place($place_id, $link) {
	$status = get_status($place_id, $link);
	if($status == '2'){
		$_SESSION['edit_place']['res'] = "<div class='error'>Error! Place is currently deleted</div>";
        return false;
	}
	
    $name = trim($_POST['name']);
    $address = trim($_POST['address']);
    $description = trim($_POST['description']);
    $latitude = trim($_POST['latitude']);
    $longitude = trim($_POST['longitude']);
    $type = $_POST['type'];
	$country = $_POST['country'];
	$temp_file = empty(glob('temp/tmp.*'))?false:glob('temp/tmp.*')[0];
	$image = false;
    if (empty($name)) {
        $_SESSION['edit_place']['res'] = "<div class='error'>Must be name!</div>";
        array_map('unlink', glob("temp/tmp.*"));
        return false;
    } else if (empty($latitude)) {
        $_SESSION['edit_place']['res'] = "<div class='error'>Must be latitude!</div>";
        array_map('unlink', glob("temp/tmp.*"));
        return false;
    } else if (empty($longitude)) {
        $_SESSION['edit_place']['res'] = "<div class='error'>Must be longitude!</div>";
        array_map('unlink', glob("temp/tmp.*"));
        return false;
    } else if (empty($address)) {
        $_SESSION['edit_place']['res'] = "<div class='error'>Must be address!</div>";
        array_map('unlink', glob("temp/tmp.*"));
        return false;
    } else {
        $name = clear_admin($name, $link);
        $address = clear_admin($address, $link);
        $description = clear_admin($description, $link);
        $latitude = clear_admin($latitude, $link);
        $longitude = clear_admin($longitude, $link);
        $type = clear_admin($type, $link);
		$country = clear_admin($country, $link);
        $query_image = " ";
		
        if ($temp_file!=false) {
            $ext = pathinfo($temp_file, PATHINFO_EXTENSION);
            if($ext == 'jpg' || $ext == 'jpeg'){
				$image = imagecreatefromjpeg($temp_file);
			}elseif($ext == 'png'){			
				$image = imagecreatefrompng($temp_file);
			}
            
			if($ext == 'jpg' || $ext == 'jpeg'){
				$exif = exif_read_data($temp_file);

				if (!empty($exif['Orientation'])) {
					switch ($exif['Orientation']) {
						case 2:
							$image = image_flip($image,'horizontal');
							break;
						case 3:
							$image = imagerotate($image, 180, 0);
							break;
						case 4:
							$image = image_flip($image,'vertical');
							break;
						case 5:
							$image = image_flip($image,'vertical');
							$image = imagerotate($image, -90, 0);
							break;
						case 6:
							$image = imagerotate($image, -90, 0);
							break;
						case 7:
							$image = image_flip($image,'horizontal');
							$image = imagerotate($image, -90, 0);
							break;
						case 8:
							$image = imagerotate($image, 90, 0);
							break;
					}
				}
			}
		   
			$width = imagesx ($image);
			$height = imagesy ($image);  

			if($width > 800 || $height > 800){
				if($width > $height){
					$newWidth = 800;
					$newHeight = ($newWidth / $width) * $height;
				}else{
					$newHeight = 800;	
					$newWidth = ($newHeight / $height) * $width;			
				}
			  
				$resized = imagecreatetruecolor($newWidth,$newHeight);
				imagecopyresampled($resized, $image, 0, 0, 0, 0,$newWidth, $newHeight, $width, $height);	
				$image = $resized;
				$width = imagesx ($image);
				$height = imagesy ($image);  
			}
			
            $size = ($width<$height)?$width:$height;	
			$x = ($width>$height)?($width-$height)/2:0;
			$y = ($width<$height)?($height-$width)/2:0;
			$thumb = imagecreatetruecolor(150, 150);
			imagecopyresampled($thumb, $image, 0, 0, $x, $y, 150, 150, $size, $size);	
			ob_start(); 
				imagejpeg($thumb); 
				$contents = ob_get_contents(); 
			ob_end_clean(); 

			$base64 = base64_encode($contents);
            $query_image = ", image = '$base64' ";
        }

        $query = "UPDATE places SET
                    latitude = '$latitude',
                    longitude = '$longitude',
                    description = '$description',
                    name = '$name',
                    address = '$address',
                    type = '$type'" . $query_image . ",
					country = '$country'
                        WHERE id = $place_id";
        $res = $link->query($query);

        if ($link->affected_rows > 0) {
			if($image!=false){
				imagejpeg($image, "../uploads/" . $place_id . ".jpg");	
			}
			array_map('unlink', glob("temp/tmp.*"));			          
            
            $query_version = "UPDATE options SET value=CAST((value + 0.01) AS DECIMAL(10,2)) WHERE name='version'";
            $vers = $link->query($query_version);				
            if ($link->affected_rows > 0) {
                $link->query("UPDATE places SET version = (SELECT value FROM options WHERE name='version') WHERE id=" . $place_id);
            }            
			
            $_SESSION['answer'] = "<div class='success'>Place has been updated!</div>";
            return true;
        } else {
            $_SESSION['edit_place']['res'] = "<div class='error'>Error, or you have change nothing!</div>";
            array_map('unlink', glob("temp/tmp.*"));
            return false;
        }
    }
}

function add_place($link) {
    $name = trim($_POST['name']);
    $address = trim($_POST['address']);
    $description = trim($_POST['description']);
    $latitude = trim($_POST['latitude']);
    $longitude = trim($_POST['longitude']);
    $type = $_POST['type'];
	$country = $_POST['country'];
	$temp_file = empty(glob('temp/tmp.*'))?false:glob('temp/tmp.*')[0];
	$image = false;
    if (empty($name)) {
        $_SESSION['add_place']['res'] = "<div class='error'>Must be name!</div>";
        $_SESSION['add_place']['description'] = $description;
        $_SESSION['add_place']['name'] = $name;
        $_SESSION['add_place']['address'] = $address;
        $_SESSION['add_place']['latitude'] = $latitude;
        $_SESSION['add_place']['longitude'] = $longitude;
        $_SESSION['add_place']['type'] = $type;
		$_SESSION['add_place']['country'] = $country;
        array_map('unlink', glob("temp/tmp.*"));
        return false;
    } else if (empty($address)) {
        $_SESSION['add_place']['res'] = "<div class='error'>Must be address!</div>";
        $_SESSION['add_place']['description'] = $description;
        $_SESSION['add_place']['name'] = $name;
        $_SESSION['add_place']['address'] = $address;
        $_SESSION['add_place']['latitude'] = $latitude;
        $_SESSION['add_place']['longitude'] = $longitude;
        $_SESSION['add_place']['type'] = $type;
		$_SESSION['add_place']['country'] = $country;
        array_map('unlink', glob("temp/tmp.*"));
        return false;
    } else if (empty($latitude)) {
        $_SESSION['add_place']['res'] = "<div class='error'>Must be latitude!</div>";
        $_SESSION['add_place']['description'] = $description;
        $_SESSION['add_place']['name'] = $name;
        $_SESSION['add_place']['address'] = $address;
        $_SESSION['add_place']['latitude'] = $latitude;
        $_SESSION['add_place']['longitude'] = $longitude;
        $_SESSION['add_place']['type'] = $type;
		$_SESSION['add_place']['country'] = $country;
        array_map('unlink', glob("temp/tmp.*"));
        return false;
    } else if (empty($longitude)) {
        $_SESSION['add_place']['res'] = "<div class='error'>Must be longitude!</div>";
        $_SESSION['add_place']['description'] = $description;
        $_SESSION['add_place']['name'] = $name;
        $_SESSION['add_place']['address'] = $address;
        $_SESSION['add_place']['latitude'] = $latitude;
        $_SESSION['add_place']['longitude'] = $longitude;
        $_SESSION['add_place']['type'] = $type;
		$_SESSION['add_place']['country'] = $country;
        array_map('unlink', glob("temp/tmp.*"));
        return false;
    } else {
        $description = clear_admin($description, $link);
        $name = clear_admin($name, $link);
        $address = clear_admin($address, $link);
        $latitude = clear_admin($latitude, $link);
        $longitude = clear_admin($longitude, $link);
        $type = clear_admin($type, $link);
		$country = clear_admin($country, $link);
        $base64 = "";
        if ($temp_file!=false) {
			$ext = pathinfo($temp_file, PATHINFO_EXTENSION);
            if($ext == 'jpg' || $ext == 'jpeg'){
				$image = imagecreatefromjpeg($temp_file);
			}elseif($ext == 'png'){			
				$image = imagecreatefrompng($temp_file);
			}
            
			if($ext == 'jpg' || $ext == 'jpeg'){
				$exif = exif_read_data($temp_file);

				if (!empty($exif['Orientation'])) {
					switch ($exif['Orientation']) {
						case 2:
							$image = image_flip($image,'horizontal');
							break;
						case 3:
							$image = imagerotate($image, 180, 0);
							break;
						case 4:
							$image = image_flip($image,'vertical');
							break;
						case 5:
							$image = image_flip($image,'vertical');
							$image = imagerotate($image, -90, 0);
							break;
						case 6:
							$image = imagerotate($image, -90, 0);
							break;
						case 7:
							$image = image_flip($image,'horizontal');
							$image = imagerotate($image, -90, 0);
							break;
						case 8:
							$image = imagerotate($image, 90, 0);
							break;
					}
				}
			}
		   
			$width = imagesx ($image);
			$height = imagesy ($image);  

			if($width > 800 || $height > 800){
				if($width > $height){
					$newWidth = 800;
					$newHeight = ($newWidth / $width) * $height;
				}else{
					$newHeight = 800;	
					$newWidth = ($newHeight / $height) * $width;			
				}
			  
				$resized = imagecreatetruecolor($newWidth,$newHeight);
				imagecopyresampled($resized, $image, 0, 0, 0, 0,$newWidth, $newHeight, $width, $height);	
				$image = $resized;
				$width = imagesx ($image);
				$height = imagesy ($image);  
			}
			
            $size = ($width<$height)?$width:$height;	
			$x = ($width>$height)?($width-$height)/2:0;
			$y = ($width<$height)?($height-$width)/2:0;
			$thumb = imagecreatetruecolor(150, 150);
			imagecopyresampled($thumb, $image, 0, 0, $x, $y, 150, 150, $size, $size);	
			ob_start(); 
				imagejpeg($thumb); 
				$contents = ob_get_contents(); 
			ob_end_clean(); 

			$base64 = base64_encode($contents);
        }
		$query_version = "UPDATE options SET value=CAST((value + 0.01) AS DECIMAL(10,2)) WHERE name='version'";
        $vers = $link->query($query_version);				
        if ($link->affected_rows > 0) {
			$query = "INSERT INTO places (`latitude`, `longitude`, `name`, `address`, `description`, `image`, `type`, `country`, `version`, `status`) VALUES ('" . $latitude . "', '" . $longitude . "', '" . $name . "',  '" . $address . "', '" . $description . "','" . $base64 . "','" . $type . "','".$country."', (SELECT value FROM options WHERE name='version'), '1')";
			$res = $link->query($query);
		}        
        if ($link->affected_rows > 0) {
			if($image!=false){
				imagejpeg($image, "../uploads/" . $link->insert_id . ".jpg");	
			}
			array_map('unlink', glob("temp/tmp.*"));			
            $_SESSION['answer'] = "<div class='success'>Place has been created!</div>";
            return true;
        } else {
            
            $_SESSION['add_place']['res'] = "<div class='error'>Error!</div>";
            return false;
        }
    }
}

function delete_place($place_id, $link) {
	    
	$query = "UPDATE places SET status='2' WHERE id = $place_id";
	$result = $link->query($query);
	if ($link->affected_rows > 0) {
		$_SESSION['answer'] = "<div class='success'>Place has been deleted!</div>";        
		
		$query_version = "UPDATE options SET value=CAST((value + 0.01) AS DECIMAL(10,2)) WHERE name='version'";
		$link->query($query_version);
		if ($link->affected_rows > 0) {
			$link->query("UPDATE places SET version = (SELECT value FROM options WHERE name='version') WHERE id=" . $place_id);
		}		
	}	
}

function undelete_place($place_id, $link) {
	    
	$query = "UPDATE places SET status='1' WHERE id = $place_id";
	$result = $link->query($query);
	if ($link->affected_rows > 0) {
		$_SESSION['answer'] = "<div class='success'>Place has been recovered!</div>";        
		
		$query_version = "UPDATE options SET value=CAST((value + 0.01) AS DECIMAL(10,2)) WHERE name='version'";
		$link->query($query_version);
		if ($link->affected_rows > 0) {
			$link->query("UPDATE places SET version = (SELECT value FROM options WHERE name='version') WHERE id=" . $place_id);
		}		
	}	
}


function confirm_place($place_id, $link) {
	    
	$link->query("DELETE FROM votes WHERE place_id=" . $place_id . " AND (vote = '0' OR vote = '1')");	
    $query = "UPDATE places SET status='1', votes_yes = '0', votes_no = '0' WHERE id = $place_id";						
    $result = $link->query($query);	
    if ($link->affected_rows > 0) {
        $_SESSION['answer'] = "<div class='success'>Place has been approved!</div>";
		
        $query_version = "UPDATE options SET value=CAST((value + 0.01) AS DECIMAL(10,2)) WHERE name='version'";
        $link->query($query_version);
        if ($link->affected_rows > 0) {
            $link->query("UPDATE places SET version = (SELECT value FROM options WHERE name='version') WHERE id=" . $place_id);
        }        
    }
}

function vote_place($place_id, $link) {
	$status = get_status($place_id, $link);
	if($status == '2'){
		$_SESSION['vote_place']['res'] = "<div class='error'>Error! Place is currently deleted</div>";
        return false;
	}
	
    $votes = array();
    $vote = trim($_POST['vote']);    
    $query = "";
    if ($vote == "yes") {
        $query = "UPDATE places SET votes_yes = votes_yes + 1 WHERE id=" . $place_id;
    } else if ($vote == "no") {
        $query = "UPDATE places SET votes_no = votes_no + 1 WHERE id=" . $place_id;
    } 
    $link->query($query);
    if ($link->affected_rows > 0) {
        $_SESSION['answer'] = "<div class='success'>Your vote has been saved!</div>";
        $query_count = "SELECT status, votes_yes, votes_no FROM places WHERE id=" . $place_id;
        $result = $link->query($query_count);
        $votes = $result->fetch_assoc();
        $votes_count = $votes["votes_yes"] + $votes["votes_no"];
        $precent_yes = $votes["votes_yes"] * 100 / $votes_count;
        if ($precent_yes >= 75 && $votes["votes_yes"] >= 10) {
            $link->query("UPDATE options SET value = CAST((value + 0.01) AS DECIMAL(10,2)) WHERE name='version'");
            $link->query("UPDATE places SET status = '1', votes_yes = '0', votes_no = '0', version = (SELECT value FROM options WHERE name='version') WHERE id=" . $place_id);			
			$link->query("DELETE FROM votes WHERE place_id=" . $place_id . " AND (vote = '0' OR vote = '1')");						
        }
        return true;
    }
}

function get_status($place_id, $link) {
    $query = "SELECT status FROM places WHERE id = $place_id";
    $res = $link->query($query);
    $place = array();
    $place = $res->fetch_assoc();
    $res->free();
    return $place['status'];
}

function redirect($http = false) {
    if ($http)
        $redirect = $http;
    else
        $redirect = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : PATH;
    header("Location: $redirect");
    exit;
}

function pagination($page, $pages_count) {
    $uri = "";
    if ($_SERVER['QUERY_STRING']) {
        foreach ($_GET as $key => $value) {
            if ($key != 'page')
                $uri .= "{$key}={$value}&amp;";
        }
    }

    $back = '';
    $forward = '';
    $startpage = '';
    $endpage = '';
    $page2left = '';
    $page1left = '';
    $page2right = '';
    $page1right = '';

    if ($page > 1) {
        $back = "<a class='nav_link' href='?{$uri}page=" . ($page - 1) . "'>&lt;</a>";
    }
    if ($page < $pages_count) {
        $forward = "<a class='nav_link' href='?{$uri}page=" . ($page + 1) . "'>&gt;</a>";
    }
    if ($page > 3) {
        $startpage = "<a class='nav_link' href='?{$uri}page=1'>&laquo;</a>";
    }
    if ($page < ($pages_count - 2)) {
        $endpage = "<a class='nav_link' href='?{$uri}page={$pages_count}'>&raquo;</a>";
    }
    if ($page - 2 > 0) {
        $page2left = "<a class='nav_link' href='?{$uri}page=" . ($page - 2) . "'>" . ($page - 2) . "</a>";
    }
    if ($page - 1 > 0) {
        $page1left = "<a class='nav_link' href='?{$uri}page=" . ($page - 1) . "'>" . ($page - 1) . "</a>";
    }
    if ($page + 2 <= $pages_count) {
        $page2right = "<a class='nav_link' href='?{$uri}page=" . ($page + 2) . "'>" . ($page + 2) . "</a>";
    }
    if ($page + 1 <= $pages_count) {
        $page1right = "<a class='nav_link' href='?{$uri}page=" . ($page + 1) . "'>" . ($page + 1) . "</a>";
    }

    echo '<div class="pagination">' . $startpage . $back . $page2left . $page1left . '<a class="nav_active">' . $page . '</a>' . $page1right . $page2right . $forward . $endpage . '</div>';
}

function get_stats($link){
	
	$by_platform = "SELECT platform, count(distinct device_id) as users, COUNT(*) AS opens FROM stats WHERE `platform`!='' GROUP BY `platform`";
	$by_model = "SELECT model, count(distinct device_id) as users, COUNT(*) AS opens FROM stats WHERE `model`!='' GROUP BY `model`";
	$by_place_add = "SELECT device_id, count(device_id) as place_add FROM votes WHERE `vote`='2' GROUP BY `device_id`";
	$by_place_delete = "SELECT device_id, count(device_id) as place_add FROM votes WHERE `vote`='3' GROUP BY `device_id`";
    $stats = array();
	$result = $link->query($by_platform);
    while ($row = $result->fetch_assoc()) {
        $stats['by_platform'][] = $row;
    }
	$result->free();
	$result = $link->query($by_model);
    while ($row = $result->fetch_assoc()) {
        $stats['by_model'][] = $row;
    }
	$result->free();
	$result = $link->query($by_place_add);
    while ($row = $result->fetch_assoc()) {
        $stats['by_place_add'][] = $row;
    }
	$result->free();
	$result = $link->query($by_place_delete);
    while ($row = $result->fetch_assoc()) {
        $stats['by_place_delete'][] = $row;
    }
	$result->free();
	

    return $stats;
}

function add_msg($link){
	
	$name = trim($_POST['title']);
    $message = trim($_POST['message']);
    $device_id = trim($_POST['device_id']);
	if (empty($message)) {
        $_SESSION['msg']['res'] = "<div class='error'>Must be message!</div>";
        return false;
    } else{		
	
		$query = "SELECT * FROM msg WHERE `device_id`='".$device_id."'";
		$res = $link->query($query);
		$msg = array();
		if ($res!=false){
			while ($row = $res->fetch_assoc()) {
				$msg[] = $row;
			}
		}
		$res->free();
		
		if(!empty($msg)){
			$_SESSION['msg']['res'] = "<div class='error'>Error! Message wasn't added. Message for this user or all users already exists</div>";
			return false;
		}
		
		$query = "INSERT INTO msg (`title`, `message`, `device_id`) VALUES ('" . $name . "', '" . $message . "', '".$device_id."')";
		$res = $link->query($query);		
		if ($res!=false && $link->affected_rows > 0) {
				$_SESSION['msg']['res'] = "<div class='success'>Message was added!</div>";
				return true;
		}else{
			$_SESSION['msg']['res'] = "<div class='error'>Error! Message wasn't added</div>";
			return false;
		}
	}
}

function get_msg($link){
	
	$msg = array();
	
	$query = "SELECT * FROM msg WHERE device_id=''";    
    $res = $link->query($query);
	if ($res!=false){
		while ($row = $res->fetch_assoc()) {
			$msg[] = $row;
		}
	}
    $res->free();
	
	$query = "SELECT * FROM msg WHERE device_id!='' ORDER BY id DESC";    
    $res = $link->query($query);
	if ($res!=false){
		while ($row = $res->fetch_assoc()) {
			$msg[] = $row;
		}
	}
    $res->free();

    return $msg;
}

function delete_msg($msg_id, $link) {
	    
	$query = "DELETE FROM msg WHERE id = ".$msg_id;
	$res = $link->query($query);
	if ($res!=false && $link->affected_rows > 0) {		
		$_SESSION['msg']['res'] = "<div class='success'>Message has been deleted!</div>";	
		return true;		
	}	
	return false;
}

function delete_perm($place_id, $link) {
	    
	
	$query = "DELETE FROM votes WHERE place_id = ".$place_id;
	$res = $link->query($query);
	if ($res!=false) {	
		$query = "UPDATE places SET status='2' WHERE id = $place_id";
		$result = $link->query($query);
		if ($result != false && $link->affected_rows > 0) {
			$query_version = "UPDATE options SET value=CAST((value + 0.01) AS DECIMAL(10,2)) WHERE name='version'";
			$result = $link->query($query_version);
			if ($result != false && $link->affected_rows > 0) {
				$res = $link->query("UPDATE places SET latitude='DELETED',longitude='DELETED',name='DELETED',address='DELETED',country='DELETED',description='DELETED',image='DELETED',type='DELETED',votes_yes='-1',votes_no='-1',delete_counter=-1,date='0000-00-00 00:00:00', version = (SELECT value FROM options WHERE name='version') WHERE id=" . $place_id);
				if ($res!=false && $link->affected_rows > 0) {	
					if(file_exists("../uploads/" . $place_id . ".jpg")){
						if( unlink("../uploads/" . $place_id . ".jpg")){
							$_SESSION['answer'] = "<div class='success'>Place and it's data were permanently deleted!</div>";				
							return true;		
						}
					}else{
						$_SESSION['answer'] = "<div class='success'>Place and it's data were permanently deleted!</div>";				
						return true;		
					}
				}		
			}		
		}				
	}	
	return false;
}
	