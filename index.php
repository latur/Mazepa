<?php
require 'application/config.php';

$route = new Route();

// Общие запросы (домен + субдомен)
$route->Add("POST", "/api/([A-z\_]{4,64})", function($e){
	$app = new Media();
	$app->Call(@$e[1]);
});

if ($route->subdomain) {
	include 'application/route.sub.php';
} else {
	if (@$_SERVER['HTTPS'] != 'on') 	{
		header("Location: https://" . HOST);
		exit;
	}
	include 'application/route.local.php';
}
