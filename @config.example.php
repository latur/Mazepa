<?php
define('HOST',    ''); // Имя сайта (без протокола)
define('CACHE',   ''); // Папка для кэширования
define('LOG',     ''); // Пользовательская статистика
define('EXPORTS', ''); // Точка сохранения фотографий
define('MEDIA',   ''); // Домен для фотографий
define('SECRET',  ''); // Ключ шифрования (произвольная строка)

define('CONVERT', '/usr/bin/convert ');   // ImageMagick для создания миниатюр
define('EXIF',    '/usr/bin/exiftool ');  // Чтение EXIF-данных из JPG
define('OPTIM',   '/usr/bin/jpegoptim '); // Оптимизация JPG

// DATABASE
define('DB_NAME', '');
define('DB_USER', '');
define('DB_PASS', '');

// Панель управления
define('USER', ''); // Логин
define('PASS', ''); // sha1('пароль')

// OAUTH. Кому нужно, сам настроит
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
