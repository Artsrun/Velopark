<?php

defined('VELOPARK') or die('Access denied');

function clear_admin($var, $link) {
    $var = $link->real_escape_string($var);
    return $var;
}

function places($link, $start_pos, $perpage) {
    $query = "SELECT * FROM places ORDER BY id DESC LIMIT $start_pos, $perpage";
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
    if ($status == '2') {
        $_SESSION['edit_place']['res'] = "<div class='error'>Error! Place is deleted</div>";
        return false;
    }

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
            $size = ($width < $height) ? $width : $height;
            $x = ($width > $height) ? ($width - $height) / 2 : 0;
            $y = ($width < $height) ? ($height - $width) / 2 : 0;
            $thumb = imagecreatetruecolor(150, 150);
            imagecopyresampled($thumb, $image, 0, 0, $x, $y, 150, 150, $size, $size);
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

            $query_version = "UPDATE options SET value=CAST((value + 0.01) AS DECIMAL(10,2)) WHERE name='version'";
            $vers = $link->query($query_version);
            if ($link->affected_rows > 0) {
                $link->query("UPDATE places SET version = (SELECT value FROM options WHERE name='version') WHERE id=" . $place_id);
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
    } else if (empty($address)) {
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
            $size = ($width < $height) ? $width : $height;
            $x = ($width > $height) ? ($width - $height) / 2 : 0;
            $y = ($width < $height) ? ($height - $width) / 2 : 0;
            $thumb = imagecreatetruecolor(150, 150);
            imagecopyresampled($thumb, $image, 0, 0, $x, $y, 150, 150, $size, $size);
            imagejpeg($thumb, '../new.jpg');
            $path = "../new.jpg";
            $data = file_get_contents($path);
            $base64 = base64_encode($data);
        }
        $query_version = "UPDATE options SET value=CAST((value + 0.01) AS DECIMAL(10,2)) WHERE name='version'";
        $vers = $link->query($query_version);
        if ($link->affected_rows > 0) {
            $query = "INSERT INTO places (`latitude`, `longitude`, `name`, `address`, `description`, `image`, `type`, `version`, `status`,`votes_yes` ) VALUES ('" . $latitude . "', '" . $longitude . "', '" . $name . "',  '" . $address . "', '" . $description . "','" . $base64 . "','" . $type . "', (SELECT value FROM options WHERE name='version'), '1', 0)";
            $res = $link->query($query);
        }
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

function confirm_place($place_id, $link) {

    $query = "UPDATE places SET status='1' WHERE id = $place_id";
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
    if ($status == '2') {
        $_SESSION['vote_place']['res'] = "<div class='error'>Error! Place is deleted</div>";
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

function get_stats($link) {

    $android_open = "SELECT COUNT(*) AS android_open FROM stats WHERE platform='android'";
    $ios_open = "SELECT COUNT(*) AS ios_open FROM stats WHERE platform='ios'";
    $android_users = "SELECT count(distinct device_id) as android_users FROM stats where platform='android'";
    $ios_users = "SELECT count(distinct device_id) as ios_users FROM stats where platform='ios'";
    $stats = array();
    $result = $link->query($android_open);
    while ($row = $result->fetch_assoc()) {
        $stats['android_open'] = $row['android_open'];
    }
    $result->free();
    $result = $link->query($ios_open);
    while ($row = $result->fetch_assoc()) {
        $stats['ios_open'] = $row['ios_open'];
    }
    $result->free();
    $result = $link->query($android_users);
    while ($row = $result->fetch_assoc()) {
        $stats['android_users'] = $row['android_users'];
    }
    $result->free();
    $result = $link->query($ios_users);
    while ($row = $result->fetch_assoc()) {
        $stats['ios_users'] = $row['ios_users'];
    }
    $result->free();

    return $stats;
}
