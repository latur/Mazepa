<?php
define('HOST',    'mazepa.us');
define('MEDIA',   '//hard.mazepa.us');
define('CACHE',   '/www/mazepa.us/cache/');
define('EXPORTS', '/www/hard.mazepa.us');
define('CONVERT', '/usr/bin/convert ');
define('EXIF',    '/usr/bin/exiftool ');
define('OPTIM',   '/usr/bin/jpegoptim ');

// DATABASE
define('DB_NAME', '');
define('DB_USER', '');
define('DB_PASS', '');

// OAUTH
define('URLOAUTH', 'https://mazepa.us/login/oauth?type=');
// ВКОНТАКТЕ
define('vkID', ''); // ID приложения
define('vkCD', ''); // Kлюч приложения
// FACEBOOK
define('fbID', ''); // ID приложения
define('fbCD', ''); // Kлюч приложения
// GOOGLE+
define('gpID', ''); // ID приложения
define('gpCD', ''); // Kлюч приложения

spl_autoload_register(function ($class) {
	$core = "application/core/{$class}.php";
	$system = "application/system/{$class}.php";
	include file_exists($core) ? $core : $system;
});
