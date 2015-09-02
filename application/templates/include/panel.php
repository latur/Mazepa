<div id="p" class="gradient">
	<a class="pane animate logo <?=($uri == '/' ? 'current' : '')?>" href="//<?=HOST?>"><span class="icon icon-fire"></span> Мазепа</a> 
	<? if($this->user['level'] > 1){ ?>
	<a class="pane animate <?=($uri == '/root' ? 'current' : '')?>" href="//<?=HOST?>/root">Медиатека</a>
	<a class="pane animate <?=($uri == '/'.$this->user['username'] ? 'current' : '')?>" href="/<?=$this->user['username']?>">Профиль</a>
	<a class="pane animate <?=($uri == '/stats' ? 'current' : '')?>" href="//<?=HOST?>/stats">Статистика</a>
	<? } ?>
	<? if($this->user['level'] == 1){ ?>
	<a class="pane animate <?=($uri == '/login/invite' ? 'current' : '')?>" href="//<?=HOST?>/login/invite">Приглашение</a> 
	<? } ?>
	<? if($this->user['level'] <= 0){ ?>
	<a class="pane animate <?=($uri == '/about' ? 'current' : '')?>" href="//<?=HOST?>/about">О сайте</a> 
	<? } ?>
	<? if($this->user['level'] > 0){ ?>
	<a class="pane animate" href="//<?=HOST?>/login?exit=true">Выход</a> 
	<? } ?>
	<? if($this->user['level'] == 0){ ?>
	<a class="pane animate login">Войти</a> 
	<? } ?>
</div>
