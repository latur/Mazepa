<?php
define('HOST',    'mazepa.us');
define('CACHE',   '/www/mazepa.us/cache/');
define('MEDIA',   '//hard.mazepa.us');
define('EXPORTS', '/www/hard.mazepa.us');
define('CONVERT', '/usr/bin/convert ');
define('EXIF',    '/usr/bin/exiftool ');
define('OPTIM',   '/usr/bin/jpegoptim '); // apt-get install jpegoptim
define('DB_NAME', '');
define('DB_USER', '');
define('DB_PASS', '');

spl_autoload_register(function ($class) {
	$core = "application/core/{$class}.php";
	$system = "application/system/{$class}.php";
	include file_exists($core) ? $core : $system;
});
