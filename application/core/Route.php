<?php
class Route {
	public $request   = '';
	public $subdomain = false;

	function __construct(){
		$this->request = @$_SERVER['REQUEST_URI'];
		$this->method  = @$_SERVER['REQUEST_METHOD'];
		$this->routes  = array();
		$this->host    = @$_SERVER['HTTP_HOST'];
		if (substr($this->host, 0, strlen("www.")) == "www.") {
			$this->host = substr($this->host, strlen("www."));
		}
		if ($this->host !== HOST) {
			$this->subdomain = substr($this->host, 0, strlen($this->host) - strlen('.' . HOST));
		}
	}

	public function Add($method, $url, $app){
		$this->routes[] = array(
			'method' => $method,
			'url' => $url,
			'app' => $app
		);
	}

	public function Run(){
		foreach ($this->routes as $route){
			$URL = str_replace('/', '\\/', $route['url']);
			if ($this->method == $route['method'] && preg_match("/^$URL$/", $this->request, $e)) {
				$route['app']($e);
				return true;
			}
		}
		return Init::Error(404);
	}
}
