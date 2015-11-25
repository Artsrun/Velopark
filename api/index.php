<?php

require_once '../config.php';

$link = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

function get_places($link) {
    $local_version = $_POST["version"];
	$status = 'failed';
    $places = array();
    if (!$local_version) {
        $local_version = 0;
    }
    $query = "SELECT * FROM places WHERE version >" . $local_version;
	$result = $link->query($query);
    if ($result != false) {
        while ($row = $result->fetch_assoc()) {
            $places[] = $row;
        }
		$status = 'success';
        $result->free();
    }
	
    echo json_encode([
		'status'=>$status,
		'data'=>$places
	]);
}

function add_stats($link){

	$platform = $link->real_escape_string(trim($_POST['platform']));
    $device_id = $link->real_escape_string(trim($_POST['device_id']));
	$model = $link->real_escape_string(trim($_POST['model']));
    $version = $link->real_escape_string(trim($_POST['version']));
	$query = "INSERT INTO stats (`platform`, `device_id`, `model`, `version`) VALUES ('" . $platform . "', '" . $device_id . "', '" . $model . "', '" . $version . "')";
	$result = $link->query($query);
	return ($result!=false)?true:false;
}

function get_version($link) {
    $query = "SELECT * FROM options WHERE name='version' LIMIT 1";
	$status = 'failed';
	$result = $link->query($query);
    if ($result != false) {
        while ($row = $result->fetch_assoc()) {
            $version = $row["value"];
        }
		$status = 'success';
        $result->free();
    }
	add_stats($link);
	echo json_encode([
		'status'=>$status,
		'data'=>$version
	]);
}

function get_votes($link) {
    $places = array();
    $status = 'failed';
    if ($_POST["unique_id"]) {
        $unique_id = $_POST["unique_id"];
        $query = "SELECT id as server_id, latitude, longitude, name, address, description, image, type FROM places "
                . "WHERE status='0' AND id NOT IN "
                . "(SELECT places.id FROM places INNER JOIN votes ON places.id=votes.place_id "
                . "WHERE votes.device_id = '" . $unique_id . "') ORDER BY id DESC";
        $result = $link->query($query);
		if ($result != false) {
			if ($result->num_rows > 0) {
				while ($row = $result->fetch_assoc()) {
					$places[] = $row;
				}
			} else {
				$places['no-result'] = "no";
			}
			$status = 'success';
			$result->free();		
		}
    }	

	echo json_encode([
		'status'=>$status,
		'data'=>$places
	]);
}
function image_flip($imgsrc, $mode) {

    $width = imagesx($imgsrc);
    $height = imagesy($imgsrc);
    $src_x = 0;
    $src_y = 0;
    $src_width = $width;
    $src_height = $height;
    switch ($mode) {
        case 'vertical':
            $src_y = $height - 1;
            $src_height = -$height;
            break;

        case 'horizontal':
            $src_x = $width - 1;
            $src_width = -$width;
            break;

        case 'both':
            $src_x = $width - 1;
            $src_y = $height - 1;
            $src_width = -$width;
            $src_height = -$height;
            break;

        default:
            return $imgsrc;
    }
    $imgdest = imagecreatetruecolor($width, $height);
    if (imagecopyresampled($imgdest, $imgsrc, 0, 0, $src_x, $src_y, $width, $height, $src_width, $src_height)) {
        return $imgdest;
    }
    return $imgsrc;
}
function add_place($link) {
    $unique_id = $_POST['device_id'];
	$status = 'failed';
    $latitude = $link->real_escape_string(trim($_POST['lat']));
    $longitude = $link->real_escape_string(trim($_POST['long']));
    $name = $link->real_escape_string(trim($_POST['name']));
    $desc = $link->real_escape_string(trim($_POST['desc']));
    $address = $link->real_escape_string(trim($_POST['address']));
    $type = $link->real_escape_string(trim($_POST['type']));
	
    $image = imagecreatefromjpeg($_FILES["file"]["tmp_name"]);
	
	$exif = exif_read_data($_FILES["file"]["tmp_name"]);

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
		imagejpeg($resized, $_FILES["file"]["tmp_name"]);
	}else{
		imagejpeg($image, $_FILES["file"]["tmp_name"]);
	}
	
	$size = ($width<$height)?$width:$height;	
	$x = ($width>$height)?($width-$height)/2:0;
	$y = ($width<$height)?($height-$width)/2:0;
	$thumb = imagecreatetruecolor(150, 150);
	imagecopyresampled($thumb, $image, 0, 0, $x, $y, 150, 150, $size, $size);	
    imagejpeg($thumb, '../new.jpg');
    $path = "../new.jpg";
    $data = file_get_contents($path);
    $base64 = base64_encode($data);
    $query = "INSERT INTO places (`latitude`, `longitude`, `name`, `address`, `description`,`image`, `type`, `version`, `status` ) VALUES ('" . $latitude . "', '" . $longitude . "', '" . $name . "','". $address ."' ,'" . $desc . "','" . $base64 . "','" . $type . "', 0, '0')";
    
	$result = $link->query($query);
    if ($result != false) {
		if ($link->affected_rows > 0) {
			$id = $link->insert_id;
			move_uploaded_file($_FILES["file"]["tmp_name"], "../uploads/" . $id . ".jpg");
			$query_vote = "INSERT INTO votes (`place_id`, `device_id`, `vote`) VALUES (" . $id . ", '" . $unique_id . "', '2') ";
			$result = $link->query($query_vote);			
			$status = 'success';
		}		
	}
	
	echo json_encode([
		'status'=>$status
	]);


}

function add_vote($link) {
    $votes = array();
	$status = 'failed';
    $unique_id = $_POST['device_id'];
    $place_id = abs((int) $_POST["place_id"]);
    $vote = $link->real_escape_string(trim($_POST["vote"]));
    $query = "INSERT INTO votes (`place_id`, `device_id`, `vote`) VALUES (" . $place_id . ", '" . $unique_id . "', '" . $vote . "')";
    $result = $link->query($query);
	if($result != false){
		if ($link->affected_rows > 0) {
			if (($_POST["vote"]) == "1") {
				$query_vote = "UPDATE places SET votes_yes = votes_yes + 1 WHERE id=" . $place_id;
			} else {
				$query_vote = "UPDATE places SET votes_no = votes_no + 1 WHERE id=" . $place_id;
			}
			$res = $link->query($query_vote);
			if($res != false){
				if ($link->affected_rows > 0) {
					$query_count = "SELECT status, votes_yes, votes_no FROM places WHERE id=" . $place_id;
					$result = $link->query($query_count);
					while ($row = $result->fetch_assoc()) {
						$votes[] = $row;
					}
					$votes_count = $votes[0]["votes_yes"] + $votes[0]["votes_no"];
					$precent_yes = $votes[0]["votes_yes"] * 100 / $votes_count;
					if ($votes[0]["status"] == "0" && $precent_yes >= 75 && $votes[0]["votes_yes"] >= 10) {
						$link->query("UPDATE options SET value = CAST((value + 0.01) AS DECIMAL(10,2)) WHERE name='version'");
						$link->query("UPDATE places SET status = '1', version = (SELECT value FROM options WHERE name='version') WHERE id=" . $place_id);
					}			
					$status = 'success';					
				}				
			}
		}		
	}
	echo json_encode([
		'status'=>$status
	]);
}

function get_count($link) {
	$status = 'failed';
    $device_id = $_POST["device_id"];
    $query = "SELECT id FROM places "
            . "WHERE status='0' AND id NOT IN "
            . "(SELECT places.id FROM places INNER JOIN votes ON places.id=votes.place_id "
            . "WHERE votes.device_id = '" . $device_id . "')";
    $result = $link->query($query);
	if ($result != false) {
		$row_cnt = $result->num_rows;		
		$status = 'success';
	}	
	
	echo json_encode([
		'status'=>$status,
		'data' => $row_cnt
	]);
}

if ($link->connect_errno) {
    printf("Error to connecting database. Error code: %s\n", $link->connect_error);
    exit;
}

if (isset($_POST['action'])) {
    switch ($_POST['action']) {
        case "get_places":
            get_places($link);
            break;
        case "get_version":
            get_version($link);
            break;
        case "get_votes":
            get_votes($link);
            break;
        case "add_place":
            add_place($link);
            break;
        case "add_vote":
            add_vote($link);
            break;
        case "get_count":
            get_count($link);
            break;
    }
} else {
    exit('Access denied');
}

$link->close();

