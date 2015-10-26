<?php

defined('VELOPARK') or die('Access denied');

function clear_admin($var, $link) {
    $var = $link->real_escape_string($var);
    return $var;
}

function places($link, $start_pos, $perpage) {
    $query = "SELECT * FROM places WHERE status<>'2' ORDER BY id DESC LIMIT $start_pos, $perpage";
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
    $query = "SELECT COUNT(id) FROM places WHERE status<>'2'";
    $res = $link->query($query);
    $count_places = $res->fetch_row();
    $res->free();
    return $count_places[0];
}

function edit_place($place_id, $link) {
    $name = trim($_POST['name']);
    $address = trim($_POST['address']);
    $description = trim($_POST['description']);
    $latitude = trim($_POST['latitude']);
    $longitude = trim($_POST['longitude']);
    $type = $_POST['type'];

    if (empty($name)) {
        $_SESSION['edit_place']['res'] = "<div class='error'>Must be name!</div>";
        if (file_exists("temp/tmp.jpg")) {
            unlink("temp/tmp.jpg");
        }
        return false;
    } else if (empty($latitude)) {
        $_SESSION['edit_place']['res'] = "<div class='error'>Must be latitude!</div>";
        if (file_exists("temp/tmp.jpg")) {
            unlink("temp/tmp.jpg");
        }
        return false;
    } else if (empty($longitude)) {
        $_SESSION['edit_place']['res'] = "<div class='error'>Must be longitude!</div>";
        if (file_exists("temp/tmp.jpg")) {
            unlink("temp/tmp.jpg");
        }
        return false;
    } else if (empty($address)) {
        $_SESSION['edit_place']['res'] = "<div class='error'>Must be address!</div>";
        if (file_exists("temp/tmp.jpg")) {
            unlink("temp/tmp.jpg");
        }
        return false;
    } else {
        $name = clear_admin($name, $link);
        $address = clear_admin($address, $link);
        $description = clear_admin($description, $link);
        $latitude = clear_admin($latitude, $link);
        $longitude = clear_admin($longitude, $link);
        $type = clear_admin($type, $link);
        $query_image = " ";
        if (file_exists("temp/tmp.jpg")) {
            $image = imagecreatefromjpeg("temp/tmp.jpg");
            list($width, $height) = getimagesize("temp/tmp.jpg");
            $thumb = imagecreatetruecolor(150, 150);
            imagecopyresized($thumb, $image, 0, 0, 0, 0, 150, 150, $width, $height);
            imagejpeg($thumb, '../new.jpg');
            $path = "../new.jpg";
            $data = file_get_contents($path);
            $base64 = base64_encode($data);
            $query_image = ", image = '$base64' ";
        }

        $query = "UPDATE places SET
                    latitude = '$latitude',
                    longitude = '$longitude',
                    description = '$description',
                    name = '$name',
                    address = '$address',
                    type = '$type'" . $query_image . "
                        WHERE id = $place_id";
        $res = $link->query($query);

        if ($link->affected_rows > 0) {
            if (file_exists("temp/tmp.jpg")) {
                rename("temp/tmp.jpg", "../uploads/" . $place_id . ".jpg");
            }
            $status = get_status($place_id, $link);
            if ($status == "1") {
                $query_version = "UPDATE options SET value = value+0.01 WHERE name='version'";
                $vers = $link->query($query_version);
                if ($link->affected_rows > 0) {
                    $link->query("UPDATE places SET version = (SELECT value FROM options WHERE name='version') WHERE id=" . $place_id);
                }
            }
            $_SESSION['answer'] = "<div class='success'>Place has been updated!</div>";
            return true;
        } else {
            $_SESSION['edit_place']['res'] = "<div class='error'>Error, or you have change nothing!</div>";
            if (file_exists("temp/tmp.jpg")) {
                unlink("temp/tmp.jpg");
            }
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
    if (empty($name)) {
        $_SESSION['add_place']['res'] = "<div class='error'>Must be name!</div>";
        $_SESSION['add_place']['description'] = $description;
        $_SESSION['add_place']['name'] = $name;
        $_SESSION['add_place']['address'] = $address;
        $_SESSION['add_place']['latitude'] = $latitude;
        $_SESSION['add_place']['longitude'] = $longitude;
        $_SESSION['add_place']['type'] = $type;
        if (file_exists("temp/tmp.jpg")) {
            unlink("temp/tmp.jpg");
        }
        return false;
    } else if (empty(address)) {
        $_SESSION['add_place']['res'] = "<div class='error'>Must be address!</div>";
        $_SESSION['add_place']['description'] = $description;
        $_SESSION['add_place']['name'] = $name;
        $_SESSION['add_place']['address'] = $address;
        $_SESSION['add_place']['latitude'] = $latitude;
        $_SESSION['add_place']['longitude'] = $longitude;
        $_SESSION['add_place']['type'] = $type;
        if (file_exists("temp/tmp.jpg")) {
            unlink("temp/tmp.jpg");
        }
        return false;
    } else if (empty($latitude)) {
        $_SESSION['add_place']['res'] = "<div class='error'>Must be latitude!</div>";
        $_SESSION['add_place']['description'] = $description;
        $_SESSION['add_place']['name'] = $name;
        $_SESSION['add_place']['address'] = $address;
        $_SESSION['add_place']['latitude'] = $latitude;
        $_SESSION['add_place']['longitude'] = $longitude;
        $_SESSION['add_place']['type'] = $type;
        if (file_exists("temp/tmp.jpg")) {
            unlink("temp/tmp.jpg");
        }
        return false;
    } else if (empty($longitude)) {
        $_SESSION['add_place']['res'] = "<div class='error'>Must be longitude!</div>";
        $_SESSION['add_place']['description'] = $description;
        $_SESSION['add_place']['name'] = $name;
        $_SESSION['add_place']['address'] = $address;
        $_SESSION['add_place']['latitude'] = $latitude;
        $_SESSION['add_place']['longitude'] = $longitude;
        $_SESSION['add_place']['type'] = $type;
        if (file_exists("temp/tmp.jpg")) {
            unlink("temp/tmp.jpg");
        }
        return false;
    } else {
        $description = clear_admin($description, $link);
        $name = clear_admin($name, $link);
        $address = clear_admin($address, $link);
        $latitude = clear_admin($latitude, $link);
        $longitude = clear_admin($longitude, $link);
        $type = clear_admin($type, $link);
        $base64 = "";
        if (file_exists("temp/tmp.jpg")) {
            $image = imagecreatefromjpeg("temp/tmp.jpg");
            list($width, $height) = getimagesize("temp/tmp.jpg");
            $thumb = imagecreatetruecolor(150, 150);
            imagecopyresized($thumb, $image, 0, 0, 0, 0, 150, 150, $width, $height);
            imagejpeg($thumb, '../new.jpg');
            $path = "../new.jpg";
            $data = file_get_contents($path);
            $base64 = base64_encode($data);
        }
        $query = "INSERT INTO places (`latitude`, `longitude`, `name`, `address`, `description`, `image`, `type`, `version`, `status`,`votes_yes` ) VALUES ('" . $latitude . "', '" . $longitude . "', '" . $name . "',  '" . $address . "', '" . $description . "','" . $base64 . "','" . $type . "', 0, '1', 5)";
        $res = $link->query($query);
        if ($link->affected_rows > 0) {
            if (file_exists("temp/tmp.jpg")) {
                rename("temp/tmp.jpg", "../uploads/" . $link->insert_id . ".jpg");
            }
            $_SESSION['answer'] = "<div class='success'>Place has been created!</div>";
            return true;
        } else {
            if (file_exists("temp/tmp.jpg")) {
                unlink("temp/tmp.jpg");
            }
            $_SESSION['add_place']['res'] = "<div class='error'>Error!</div>";
            return false;
        }
    }
}

function delete_place($place_id, $link) {
    $status = get_status($place_id, $link);
    $query = "UPDATE places SET status='2' WHERE id = $place_id";
    $result = $link->query($query);
    if ($link->affected_rows > 0) {
        $_SESSION['answer'] = "<div class='success'>Place has been deleted!</div>";
        $query = "UPDATE places SET status='2' WHERE id = $place_id";
        if ($status == "1") {
            $query_version = "UPDATE options SET value = value+0.01 WHERE name='version'";
            $link->query($query_version);
            if ($link->affected_rows > 0) {
                $link->query("UPDATE places SET version = (SELECT value FROM options WHERE name='version') WHERE id=" . $place_id);
            }
        }
    }
}

function vote_place($place_id, $link) {
    $votes = array();
    $vote = trim($_POST['vote']);
    $status = get_status($place_id, $link);
    $query = "";
    if ($vote == "yes") {
        $query = "UPDATE places SET votes_yes = votes_yes + 1 WHERE id=" . $place_id;
    } else if ($vote == "no") {
        $query = "UPDATE places SET votes_no = votes_no + 1 WHERE id=" . $place_id;
    } else {
        $_SESSION['vote_place']['res'] = "<div class='error'>Error!</div>";
        return false;
    }
    $link->query($query);
    if ($link->affected_rows > 0) {
        $_SESSION['answer'] = "<div class='success'>Your vote has been saved!</div>";
        $query_count = "SELECT status, votes_yes, votes_no FROM places WHERE id=" . $place_id;
        $result = $link->query($query_count);
        $votes = $result->fetch_assoc();
        $votes_count = $votes["votes_yes"] + $votes["votes_no"];
        $precent_yes = $votes["votes_yes"] * 100 / $votes_count;
        if ($votes["status"] == "1" && $precent_yes < 70) {
            $link->query("UPDATE options SET value = value + 0.01 WHERE name='version'");
            $link->query("UPDATE places SET status = '0', version = (SELECT value FROM options WHERE name='version') WHERE id=" . $place_id);
        } else if ($votes["status"] == "0" && $precent_yes >= 70 && $votes["votes_yes"] >= 5) {
            $link->query("UPDATE options SET value = value + 0.01 WHERE name='version'");
            $link->query("UPDATE places SET status = '1', version = (SELECT value FROM options WHERE name='version') WHERE id=" . $place_id);
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
