<?php

// Медиатека: панель управления
$route->Add("GET", "/root", function($e){
	$app = new Init();
	if ($app->user['level'] < 2) Init::Error(405);
	$app->View('root');
});

// Медиатека: действия
$route->Add("POST", "/root/library/([A-z\_]{4,64})", function($e){
	$app = new Library();
	if ($app->user['level'] < 2) return false;
	$app->Call(@$e[1]);
});

// Медиатека: загрузка изображений
$route->Add("POST", "/upload", function($e){
	$app = new FileUpload();

	// Загрузка изображения в медиатеку
	if(is_array(@$_FILES['invite']) && @$_FILES['invite']['error'] == 0){
		$hash = Invite::HashFile(@$_FILES['invite']['tmp_name']);
		echo $app->InviteExist($hash) ? '0' : '1';
		exit;
	}

	if ($app->user['level'] < 2) return false;

	// Загрузка изображения в медиатеку
	if (is_array(@$_FILES['files']) && @$_FILES['files']['error'] == 0) {
		return $app->Image($_FILES['files']);
	}
	// Загрузка картинки для профиля
	if (is_array(@$_FILES['cover']) && @$_FILES['cover']['error'] == 0) {
		return $app->Cover($_FILES['cover']);
	}
	Init::Error(404);
});


// Статистика
$route->Add("GET", "/stats", function($e){
	$app = new Stats();
	if ($app->user['level'] < 2) return Init::Error(405);
	$app->View('stats', [
		'names' => $app->Names()
	]);
});

// Статистика > Экспорт
$route->Add("GET", "/stats/export/(.+)", function($e){
	$app = new Stats();
	$app->Export(@$e[1]);
});

// Статистика: запросы
$route->Add("POST", "/stats/([A-z\_]{4,64})", function($e){
	$app = new Stats();
	if ($app->user['level'] < 2) return Init::Error(405);
	$app->Call(@$e[1]);
});


// Главная страница: лента новостей
$route->Add("GET", "/", function($e){
	$app = new Media();
	$app->View('index', [
		'events' => $app->__PublicEvents(),
		'bookmarks' => $app->__MyBookmarks(),
		'tags' => $app->__MyTags()
	]);
});


// О сайте
$route->Add("GET", "/about", function($e){
	$app = new Init();
	// css: about
	$app->View('about');
});


// Вход-Выход
$route->Add("GET", "/login/?(.*)", function($e){
	$app = new Login();
	if ($app->user['level'] == 0) $app->View('login');
	if ($app->user['level'] == 1) $app->View('invite');
	header("Location: /");
});


// Альбом, Изображение
$route->Add("GET", "/albums/([0-9a-z]{1,16})\.?([0-9a-z]{0,13})?/?([0-9]{1,16})?", function($e){
	$app = new Media();
	$app->Album($e);
});

// Персональная страница
$route->Add("GET", "/([A-z][A-z0-9]{2,256})", function($e){
	$app = new Media();
	$owner = $app->UserInfo(@$e[1]);
	if (!$owner) Init::Error(404);
	$app->View('user', [
		'owner'  => $owner,
		'albums' => $app->ProfileAlbums($owner['id'])
	]);
});

$route->Run();

exit;
