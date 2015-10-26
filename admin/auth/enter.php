<?php
define('VELOPARK', TRUE);
session_start();
require_once '../../config.php';
$link = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if (isset($_SESSION['auth']['admin'])) {
    header("Location: ../");
    exit;
}
$values = array();
if ($_POST) {
    $login = trim($link->real_escape_string($_POST['user']));
    $pass = trim($_POST['pass']);
    $query = "SELECT value FROM options WHERE name='admin_login' OR name='admin_pass'";
    $res = $link->query($query);
    
    while ($row = $res->fetch_assoc()) {
        $values[] = $row;
    }
    $res->free();
    if ($values[1]['value'] == md5($pass) && $values[0]['value']==$login) {
        $_SESSION['auth']['admin'] = htmlspecialchars($values[0]['value']);
        header("Location: ../");
        exit;
    } else {
        $_SESSION['res'] = '<div class="error">Wrong login or password!</div>';
        header("Location: {$_SERVER['PHP_SELF']}");
        exit;
    }
}
?>
<!DOCTYPE html >
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <link rel="stylesheet" type="text/css" href="../templates/style.css" />
        <title>Log In</title>
    </head>
    <body>
        <div class="wrapper">
            <div class="head">
                <a class="logo" href="<?=PATH ?>admin/"></a>
                <p>Enter to admin page</p>
            </div>
            <div class="enter">
<?php

if (isset($_SESSION['res'])) {
    echo $_SESSION['res'];
    unset($_SESSION['res']);
}
?>
                <form method="post" action="">
                    <table border="0" cellspacing="0" cellpadding="0">
                        <tr>
                            <td>Username:</td>
                            <td><input type="text" name="user" /></td>
                        </tr>
                        <tr>
                            <td>Password:</td>
                            <td><input type="password" name="pass" /></td>
                        </tr>
                        <tr>
                            <td>&nbsp;</td>
                            <td><input class="enter-admin" type="submit" value="enter"></td>
                        </tr>
                    </table>      
                </form>
            </div>
        </div>
    </body>
</html>
