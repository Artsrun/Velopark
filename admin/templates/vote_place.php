<?php defined('VELOPARK') or die('Access denied'); ?>
<div class="content">
    <h2>vote</h2>
    <?php
    if (isset($_SESSION['vote_place']['res'])) {
        echo $_SESSION['vote_place']['res'];
        unset($_SESSION['vote_place']['res']);
    }
    ?>
    <form action="" method="post">

        <table class="add_edit_page" cellspacing="0" cellpadding="0">
			<tr>				
                <td><b>Status</b> - 
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
                <td><b>Date</b> - <?php echo $get_place['date']; ?></td>
            </tr>
            <tr>
                <td><b>Name</b> - <?= $get_place['name'] ?></td>
            </tr>
            <tr>
                <td><b>Address</b> - <?= $get_place['address'] ?></td>
            </tr>
            <tr>
                <td><b>Description</b> - <?= $get_place['description'] ?></td>
            </tr>
			<tr>
                <td><b>Latitude</b> - <?= htmlspecialchars($get_place['latitude']) ?></td>                
            </tr>
            <tr>
                <td><b>Longitude</b> - <?= htmlspecialchars($get_place['longitude']) ?></td>                
            </tr>
			<tr>
                <td><img src="https://maps.googleapis.com/maps/api/staticmap?zoom=18&size=450x250&maptype=roadmap&markers=color:green%7Clabel:G%7C<?= htmlspecialchars($get_place['latitude']) ?>,<?= htmlspecialchars($get_place['longitude']) ?>&key=<?=MAP_API_KEY?>" /></td>                
            </tr>
			<tr>
                <td><b>Type</b> - <span class='upper'><?= htmlspecialchars($get_place['type']) ?></span></td>                
            </tr>			
            <tr>
                <td>
                    <?php if ($get_place['image']): ?>
                        <a href="../uploads/<?= $get_place['id'] ?>.jpg" class="swipebox">
							<img src="../uploads/<?= $get_place['id'] ?>.jpg" alt="" height="150" width="150" style="border-radius:3px;">
						</a>
                    <?php else: ?>
                        <img src = "templates/images/no_image.jpg" style="height: 150px; width:150px; border-radius: 3px">
                    <?php endif; ?>

                </td>
            </tr>
            <tr>
                <td>
                    <label class='green'>yes&nbsp;</label>
                    <input class="add-type" name="vote" value="yes" type="radio" checked="checked"/><br><br>
                    <label class='red'>no&nbsp;</label>
                    <input class="add-type" name="vote" value="no" type="radio" /><br><br>
                </td>
            </tr>
        </table>

        <input class="save" type="submit" value="vote" style="width: 80px; cursor: pointer;"> 

    </form>

</div> 
</div> 
</div> 
</body>
</html>
