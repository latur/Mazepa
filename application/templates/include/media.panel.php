<?php
$I = @$data['g'] ? $data['g'] : @$data['media'];
$M = $data['media'];
$pict = HOST . "/cache/{$I['owner']}x.jpg";
$username = HOST . "/{$I['username']}";
$tooltip = $this->user['level'] > 0 ? 'Добавить в закладки' : 'В закладки (Необходимо войти)';
?>
<div id="p" class="gradient media">
	<div class="cascade">
    	<a class="profile" href="//<?=$username?>"><span class="avatar inset"><img src="//<?=$pict?>" /></span></a> 
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
	<div class="right">
		<? if (!@$data['g']){ ?>
		<a class="pane animate bookmark simptip-position-left simptip-smooth simptip-fade" data-tooltip="<?=$tooltip?>"><span class="icon icon-bookmark"></span></a>
		<? } ?>
		<a class="pane animate logo" href="//<?=HOST?>"><span class="txt">Мазепа</span> <span class="icon icon-fire"></span></a>
	</div>
</div>
