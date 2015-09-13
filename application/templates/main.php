<!doctype html>
<html class="fsvs" lang="ru">
<head>
	<title><?=(@$data['title'] ? ( implode(' ∞ ', $data['title']) . ' ∞ ') : "")?>Мазепа</title>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1">
	<link rel="shortcut icon" href="/favicon.ico">
	<style><?=file_get_contents("cache/@style.css")?></style>
</head>
<body>
	<div id="main" class="">
		<? if (@$data['media'] || @$data['g']) include "application/templates/include/media.panel.php"; ?>
		<? if (@$data['panel']) include "application/templates/include/panel.php"; ?>
		<? include "application/templates/pages/{$content}.php"; ?>
	</div>
	
	<div id="footer">
		<span>Mazepa</span><span><a href="https://github.com/latur">Igor V.</a></span><span><a href="//<?=HOST?>/login">Медиатека</a></span>
	</div>

	<? if ($this->user['level'] > 0){ ?>
	<div class="template" id="noteBlock">
		<div class="note animate" id="{id}">
			<p>{text}</p>
			<span class="control">
			<a class="waves-effect waves-button waves-float mini cancel">Отменить действие</a>
			<a class="waves-effect waves-button waves-float mini hide">Скрыть</a>
			</span>
		</div>
	</div>
	<? } ?>
	<script>var host = '<?=HOST?>', hard = '<?=MEDIA?>', token = '<?=@Ego::AddToken()?>', level = <?=(int)$this->user['level']?>;</script>
	<script async src="/<?=$contentjs?>"></script>
</body>
</html>
