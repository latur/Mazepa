<?php

// Медиатека: панель управления
$route->Add("GET", "/root", function($e){
	$app = new Init();
	if ($app->user['level'] < 2) {
		header("Location: /");
		exit;
	}
	$app->View('root', ['panel' => true ]);
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
});


// Статистика
$route->Add("GET", "/stats", function($e){
	$app = new Stats();
	if ($app->user['level'] < 2) return Init::Error(405);
	$app->View('stats', [
		'names' => $app->Names(),
		'panel' => true 
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
	$owner = $app->UserInfo(1);
	if (!$owner) Init::Error(404);
	$app->View('user', [
		'owner'  => $owner,
		'albums' => $app->ProfileAlbums($owner['id'])
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
	if ($app->user['level'] == 2) {
		header("Location: /root");
		exit;
	}
	header("Location: /");
});
$route->Add("POST", "/login/?(.*)", function($e){
	$app = new Login();
	header("Location: /login");
});

// Альбом, Изображение
$route->Add("GET", "/albums/([0-9a-z]{1,16})\.?([0-9a-z]{0,13})?/?([0-9]{1,16})?", function($e){
	$app = new Media();
	$app->Album($e);
});

$route->Run();

exit;
