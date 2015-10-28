<?php defined('VELOPARK') or die('Access denied'); ?>
<div class="content">
    <h2>Places</h2>
    <?php
    if (isset($_SESSION['answer'])) {
        echo $_SESSION['answer'];
        unset($_SESSION['answer']);
    }
    ?>
    <a href="?view=add_place" class="add">add place</a>
    <table class="tabl" cellspacing="1">
        <tr>
            <th class="str_action">№</th>
            <th class="str_action">Image</th>
            <th class="str_name">Name</th>
            <th class="str_name">Address</th>
            <th class="str_name">Description</th>
            <th class="str_sort">Latitude</th>
            <th class="str_action">Longitude</th>
            <th class="str_action">Type</th>
            <th class="str_action">Status</th>
            <th class="str_action">Votes</th>
            <th class="str_action">Action</th>

        </tr>
        <?php $i = ($page-1)*$perpage+1; ?>
        <?php foreach ($places as $item): ?>
            <tr>
                <td><?= $i ?></td>
                <td>
                    <?php if ($item['image']): ?>
                        <img src = "data:image/jpg;base64,<?= $item['image'] ?>" style="height: 150px; width:150px; border-radius: 3px">
                    <?php else: ?>
                        <img src = "templates/images/no_image.jpg" style="height: 150px; width:150px; border-radius: 3px">
                    <?php endif; ?>
                </td>
                <td><?= $item['name'] ?></td>
                <td><?= $item['address'] ?></td>
                <td><?= $item['description'] ?></td>
                <td><?= $item['latitude'] ?></td>
                <td><?= $item['longitude'] ?></td>
                <td><?= $item['type'] ?></td>
                <td>
                <?php if ($item['status'] == "1"): ?>
                        comfirmed
                    <?php elseif($item['status'] == "0"): ?>
                        uncomfirmed
                    <?php endif; ?>
                </td>
                <td>Yes -  <?= $item['votes_yes'] ?><br>No -  <?= $item['votes_no'] ?>
                    <?php if($item['votes_yes'] + $item['votes_no']!=0): ?>
                    <br>% -  <?= round($item['votes_yes']*100/+($item['votes_yes'] + $item['votes_no']),2) ?> 
                    <?php endif; ?>
                </td>
                <td>
					<a href="?view=edit_place&amp;place_id=<?= $item['id'] ?>" class="edit">edit</a><br>
					<a href="?view=delete_place&amp;place_id=<?= $item['id'] ?>" class="del" onclick="return confirm('are you sure?');">delete</a><br>
					<a href="?view=vote_place&amp;place_id=<?= $item['id'] ?>" class="vote">vote</a>
					<a href="?view=confirm_place&amp;place_id=<?= $item['id'] ?>" class="vote">confirm</a>
				</td>
            </tr>
            <?php $i++; ?>
        <?php endforeach; ?>      
    </table>
    <?php if($pages_count > 1) pagination($page, $pages_count); ?>
    <a href="?view=add_place" class="add">add place</a>

</div> 
</div> 
</div> 
</body>
</html>