<?php

date_default_timezone_set('UTC');
require_once '../config.php';

$link = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
$link->set_charset('utf8');

function clear_admin($var, $link) {
    $var = strip_tags($link->real_escape_string($var));
    return $var;
}

function get_places($link) {

    $local_version = clear_admin(trim($_POST['version']), $link);
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
        'status' => $status,
        'data' => $places
    ]);
}

function add_stats($link) {

    $platform = clear_admin(trim($_POST['platform']), $link);
    $device_id = clear_admin(trim($_POST['device_id']), $link);
    $model = clear_admin(trim($_POST['model']), $link);
    $version = clear_admin(trim($_POST['version']), $link);
    $query = "INSERT INTO stats (`platform`, `device_id`, `model`, `version`) VALUES ('" . $platform . "', '" . $device_id . "', '" . $model . "', '" . $version . "')";
    $result = $link->query($query);
    return ($result != false) ? true : false;
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

    $device_id = clear_admin(trim($_POST['device_id']), $link);
    $query = "SELECT * FROM msg WHERE device_id='" . $device_id . "' OR device_id='' ORDER BY device_id DESC";
    $result = $link->query($query);
    $msg = array();
    if ($result != false) {
        while ($row = $result->fetch_assoc()) {
            $msg[] = $row;
        }
        $result->free();
    }
    $msg_to_send = empty($msg) ? '' : (isset($msg[1]) ? ($msg[1]['device_id'] == '' ? $msg[1] : $msg[0]) : $msg[0]);

    add_stats($link);
    echo json_encode([
        'msg' => $msg_to_send,
        'status' => $status,
        'data' => $version
    ]);
}

function get_votes($link) {
    $places = array();
    $status = 'failed';
    if ($_POST["unique_id"]) {

        $country = isset($_POST['country']) ? clear_admin(trim($_POST['country']), $link) : '';
        $country_state = ($country == '') ? '' : "AND country='" . $country . "'";
        $unique_id = clear_admin(trim($_POST['unique_id']), $link);
        $query = "SELECT id as server_id, latitude, longitude, name, address, description, image, type FROM places "
                . "WHERE status='0' " . $country_state . " AND id NOT IN "
                . "(SELECT places.id FROM places INNER JOIN votes ON places.id=votes.place_id "
                . "WHERE votes.device_id = '" . $unique_id . "' AND (votes.vote = '0' OR votes.vote = '1')) ORDER BY id DESC LIMIT 0, 10";
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
        'status' => $status,
        'data' => $places
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

    $status = 'failed';

    $image_data = @getimagesize($_FILES["file"]['tmp_name']);
    $mime_type = (!empty($image_data['mime'])) ? $image_data['mime'] : false;

    if ($mime_type == 'image/jpeg' || $mime_type == 'image/png') {

        if ($mime_type == 'image/jpeg') {
            $image = @imagecreatefromjpeg($_FILES["file"]["tmp_name"]);
        } elseif ($mime_type == 'image/png') {
            $image = @imagecreatefrompng($_FILES["file"]["tmp_name"]);
        }
        if ($image != false) {
            $unique_id = clear_admin(trim($_POST['device_id']), $link);
            $latitude = clear_admin(trim($_POST['lat']), $link);
            $longitude = clear_admin(trim($_POST['long']), $link);
            $name = clear_admin(trim($_POST['name']), $link);
            $desc = clear_admin(trim($_POST['desc']), $link);
            $address = clear_admin(trim($_POST['address']), $link);
            $type = clear_admin(trim($_POST['type']), $link);
            $country = clear_admin(trim($_POST['country']), $link);

            if ($mime_type == 'image/jpeg') {
                $exif = @exif_read_data($_FILES["file"]["tmp_name"]);

                if (!empty($exif['Orientation'])) {
                    switch ($exif['Orientation']) {
                        case 2:
                            $image = image_flip($image, 'horizontal');
                            break;
                        case 3:
                            $image = imagerotate($image, 180, 0);
                            break;
                        case 4:
                            $image = image_flip($image, 'vertical');
                            break;
                        case 5:
                            $image = image_flip($image, 'vertical');
                            $image = imagerotate($image, -90, 0);
                            break;
                        case 6:
                            $image = imagerotate($image, -90, 0);
                            break;
                        case 7:
                            $image = image_flip($image, 'horizontal');
                            $image = imagerotate($image, -90, 0);
                            break;
                        case 8:
                            $image = imagerotate($image, 90, 0);
                            break;
                    }
                }
            }
            $width = imagesx($image);
            $height = imagesy($image);

            if ($width > 800 || $height > 800) {
                if ($width > $height) {
                    $newWidth = 800;
                    $newHeight = ($newWidth / $width) * $height;
                } else {
                    $newHeight = 800;
                    $newWidth = ($newHeight / $height) * $width;
                }

                $resized = imagecreatetruecolor($newWidth, $newHeight);
                imagecopyresampled($resized, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
                $image = $resized;
                $width = imagesx($image);
                $height = imagesy($image);
            }

            $size = ($width < $height) ? $width : $height;
            $x = ($width > $height) ? ($width - $height) / 2 : 0;
            $y = ($width < $height) ? ($height - $width) / 2 : 0;
            $thumb = imagecreatetruecolor(150, 150);
            imagecopyresampled($thumb, $image, 0, 0, $x, $y, 150, 150, $size, $size);

            ob_start();
            imagejpeg($thumb);
            $contents = ob_get_contents();
            ob_end_clean();

            $base64 = @base64_encode($contents);
            $base64 = ($base64 == false) ? '' : $base64;
            $query = "INSERT INTO places (`latitude`, `longitude`, `name`, `address`, `country`, `description`,`image`, `type`, `version`, `status`, `votes_yes` ) VALUES ('" . $latitude . "', '" . $longitude . "', '" . $name . "','" . $address . "' ,'" . $country . "' ,'" . $desc . "','" . $base64 . "','" . $type . "', 0, '0', '1')";

            $result = $link->query($query);
            if ($result != false) {
                if ($link->affected_rows > 0) {
                    $id = $link->insert_id;
                    imagejpeg($image, "../uploads/" . $id . ".jpg");
                    $query_vote = "INSERT INTO votes (`place_id`, `device_id`, `vote`) VALUES (" . $id . ", '" . $unique_id . "', '2') ";
                    $result = $link->query($query_vote);
                    $query_vote = "INSERT INTO votes (`place_id`, `device_id`, `vote`) VALUES (" . $id . ", '" . $unique_id . "', '1') ";
                    $result = $link->query($query_vote);
                    $status = 'success';
                }
            }
        }
    }

    echo json_encode([
        'status' => $status
    ]);
}

function add_vote($link) {
    $votes = array();
    $status = 'failed';
    $unique_id = clear_admin(trim($_POST['device_id']), $link);
    $place_id = abs((int) clear_admin(trim($_POST['place_id']), $link));
    $vote = clear_admin(trim($_POST['vote']), $link);
    $query = "INSERT INTO votes (`place_id`, `device_id`, `vote`) VALUES (" . $place_id . ", '" . $unique_id . "', '" . $vote . "')";
    $result = $link->query($query);
    if ($result != false) {
        if ($link->affected_rows > 0) {
            if (($_POST["vote"]) == "1") {
                $query_vote = "UPDATE places SET votes_yes = votes_yes + 1 WHERE id=" . $place_id;
            } else {
                $query_vote = "UPDATE places SET votes_no = votes_no + 1 WHERE id=" . $place_id;
            }
            $res = $link->query($query_vote);
            if ($res != false) {
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
                        $link->query("UPDATE places SET status = '1', votes_yes = '0', votes_no = '0', version = (SELECT value FROM options WHERE name='version') WHERE id=" . $place_id);
                        $link->query("DELETE FROM votes WHERE place_id=" . $place_id . " AND (vote = '0' OR vote = '1')");
                    }
                    $status = 'success';
                }
            }
        }
    }
    echo json_encode([
        'status' => $status
    ]);
}

function add_delete($link) {
    $deletes = array();
    $status = 'failed';
    $unique_id = clear_admin(trim($_POST['device_id']), $link);
    $place_id = abs((int) clear_admin(trim($_POST['place_id']), $link));

    $query = "INSERT INTO votes (`place_id`, `device_id`, `vote`) VALUES (" . $place_id . ", '" . $unique_id . "', '3')";
    $result = $link->query($query);
    $query = "INSERT INTO votes (`place_id`, `device_id`, `vote`) VALUES (" . $place_id . ", '" . $unique_id . "', '0')";
    $result = $link->query($query);
    $query = "UPDATE places SET votes_no = votes_no + 1 WHERE id=" . $place_id;
    $result = $link->query($query);
    if ($result != false) {
        if ($link->affected_rows > 0) {
            $query = "UPDATE places SET delete_counter = delete_counter + 1 WHERE id=" . $place_id;
            $res = $link->query($query);
            if ($res != false) {
                if ($link->affected_rows > 0) {
                    $query_count = "SELECT delete_counter FROM places WHERE id=" . $place_id;
                    $result = $link->query($query_count);
                    while ($row = $result->fetch_assoc()) {
                        $deletes[] = $row;
                    }
                    $delete_counter = $deletes[0]["delete_counter"];
                    if ($delete_counter >= 3) {
                        $link->query("UPDATE options SET value = CAST((value + 0.01) AS DECIMAL(10,2)) WHERE name='version'");
                        $link->query("UPDATE places SET status = '0', delete_counter = '0', version = (SELECT value FROM options WHERE name='version') WHERE id=" . $place_id);
                    }
                    $status = 'success';
                }
            }
        }
    }
    echo json_encode([
        'status' => $status
    ]);
}

function get_count($link) {
    $row_cnt = 0;
    $status = 'failed';
    if ($_POST["device_id"]) {

        $device_id = clear_admin(trim($_POST['device_id']), $link);
        $country = isset($_POST['country']) ? clear_admin(trim($_POST['country']), $link) : '';
        $country_state = ($country == '') ? '' : "AND country='" . $country . "'";
        $query = "SELECT id FROM places "
                . "WHERE status='0' " . $country_state . " AND id NOT IN "
                . "(SELECT places.id FROM places INNER JOIN votes ON places.id=votes.place_id "
                . "WHERE votes.device_id = '" . $device_id . "' AND (votes.vote = '0' OR votes.vote = '1')) LIMIT 0, 10";
        $result = $link->query($query);
        if ($result != false) {
            $row_cnt = $result->num_rows;
            $status = 'success';
        }
    }

    echo json_encode([
        'status' => $status,
        'data' => $row_cnt
    ]);
}

if ($link->connect_error) {
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
        case "add_delete":
            add_delete($link);
            break;
        case "get_count":
            get_count($link);
            break;
    }
} else {
    exit('Access denied');
}

$link->close();

