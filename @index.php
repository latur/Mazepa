<?php
require 'application/config.php';

$route = new Route();

// Общие запросы (домен + субдомен)
$route->Add("POST", "/api/([A-z\_]{4,64})", function($e){
	$app = new Media();
	$app->Call(@$e[1]);
});

include $route->subdomain ? 'application/route.sub.php' : 'application/route.local.php';
