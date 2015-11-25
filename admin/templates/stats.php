<?php defined('VELOPARK') or die('Access denied'); ?>
<div class="content">    

    <h2 >edit place</h2>	
	</br>
	<h4 class="green">By platform</h4>
	</br>
	<?php foreach($stats['by_platform'] as $row){?>
		<b><?=strtoupper ($row['platform'])?>:</b> Total launch - <b><?=$row['opens']?></b> | Users - <b><?=$row['users']?></b></br>
	<?php } ?>
	</br></br>
	<h4 class="green">By model</h4>
	<br />
	<?php foreach($stats['by_model'] as $row){?>
		<b><?=strtoupper ($row['model'])?>:</b> Total launch - <b><?=$row['opens']?></b> | Users - <b><?=$row['users']?></b></br>
	<?php } ?>

</div> 
</div> 
</div> 
</body>
</html>