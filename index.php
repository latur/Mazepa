<?php
function fine($msg) { echo json_encode(['e' => $msg]); exit; }

if (@$_POST['install']) {
	$e = __DIR__;
	$src = "$e/@config.example.php";
	$tpl = file_get_contents($src);
	
	// Создание директорий
	exec("mkdir $e/media $e/log/archive $e/log/notes $e/log/reverse $e/cache/pict");

	// Проверка папок на запись
	if (!is_writable("$e/cache")) fine("Директория $e/cache недоступна для записи");
	if (!is_writable("$e/log"))   fine("Директория $e/log недоступна для записи");
	if (!is_writable("$e/media")) fine("Директория $e/media недоступна для записи");

	// Проверка соединения с БД
	$dbname  = @$_POST['dbname'];
	$dbuname = @$_POST['dbuname'];
	$dbpass  = @$_POST['dbpass'];
	try {
		$db = new PDO('mysql:host=localhost;port=3306;dbname=' . $dbname . ';charset=UTF8', $dbuname, $dbpass);
		$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		// Импорт sql
		$go = $db->exec( file_get_contents($e . '/@dump.sql') );
		if ($go !== 0) fine( "Ошибка импорта dump.sql" );
	} catch (PDOException $e) {
		fine( $e->getMessage() );
	}
	
	// # Имя сайта
	$site = strtolower(@$_POST['site']);
	$tpl = str_replace("define('HOST',    '');", "define('HOST',    '$site');", $tpl);
	// # Системные папки
	$tpl = str_replace("define('CACHE',   '');", "define('CACHE',   '$e/cache/');", $tpl);
	$tpl = str_replace("define('LOG',     '');", "define('LOG',     '$e/log/');  ", $tpl);
	$tpl = str_replace("define('EXPORTS', '');", "define('EXPORTS', '$e/media'); ", $tpl);
	// # Домен для фотографий
	$tpl = str_replace("define('MEDIA',   '');", "define('MEDIA',   '//$site/media');", $tpl);
	// # База
	$dbpass = str_replace("'", "\\'", $dbpass);
	$tpl = str_replace("define('DB_NAME', '');", "define('DB_NAME', '$dbname');", $tpl);
	$tpl = str_replace("define('DB_USER', '');", "define('DB_USER', '$dbuname');", $tpl);
	$tpl = str_replace("define('DB_PASS', '');", "define('DB_PASS', '$dbpass');", $tpl);
	// # Ключ шифрования
	$key = sha1(mt_rand());
	$tpl = str_replace("define('SECRET',  '');", "define('SECRET',  '$key');", $tpl);
	// # логинпароль
	$login = @$_POST['login'];
	$pwd = sha1( @$_POST['pwd'] );
	$tpl = str_replace("define('USER', '');", "define('USER', '$login');", $tpl);
	$tpl = str_replace("define('PASS', '');", "define('PASS', '$pwd');", $tpl);
	
	$dst = "$e/application/config.php";
	file_put_contents($dst, $tpl);
	if (!file_exists($dst)) fine( "Не удалось записать файл настроек" );
	
	// Если всё прошло гладко, уделяем установочный файл
	exec("mv $e/@index.php $e/index.php");
	exec("rm -f $e/@dump.sql $src");
	fine( "0" );
	exit;
}
?>
<!doctype html>
<html lang="ru">
<head>
	<title>Установка</title>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1">
	<link rel="shortcut icon" href="favicon.ico">
	<link href="static/css/mazepa.css" rel="stylesheet" media="all" />
	<link href="static/css/waves.css" rel="stylesheet" media="all" />	
	<style>
	html { background: #fdfdfd; }
	.res p { display: block; margin-bottom: 20px; border: 1px solid rgba(190,0,0,0.5); padding: 20px 15px; }
	#me { margin-bottom: 10px; }
	.code { font-family: Consolas, "Liberation Mono", Menlo, Courier, monospace; padding: 2px 5px; background: #efefef; border-radius: 3px; }
	p.ok {  border: 1px solid rgba(0,190,0,0.5); }
	</style>
</head>
<body>
	<div id="login" class="">
	<div class="res"></div>
	<h1>Установка системы</h1>
	<h2>Сайт:</h1>
	<div id="site">
		<p><input type="text" name="site" class="form-c" placeholder="sitename.com" /></p>
	</div>
	<h2>База данных:</h1>
	<div id="db">
		<p><input type="text" name="dbname" class="form-c" placeholder="DB Name" /></p>
		<p><input type="text" name="dbuname" class="form-c" placeholder="Username" /></p>
		<p><input type="text" name="dbpass" class="form-c" placeholder="Password" /></p>
	</div>
	<h2>Логин и пароль для входа в веб-интерфейс:</h1>
	<div id="me">
		<p><input type="text" name="login" class="form-c" placeholder="Login" /></p>
		<p><input type="text" name="pwd" class="form-c" placeholder="Password" /></p>
	</div>
	<a class="ok waves-effect waves-button waves-float">Готово</a>
	</div>

<script src="static/js/lib/jquery-2.1.4.min.js"></script>
<script>
$( document ).ready(function() {
	$('[name="site"]').val( location.hostname );
	$('.ok').click(function(){
		var data = { 'install' : true };
		$('p > input').map(function(){
			if ( $(this).attr('name') ) {
				data[ $(this).attr('name') ] = $(this).val();
			}
		});
		$.post('', data, function(res){
			if (res.e != "0") return $('.res').html('<p>' + res.e + '</p>');
			$('.res').html('<p class="ok">Установка прошла успешно!</p>');
			setTimeout(function(){ location.reload() }, 5000);
		}, "json");
	});
});
</script>
</body>
</html>
