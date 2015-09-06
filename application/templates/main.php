<!doctype html>
<html class="fsvs" lang="ru">
<head>
	<title><?=(@$data['title'] ? ( implode(' ∞ ', $data['title']) . ' ∞ ') : "")?>Мазепа</title>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1">
	<link rel="shortcut icon" href="/favicon.ico">
	<link href="/cache/@style.css" rel="stylesheet" type="text/css">
	<script src="/static/js/lib/jquery-2.1.4.min.js"></script>
</head>
<body>
	<div id="main" class="">
		<? $panel = @$data['media'] || @$data['g'] ? 'media.panel' : 'panel'; ?>
		<? include "application/templates/include/{$panel}.php"; ?>
		<? include "application/templates/pages/{$content}.php"; ?>
	</div>
	
	<div id="footer">
		<span>Игорь Вячеславович</span><span><a href="mailto:admin@masepa.us">связь</a></span><span><a href="//<?=HOST?>/about">о сайте</a></span>
	</div>

	<? if ($this->user['level'] == 0){ ?>
	<div class="template" id="loginModal">
		<div id="buttons">
			<h4>Войти с помощью</h4>
			<div class="list">
				<div class="ss">
					<a class="waves-effect waves-button waves-float" data-id="vk"><span class="icon icon-vkontakte-rect" ></span> ВКонтакте</a>
					<a class="waves-effect waves-button waves-float" data-id="fb"><span class="icon icon-facebook-rect"  ></span> Facebook</a>
					<a class="waves-effect waves-button waves-float" data-id="gp"><span class="icon icon-googleplus-rect"></span> Google+</a>
				</div>
			</div>
		</div>
	</div>
	<? } else { ?>
	<div class="template" id="noteBlock">
		<div class="note animate" id="{id}">
			<p>{text}</p>
			<a class="waves-effect waves-button waves-float mini cancel">Отменить</a>
			<a class="waves-effect waves-button waves-float mini hide">Скрыть</a>
		</div>
	</div>
	<? } ?>
	<script>var host = '<?=HOST?>', hard = '<?=MEDIA?>', token = '<?=@Ego::AddToken()?>', level = <?=(int)$this->user['level']?>;</script>
	<script src="/<?=$contentjs?>"></script>
</body>
</html>
