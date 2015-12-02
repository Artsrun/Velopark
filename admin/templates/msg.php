<?php defined('VELOPARK') or die('Access denied'); ?>
<div class="content">    

    <h2 >messages</h2>	
	<?php
    if (isset($_SESSION['msg']['res'])) {
        echo $_SESSION['msg']['res'];
        unset($_SESSION['msg']['res']);
    }
	
    ?>

	<form action="" method="post">
		<table class="add_edit_page" cellspacing="0" cellpadding="0">	
				<tr>
					<td class="add-edit-txt">Deivce ID</td>
					<td><input class="head-text" type="text" name="device_id" value="<?php echo isset($_POST['device_id'])?$_POST['device_id']:''; ?>" /></td>
				</tr>				
				<tr>
					<td class="add-edit-txt">Title</td>
					<td><input class="head-text" type="text" name="title" value="<?php echo isset($_POST['title'])?$_POST['title']:''; ?>" /></td>
				</tr>
				<tr>
					<td class="add-edit-txt">Message</td>					
					<td><textarea class="head-text" name="message" ><?php echo isset($_POST['message'])?$_POST['message']:''; ?></textarea></td>
				</tr>		
			</table>

			<input class="save" type="submit" value="save"> 
	
	</form>
	<br />
	
	<table class="tabl" cellspacing="1">
        <tr>
            <th class="str_action">№</th>
            <th class="str_action">Device ID</th>
            <th class="str_name">Title</th>
            <th class="str_name">Message</th>
			<th class="str_name"></th>
        </tr>
		<?php $i=1; ?>
		<?php foreach ($msg as $single_msg): ?>
            <tr>
                <td><?= $i++; ?></td>
                <td><?= $single_msg['device_id'] ?></td>
                <td><?= $single_msg['title'] ?></td>
                 <td><?= $single_msg['message'] ?></td>
				 <td ><a class='red upper' href='?view=msg&delete=<?= $single_msg['id'] ?>'>DELETE</a></td>
            </tr>

        <?php endforeach; ?>      
    </table>

</div> 
</div> 
</div> 
</body>
</html>