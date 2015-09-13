<?php
/**
 * Автоирзация соцсетью
 * Приходит ID соцсети:
 * - ID уже привязан к аккаунту -> Вход
 * - ID не привязан к аккаунту
 * - - Пользователь авторизован -> привязка ID к этому пользователю 
 * - - Пользователь впервые тут -> создание нового пользователя
 */

class Login extends Init {
	
	function __construct() {
		parent::__construct();
		if (@$_GET['exit']) {
			$this->Rewrite(false);
		}
		if (@$_GET['code']) {
			$this->OAuth(Social::Init());
		}
		if (@$_POST['pwd']) {
			$this->LoginAuth();
		}
	}

	public function OAuth($info) {
		if (!is_array($info)) die('<pre>Не вышло');

		// Аккаунт уже привязан к кому-то в системе?
		$exist = $this->db->query("select `mazepa_userinfo`.`id`, `mazepa_userinfo`.`level`, `mazepa_userinfo`.`username`, 
			`mazepa_social`.`sid` from `mazepa_social` 
			left join `mazepa_userinfo` on `mazepa_userinfo`.`id` = `mazepa_social`.`owner` 
			where `mazepa_social`.`sid` = '{$info[':sid']}' limit 1");
		$user = @$exist->fetchAll(PDO::FETCH_ASSOC)[0];

		// Авторизация. Пользователь найден
		if(@$user['sid']){
			// Пользователь низким уровнем допуска
			if ((int) @$user['level'] < $this->user['level']) {
				$this->db->query("update `mazepa_social` set `owner` = '{$this->user['id']}' where `sid` = '{$user['sid']}'");
			} else {
				$this->db->query("delete from `mazepa_userinfo` where `id` = '{$this->user['id']}' and `level` = '0'");
				$this->db->query("delete from `mazepa_session` where `uid` = '{$this->user['id']}'");
				$this->user = $user;
				$this->Rewrite();
			}
		}

		// При авторизации: если входящий тут впервые
		if($this->user['level'] == 0) $this->AddGuest( $info[':name'] );
		
		// Внесение данных соцсети:
		$info[':owner'] = $this->user['id'];
		$this->InsertSocial([$info]);
		
		// Обновлние аватарки:
		file_put_contents(CACHE . "{$this->user['id']}x.jpg", file_get_contents($info[':picture']));
		file_put_contents(CACHE . "{$this->user['id']}w.jpg", file_get_contents($info[':image']));
		
		// Обновление списка друзей
		$type = substr($info[':sid'], 0, 2);
		$suid = substr($info[':sid'], 2);
		$friends = Social::Friends($suid, $info[':token'], $type);
		$this->InsertSocial($friends, $this->user['id']);

		echo '<script>location.hash = "success";</script>';
		exit;
	}
	
	private function InsertSocial($list, $friendOf = false) {
		$default = [':sid' => '', ':owner' => '', ':token' => '', ':name' => '', ':image' => '', ':picture' => '', ':date' => ''];
		$this->db->beginTransaction();
		foreach ($list as $data) {
			$update = '';
			if (@$data[':token']) $update = '`token` = :token, `date` = :date, `owner` = :owner, ';
			$e = $this->db->prepare("insert into `mazepa_social` (`sid`, `owner`, `token`, `name`, `image`, `picture`, `date`) 
				values (:sid, :owner, :token, :name, :image, :picture, :date) 
				on duplicate key update {$update} `name` = :name, `image` = :image, `picture` = :picture");
			$e->execute(array_merge($default, $data));
			// + Добавить в друзья
			if ($friendOf) {
				$e = $this->db->prepare("insert into `mazepa_friends` (`sid` , `uid`)
					select * from (select :sid, :uid) as tmp 
					where not exists ( 
						select `sid` from `mazepa_friends` where `sid` = :sid and `uid` = :uid
					) limit 1");
				$e->execute([':sid' => $data[':sid'], ':uid' => $friendOf]);
			}
		}
		$this->db->commit();
	}
	
	/*
	 * Вход по логину и паролю 
	 */
	private function LoginAuth() {
		if ($this->user['level'] > 0) return true;
		if ( @$_POST['login'] === USER && sha1(@$_POST['pwd']) === PASS ) {
			$this->user = ['id' => 1];
			$this->Rewrite();
			header("Location: /root");
			exit;
		}
		return false;
	}
	

	private function AddGuest($name = ''){
		$ip    = ip2long( Ego::IP() );
		$date  = date('Y-m-d H:i:s');
		$agent = htmlspecialchars(@$_SERVER['HTTP_USER_AGENT']);
		$key   = sha1( openssl_random_pseudo_bytes() );
		
		if(stristr($agent, 'bot')) return false;

		$e = $this->db->prepare("insert into `mazepa_userinfo` (`name`, `level`, `ip`, `agent`, `date`) values (?, ?, ?, ?, ?)");
		$e->execute([$name, 1, $ip, $agent, $date]);
		$this->user = ['id' => $this->db->lastInsertId()];
		$this->Rewrite();
	}
}
