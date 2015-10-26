<?php defined('VELOPARK') or die('Access denied'); ?>
<div class="content">
    <?php //print_arr($get_page) ?>

    <h2>edit place</h2>
    <?php
    if (isset($_SESSION['edit_place']['res'])) {
        echo $_SESSION['edit_place']['res'];
        unset($_SESSION['edit_place']['res']);
    }
    ?>
    <form action="" method="post">

        <table class="add_edit_page" cellspacing="0" cellpadding="0">
            <tr>
                <td class="add-edit-txt">Name</td>
                <td><input class="head-text" type="text" name="name" value="<?= htmlspecialchars($get_place['name']) ?>" /></td>
            </tr>
            <tr>
                <td class="add-edit-txt">Address</td>
                <td><input class="head-text" type="text" name="address" value="<?= htmlspecialchars($get_place['address']) ?>" /></td>
            </tr>
            <tr>
                <td class="add-edit-txt">Description</td>
                <td><input class="head-text" type="text" name="description" value="<?= htmlspecialchars($get_place['description']) ?>" /></td>
            </tr>
            <tr>
                <td>Latitude</td>
                <td><input class="head-text" type="text" name="latitude" value="<?= htmlspecialchars($get_place['latitude']) ?>" /></td>
            </tr>
            <tr>
                <td>Longitude</td>
                <td><input class="head-text" type="text" name="longitude" value="<?= htmlspecialchars($get_place['longitude']) ?>" /></td>
            </tr>
            <tr>
                <td>Type</td>
                <td>
                    <label>parking&nbsp</label>
                    <input class="add-type" name="type" value="parking" type="radio" <?php if ($get_place['type'] == "parking") echo 'checked="checked"'; ?>/>&nbsp;&nbsp;&nbsp;
                    <label>rent&nbsp</label>
                    <input class="add-type" name="type" value="rent" type="radio" <?php if ($get_place['type'] == "rent") echo 'checked="checked"'; ?>/>&nbsp;&nbsp;&nbsp;
                    <label>shop&nbsp</label>
                    <input class="add-type" name="type" value="shop" type="radio" <?php if ($get_place['type'] == "shop") echo 'checked="checked"'; ?>/>&nbsp;&nbsp;&nbsp;
                    <label>part&nbsp</label>
                    <input class="add-type" name="type" value="parts" type="radio" <?php if ($get_place['type'] == "parts") echo 'checked="checked"'; ?>/>&nbsp;&nbsp;&nbsp;
                </td>
            </tr>
            <tr>
                <td>
                    <?php if ($get_place['image']): ?>
                        <img src="../uploads/<?= $get_place['id'] ?>.jpg" alt="" height="150" width="150" style="border-radius:3px;">
                    <?php else: ?>
                        <img src = "templates/images/no_image.jpg" style="height: 150px; width:150px; border-radius: 3px">
                    <?php endif; ?>

                </td>
                <td><div id="upload-image">change image</div></td>
            </tr>
        </table>

        <input class="save" type="submit" value="save"> 

    </form>

</div> 
</div> 
</div> 
</body>
</html>