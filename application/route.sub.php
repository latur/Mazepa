<?php

$app = new Media();
$app->GetGalleryInfo($route->subdomain);

// Альбом, Изображение
$route->Add("GET", "/([0-9a-z]{1,16})\.?([0-9a-z]{1,16})?/?([0-9]{1,16})?", function($e) use ($app){
	$app->Album($e);
});

// Галерея
$route->Add("GET", "/", function($e) use ($app){
	$app->Gallery($e);
});

$route->Run();
