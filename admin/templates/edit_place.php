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
				<td class="add-edit-txt">Status</td>
                <td>
					<?php if ($get_place['status'] == "1"): ?>
                       <span class="green upper"> comfirmed</span>
                    <?php elseif($get_place['status'] == "0"): ?>
                       <span class="red upper"> uncomfirmed</span>                    
					<?php elseif($get_place['status'] == "2"): ?>
                       <span class="red upper"> <b>deleted</b></span>
                    <?php endif; ?>
				</td>					
			</tr>
			<tr>
                <td class="add-edit-txt">Date</td>
                <td><?php echo $get_place['date']; ?></td>
            </tr>
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
                <td>
				<textarea class="head-text" name="description" ><?= htmlspecialchars($get_place['description']) ?></textarea>
				</td>
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
                <td>Map</td>
                <td>	
					<div id="google-map" style="height: 250px;width: 450px;"></div>
					<br />
					<a href='https://www.google.com/maps/place/<?= htmlspecialchars($get_place['latitude']) ?>+<?= htmlspecialchars($get_place['longitude']) ?>/@<?= htmlspecialchars($get_place['latitude']) ?>,<?= htmlspecialchars($get_place['longitude']) ?>,18z' target='_blank'>View on google maps</a>
				</td>
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
                <td class="file_loader">
                    <?php if ($get_place['image']): ?>
                        <a href="../uploads/<?= $get_place['id'] ?>.jpg" class="swipebox">
                            <img src="data:image/jpg;base64,<?= $get_place['image'] ?>" alt="" height="150" width="150" style="border-radius:3px;">
                        </a>
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
<script async defer
      src="https://maps.googleapis.com/maps/api/js?key=<?=MAP_API_KEY?>&callback=initMap">
</script>
</body>
</html>