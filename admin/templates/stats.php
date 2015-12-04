<?php defined('VELOPARK') or die('Access denied'); ?>
<div class="content">    

    <h2 >statistics</h2>	
	</br>
	<h4 class="green">By platform</h4>
	</br>
	<table class="tabl" cellspacing="1">
        <tr>
			<th class="str_action">№</th>
            <th class="str_action">Platform</th>
            <th class="str_action">Total launch</th>
            <th class="str_name">Users</th>
        </tr>
		<?php $i=1; ?>
		<?php foreach ($stats['by_platform'] as $row): ?>
            <tr>
                <td><?= $i++; ?></td>
                <td><?=strtoupper ($row['platform'])?></td>
                <td><?=$row['opens']?></td>
                 <td><?=$row['users']?></td>
            </tr>

        <?php endforeach; ?>      
    </table>
	</br></br>
	<h4 class="green">By added places</h4>
	</br>
	<table class="tabl" cellspacing="1">
        <tr>
			<th class="str_action">№</th>
            <th class="str_action">Device ID</th>
            <th class="str_action">Added places</th>
        </tr>
		<?php $i=1; ?>
		<?php foreach ($stats['by_place_add'] as $row): ?>
            <tr>
                <td><?= $i++; ?></td>
                <td><?=strtoupper ($row['device_id'])?></td>
                <td><?=$row['place_add']?></td>
            </tr>

        <?php endforeach; ?>      
    </table>

	</br></br>
	<h4 class="green">By model</h4>
	<br />	
		<table class="tabl" cellspacing="1">
        <tr>
			<th class="str_action">№</th>
            <th class="str_action">Model</th>
            <th class="str_action">Total launch</th>
            <th class="str_name">Users</th>
        </tr>
		<?php $i=1; ?>
		<?php foreach ($stats['by_model'] as $row): ?>
            <tr>
                <td><?= $i++; ?></td>
                <td><a class='blue' target='_blank' href="https://www.google.com/search?tbm=isch&q=<?=$row['model']?>"><?=$row['model']?></a></td>
                <td><?=$row['opens']?></td>
                 <td><?=$row['users']?></td>
            </tr>

        <?php endforeach; ?>      
    </table>

</div> 
</div> 
</div> 
</body>
</html>