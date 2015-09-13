<?php
$I = @$data['g'] ? $data['g'] : @$data['media'];
$M = $data['media'];

$pict = "/pict/{$I['owner']}x.jpg";
if (file_exists(CACHE . $pict)) {
	$pict = '<img src="//'.HOST.'/cache'.$pict.'" />';
} else {
	$pict = '';
}

$username = HOST . "/";
$tooltip = $this->user['level'] > 0 ? 'Добавить в закладки' : 'В закладки (Необходимо войти)';
?>
<div id="p" class="gradient media">
	<div class="cascade">
    	<a class="profile" href="//<?=$username?>"><span class="avatar inset"><?=$pict?></span></a> 
		<a class="pane animate" href="//<?=$username?>"><span class="name"><?=$I['author']?></span></a> 
		<? if ($data['g']){ ?>
		<span class="icon icon-right-open-big"></span> 
		<a class="pane animate pgtitle" href="/"><?=@$I['title']?></a> 
		<? } ?>
		<? if (@$M['title']){ ?>
		<span class="icon icon-right-open-big"></span> 
		<a class="pane animate pmtitle" href="/"><?=$M['title']?></a> 
		<? } ?>
	</div>
</div>
