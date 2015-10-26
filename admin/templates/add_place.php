<?php defined('VELOPARK') or die('Access denied'); ?>
<div class="content">

    <h2>add place</h2>
    <?php
    if (isset($_SESSION['add_place']['res'])) {
        echo $_SESSION['add_place']['res'];
    }
    ?>
    <form action="" method="post">
        <table class="add_edit_page" cellspacing="0" cellpadding="0">
            <tr>
                <td class="add-edit-txt">Name</td>
                <td><input class="head-text" type="text" name="name" value="<?php if(isset($_SESSION['add_place']['name'])) echo $_SESSION['add_place']['name']; ?> " /></td>
            </tr>
            <tr>
                <td class="add-edit-txt">Address</td>
                <td><input class="head-text" type="text" name="address" value="<?php if(isset($_SESSION['add_place']['address'])) echo $_SESSION['add_place']['address']; ?> " /></td>
            </tr>
            <tr>
                <td class="add-edit-txt">Description</td>
                <td><input class="head-text" type="text" name="description" value="<?php if(isset($_SESSION['add_place']['description'])) echo $_SESSION['add_place']['description']; ?> " /></td>
            </tr>
            <tr>
                <td>Latitude</td>
                <td><input class="head-text" type="text" name="latitude" value="<?php if(isset($_SESSION['add_place']['latitude'])) echo $_SESSION['add_place']['latitude']; ?>" /></td>
            </tr>
            <tr>
                <td>Longitude</td>
                <td><input class="head-text" type="text" name="longitude" value="<?php if(isset($_SESSION['add_place']['longitude'])) echo $_SESSION['add_place']['longitude']; ?>" /></td>
            </tr>
            <tr>
                <td>Type</td>
                <td>
                    <label>parking&nbsp</label>
                    <input class="add-type" name="type" value="parking" type="radio" <?php if(!isset($_SESSION['add_place']['type']) || $_SESSION['add_place']['type'] == "parking") echo 'checked="checked"'; ?>/>&nbsp;&nbsp;&nbsp;
                    <label>rent&nbsp</label>
                    <input class="add-type" name="type" value="rent" type="radio" <?php if(isset($_SESSION['add_place']['type']) && $_SESSION['add_place']['type'] == "rent") echo 'checked="checked"'; ?>/>&nbsp;&nbsp;&nbsp;
                    <label>shop&nbsp</label>
                    <input class="add-type" name="type" value="shop" type="radio" <?php if(isset($_SESSION['add_place']['type']) && $_SESSION['add_place']['type'] == "shop") echo 'checked="checked"'; ?> />&nbsp;&nbsp;&nbsp;
                    <label>part&nbsp</label>
                    <input class="add-type" name="type" value="parts" type="radio" <?php if(isset($_SESSION['add_place']['type']) && $_SESSION['add_place']['type'] == "parts") echo 'checked="checked"'; ?> />&nbsp;&nbsp;&nbsp;
                </td>
            </tr>
            <tr>
                <td></td>
                <td><div id="upload-image" class="add-image">add image</div></td>
            </tr>
        </table>

        <input class="save" type="submit" value="save"> 

    </form>
<?php unset($_SESSION['add_place']); ?>
</div> 
</div> 
</div> 
</body>
</html>
