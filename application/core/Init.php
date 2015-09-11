<?php
class Init extends PDO {
	function __construct(){
		$this->db = new PDO('mysql:host=localhost;port=3306;dbname=' . DB_NAME . ';charset=UTF8', DB_USER, DB_PASS);
		$this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		$this->user = $this->Auth(@$_COOKIE['i']);
	}
	
	/**
	 * Перезапись сессии текущего пользователя
	 */
	public function Rewrite( $add = true ){
		$key = $add ? sha1( uniqid() ) : '';
		setcookie('i', $key, $add ? (time() + 60*60*24*100) : 0, '/', '.' . HOST);
		$this->db->query("delete from `mazepa_session` where `uid` = '{$this->user['id']}'");
		if ($add) {
			$this->db->query("insert into `mazepa_session` (`uid`, `key`) values ('{$this->user['id']}', '{$key}')");
		} else {
			header("Location: /");
		}
	}

	/**
	 * Загрузка страницы
	 */
	public function View($content = false, $data = []){
		$content = $content ? $content : 'index';
		$uri = @$_SERVER['REQUEST_URI'];
		$contentjs = "cache/@{$content}.js";
		if (!file_exists($contentjs)) $contentjs = "cache/@.js";
		include 'application/templates/main.php';
		exit;
	}

	/**
	 * Запрос метода
	 */
	public function Call($method){
		$method = "__{$method}";
		if (!Ego::CheckToken()) {
			Ego::JsHead(['error' => 'Invalid token']);
			return ;
		}
		if (!method_exists($this, $method)) {
			Ego::JsHead(['error' => 'Method not found']);
			return ;
		}
		Ego::JsHead( Ego::AddToken($this->{$method}()) );
	}

	/**
	 * Валидность логина / url-субдлмена
	 */
	public function IsName($name = ''){
		$name = strtolower($name);
		if(!preg_match('/^[a-z][a-z0-9]{2,256}$/i', $name)) return false;
		if(stristr("|dev|dream|hard|shogi|text|root|admin|ftp|www|system|".
		  "tmp|true|false|etc|albums|static|exe|invited|hello|stats|upload|cache|log|application|css|".
		  "font|img|exit|settings|", "|$name|")) return false;
		return $name;
	}

	/**
	 * Страница ошибки
	 */
	public static function Error($code){
		$title = [
			'404' => 'Здесь ничего нет',
			'405' => 'Доступ запрещён'
		][$code];
		$data = file_get_contents('static/img/stop.jpg');
		include 'application/templates/stop.php';
		exit;
	}

	protected function Auth($key = false){
		if (!$key || strlen(@$key) !== 40) return false;
		$e = $this->db->prepare("select `mazepa_userinfo`.*, `mazepa_social`.`picture` from `mazepa_session` 
			left join `mazepa_userinfo` on `mazepa_userinfo`.`id` = `mazepa_session`.`uid` 
			left join `mazepa_social` on `mazepa_session`.`uid` = `mazepa_social`.`owner` 
			where `mazepa_session`.`key` = ? order by `mazepa_social`.`date` desc limit 1");
		$e->execute([$key]);
		$r = $e->fetch(PDO::FETCH_ASSOC);
		return is_array($r) ? $r : false;
	}
}
