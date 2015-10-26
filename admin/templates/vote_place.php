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
                <td><?= $get_place['name'] ?></td>
            </tr>
            <tr>
                <td><?= $get_place['address'] ?></td>
            </tr>
            <tr>
                <td><?= $get_place['description'] ?></td>
            </tr>
            <tr>
                <td>
                    <?php if ($get_place['image']): ?>
                        <img src="../uploads/<?= $get_place['id'] ?>.jpg" alt="" height="150" width="150" style="border-radius:3px;">
                    <?php else: ?>
                        <img src = "templates/images/no_image.jpg" style="height: 150px; width:150px; border-radius: 3px">
                    <?php endif; ?>

                </td>
            </tr>
            <tr>
                <td>
                    <label>confirm&nbsp;</label>
                    <input class="add-type" name="vote" value="yes" type="radio" checked="checked"/><br><br>
                    <label>refuse&nbsp;</label>
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
