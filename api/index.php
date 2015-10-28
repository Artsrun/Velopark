<?php

require_once '../config.php';

$link = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

function get_data($link) {
    $local_version = $_POST["version"];
    $places = array();
    if (!$local_version) {
        $local_version = 0;
    }
    $query = "SELECT * FROM places WHERE version >" . $local_version;
    if ($result = $link->query($query)) {
        while ($row = $result->fetch_assoc()) {
            $places[] = $row;
        }
        $result->free();
    }

    echo json_encode($places);
}

function get_version($link) {
    $query = "SELECT * FROM options WHERE name='version' LIMIT 1";
    if ($result = $link->query($query)) {
        while ($row = $result->fetch_assoc()) {
            $version = $row["value"];
        }

        $result->free();
    }

    print_r($version);
}

function get_places($link) {
    $places = array();
    
    if ($_POST["unique_id"]) {
        $unique_id = $_POST["unique_id"];
        $query = "SELECT id, latitude, longitude, name, address, description, image, type FROM places "
                . "WHERE status<>'2' AND id NOT IN "
                . "(SELECT places.id FROM places INNER JOIN votes ON places.id=votes.place_id "
                . "WHERE votes.device_id = '" . $unique_id . "')";
        $result = $link->query($query);
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $places[] = $row;
            }
        } else {
            $places['no-result'] = "no";
        }
        $result->free();
    }
    echo json_encode($places);
}

function set_upload($link) {
    $unique_id = $_POST['device_id'];
    $latitude = $link->real_escape_string(trim($_POST['lat']));
    $longitude = $link->real_escape_string(trim($_POST['long']));
    $name = $link->real_escape_string(trim($_POST['name']));
    $desc = $link->real_escape_string(trim($_POST['desc']));
    $address = $link->real_escape_string(trim($_POST['address']));
    $type = $link->real_escape_string(trim($_POST['type']));
    $image = imagecreatefromjpeg($_FILES["file"]["tmp_name"]);
    list($width, $height) = getimagesize($_FILES["file"]["tmp_name"]);
    $thumb = imagecreatetruecolor(150, 150);
    imagecopyresized($thumb, $image, 0, 0, 0, 0, 150, 150, $width, $height);
    imagejpeg($thumb, '../new.jpg');
    $path = "../new.jpg";
    $data = file_get_contents($path);
    $base64 = base64_encode($data);
    $query = "INSERT INTO places (`latitude`, `longitude`, `name`, `address`, `description`,`image`, `type`, `version`, `status` ) VALUES ('" . $latitude . "', '" . $longitude . "', '" . $name . "','". $address ."' ,'" . $desc . "','" . $base64 . "','" . $type . "', 0, '0')";
    $result = $link->query($query);
    if ($link->affected_rows > 0) {
        $id = $link->insert_id;
        move_uploaded_file($_FILES["file"]["tmp_name"], "../uploads/" . $id . ".jpg");
        $query_vote = "INSERT INTO votes (`place_id`, `device_id`, `vote`) VALUES (" . $id . ", '" . $unique_id . "', '2') ";
        $result = $link->query($query_vote);
    }


}

function voting($link) {
    $votes = array();
    $unique_id = $_POST['device_id'];
    $place_id = abs((int) $_POST["place_id"]);
    $vote = $link->real_escape_string(trim($_POST["vote"]));
    $query = "INSERT INTO votes (`place_id`, `device_id`, `vote`) VALUES (" . $place_id . ", '" . $unique_id . "', '" . $vote . "')";
    $result = $link->query($query);
    if ($link->affected_rows > 0) {
        if (($_POST["vote"]) == "1") {
            $query_vote = "UPDATE places SET votes_yes = votes_yes + 1 WHERE id=" . $place_id;
        } else {
            $query_vote = "UPDATE places SET votes_no = votes_no + 1 WHERE id=" . $place_id;
        }
        $res = $link->query($query_vote);
        if ($link->affected_rows > 0) {
            $query_count = "SELECT status, votes_yes, votes_no FROM places WHERE id=" . $place_id;
            $result = $link->query($query_count);
            while ($row = $result->fetch_assoc()) {
                $votes[] = $row;
            }
            $votes_count = $votes[0]["votes_yes"] + $votes[0]["votes_no"];
            $precent_yes = $votes[0]["votes_yes"] * 100 / $votes_count;
            if ($votes[0]["status"] == "1" && $precent_yes < 70) {
                $link->query("UPDATE options SET value = value + 0.01 WHERE name='version'");
                $link->query("UPDATE places SET status = '0', version = (SELECT value FROM options WHERE name='version') WHERE id=" . $place_id);
            } else if ($votes[0]["status"] == "0" && $precent_yes >= 70 && $votes[0]["votes_yes"] >= 5) {
                $link->query("UPDATE options SET value = value + 0.01 WHERE name='version'");
                $link->query("UPDATE places SET status = '1', version = (SELECT value FROM options WHERE name='version') WHERE id=" . $place_id);
            }
        }
    }
}

function new_count($link) {

    $device_id = $_POST["device_id"];
    $query = "SELECT id FROM places "
            . "WHERE status<>'2' AND id NOT IN "
            . "(SELECT places.id FROM places INNER JOIN votes ON places.id=votes.place_id "
            . "WHERE votes.device_id = '" . $device_id . "')";
    if ($result = $link->query($query)) {
        $row_cnt = $result->num_rows;
        echo $row_cnt;
    };
}

if ($link->connect_errno) {
    printf("Error to connecting database. Error code: %s\n", $link->connect_error);
    exit;
}

if (isset($_POST['action'])) {
    switch ($_POST['action']) {
        case "index":
            get_data($link);
            break;
        case "version":
            get_version($link);
            break;
        case "addplaces":
            get_places($link);
            break;
        case "upload":
            set_upload($link);
            break;
        case "voting":
            voting($link);
            break;
        case "new_count":
            new_count($link);
            break;
    }
} else {
    exit('Access denied');
}

$link->close();

