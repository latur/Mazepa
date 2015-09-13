<? if($this->user['level'] > 1){ } ?>

<div id="p" class="gradient">
	<a class="pane animate logo <?=($uri == '/root' ? 'current' : '')?>" href="//<?=HOST?>/root"><span class="icon icon-fire"></span> Медиатека</a> 
	<a class="pane animate <?=($uri == '/stats' ? 'current' : '')?>" href="//<?=HOST?>/stats">Статистика</a>
	<a class="pane animate <?=($uri == '/' ? 'current' : '')?>" href="//<?=HOST?>">К сайту</a>
	<a class="pane animate" href="//<?=HOST?>/login?exit=true">Выход</a> 
</div>
