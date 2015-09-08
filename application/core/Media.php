<?php
class Media extends Init {
	/**
	 * Добавить в закладки / убрать из закладок альбом
	 */ 
	public function __Bookmark() {
		$aid = (int) $_POST['aid'];
		$add = (int) $_POST['add'];
		if ($add > 0) {
			$q = "insert into `mazepa_bookmark` (`uid`, `aid`) 
				values ('{$this->user['id']}', '{$aid}')";
		} else {
			$q = "delete from `mazepa_bookmark` 
				where `uid` = '{$this->user['id']}' and `aid` = '{$aid}'";
		}
		$this->db->query($q);
		return [true];
	}
	
	/**
	 * Получить список моих закладок
	 */ 
	public function __MyBookmarks() {
		if ($this->user['level'] == 0) return [];
		$bookmarks = [];
		$e = $this->db->query("select `mazepa_bookmark`.`id` as `bid`, `mazepa_albums`.*, 
			`mazepa_userinfo`.`name` as `author`, `mazepa_userinfo`.`username`
			from `mazepa_bookmark`
			left join `mazepa_albums` on `mazepa_bookmark`.`aid` = `mazepa_albums`.`id`
			left join `mazepa_userinfo` on `mazepa_userinfo`.`id` = `mazepa_albums`.`owner` 
			where `mazepa_bookmark`.`uid` = '{$this->user['id']}' order by `mazepa_bookmark`.`order`");
		foreach ($e->fetchAll(PDO::FETCH_ASSOC) as $album) {
			if ($album['privacy'] > 0 || $album['owner'] == $this->user['id']) $bookmarks[] = $album;
		}
		return $bookmarks;
	}
	
	/**
	 * Сотрировка закладок
	 */ 
	public function __BookmarksSort() {
		$list = @$_POST['list'];
		if (!@is_array($list)) return [];
		
		$this->db->beginTransaction();
		foreach($list as $k => $v) {
			$v = (int) $v;
			if ($v > 0) $this->db->query("update `mazepa_bookmark` set `order` = '{$k}' where `uid` = '{$this->user['id']}' and `id` = '{$v}'");
		}
		$this->db->commit();
		return [];
	}

	/**
	 * Получить список отметок с моим участием
	 */ 
	public function __MyTags() {
		if ($this->user['level'] == 0) return [];
		$sid  = "select `sid` from `mazepa_social` where `mazepa_social`.`owner` = '{$this->user['id']}'";
		$aids = "select `aid` from `mazepa_tags` where `sid` in ($sid) and `active` = 1 and `ignore` = 0";
		$e = $this->db->query("select `mazepa_albums`.*, `mazepa_userinfo`.`name` as `author`, `mazepa_userinfo`.`username` 
			from `mazepa_albums` 
			left join `mazepa_userinfo` on `mazepa_userinfo`.`id` = `mazepa_albums`.`owner` 
			where `mazepa_albums`.`id` in ($aids)");
		$tags = [];
		foreach ($e->fetchAll(PDO::FETCH_ASSOC) as $album) {
			if ($album['privacy'] > 0 || $album['owner'] == $this->user['id']) $tags[] = $album;
		}
		return $tags;
	}
	
	/**
	 * Удалить отметку со мной
	 */ 
	public function __TagDelete() {
		$aid = (int) @$_POST['aid'];
		// Найти и пометить неактивными все мои отметки по привязанным соцсетям
		$sid  = "select `sid` from `mazepa_social` where `mazepa_social`.`owner` = '{$this->user['id']}'";
		$this->db->query("update `mazepa_tags` set `ignore` = 1 where `aid` = '{$aid}' and `sid` in ($sid)");
		return [$aid];
	}

	/**
	 * Получить список последних публикаций (главная страница)
	 * Возвращает список альбомов с обложкой и цветами картинок
	 */ 
	public function __PublicEvents($count = false) {
		$last  = (int) @$_POST['last'];
		$where = $last > 0 ? "where `mazepa_public`.`id` < $last" : "";
		$count = $count ? $count : (int) @$_POST['count'];
		if ($count == 0) $count = 5;
		
		// События
		$e = $this->db->query("select `mazepa_public`.`id`, 
			/* Альбом */ `mazepa_albums`.`id` as `aid`, `mazepa_albums`.`title`, `mazepa_albums`.`desc`, `mazepa_albums`.`secret`,
			/* Автор */ `mazepa_userinfo`.`id` as `uid`, `mazepa_userinfo`.`name`, `mazepa_userinfo`.`username`
			from `mazepa_public`
			left join `mazepa_albums` on `mazepa_albums`.`id` = `mazepa_public`.`alb` 
			left join `mazepa_userinfo` on `mazepa_userinfo`.`id` = `mazepa_public`.`owner` 
			{$where} order by `mazepa_public`.`id` desc limit {$count}");
		$events = $e->fetchAll(PDO::FETCH_ASSOC);
		if ($events == []) return [];
		
		// Привязка фотографий
		$aids = array_map(function($e){ return $e['aid']; }, $events);
		$aids = implode(',', $aids);
		$e = $this->db->query("select `album`,`id`,`color`,`src_mini` from `mazepa_media` where `album` in ({$aids}) order by `order`");
		$colors = [];
		$covers = [];
		foreach ($e->fetchAll(PDO::FETCH_ASSOC) as $img) {
			$aid = $img['album'];
			if (!@$covers[$aid]) $covers[$aid] = $img['src_mini'];
			if (!@$colors[$aid]) $colors[$aid] = [];
			$colors[$aid][] = [$img['id'], $img['color']];
		}
		
		return [
			'events' => $events,
			'colors' => $colors,
			'covers' => $covers,
		];
	}

	/**
	 * Получить альбом со всеми фотографиями
	 */ 
	public function GetAlbum($url = false, $id = false, $secret = '') {
		$aid = $id ? (int) $id : (int) base_convert(@$url, 32, 10);
		if ($aid <= 0) return Init::Error(404);

		// Информация альбома:
		$q = $this->db->query("select `mazepa_albums`.*, `mazepa_userinfo`.`name` as `author`, `mazepa_userinfo`.`username` from `mazepa_albums` 
			left join `mazepa_userinfo` on `mazepa_userinfo`.`id` = `mazepa_albums`.`owner` where `mazepa_albums`.`id` = '{$aid}' limit 1");
		$info = $q->fetch(PDO::FETCH_ASSOC);
		if (!$info) return Init::Error(404);

		// Проверка приватности: ( Приват / По ссылке / Публична — 0/1/2  )
		if ($info['owner'] != $this->user['id']) {
			if ($info['privacy'] == 0) return Init::Error(405);
			if ($info['privacy'] == 1 && $info['secret'] != $secret) return Init::Error(405);
		}
		
		// Фотографии альбома
		$q = $this->db->query("select * from `mazepa_media` 
			where `album` = '{$aid}' order by `order`");
		$info['images'] = $q->fetchAll(PDO::FETCH_ASSOC);
		
		// Альбом в закладках?
		if ($this->user['level'] > 0) {
			$q = $this->db->query("select `id` from `mazepa_bookmark` where `aid` = '{$aid}' and `uid` = '{$this->user['id']}' limit 1");
			$bookmark = $q->fetch();
			if ($bookmark) $info['bookmark'] = true;
		}
		
		return $info;
	}

	/**
	 * Получить информацию о галерее
	 */ 
	public function GetGalleryInfo($url) {
		$url = $this->IsName($url);
		if (!$url) return Init::Error(404);

		// Информация о галерее
		$q = $this->db->query("select `mazepa_gallery`.*, `mazepa_userinfo`.`name` as `author`, `mazepa_userinfo`.`username` 
			from `mazepa_gallery` 
			left join `mazepa_userinfo` on `mazepa_userinfo`.`id` = `mazepa_gallery`.`owner` 
			where `mazepa_gallery`.`url` = '{$url}'");
		$gall = $q->fetch(PDO::FETCH_ASSOC);

		if(!$gall) Init::Error(404);
		if($gall['privacy'] == 0 && $gall['owner'] != $this->user['id']) Init::Error(405);
		$this->gallery = $gall;
		
		return true;
	}

	/**
	 * Получить обложки заданных альбомов
	 */ 
	public function Covers($array = []){
		if ($array == []) return [];
		
		// Список альбомов
		$map = implode(', ', array_unique(array_map(function($a){
			return $a['id'];
		}, $array)));
		
		// Обложки альбомов
		$q = $this->db->query("select * from 
			(select `src_small`,`src_thumb`,`src_xthumb`,`src_main`,`album` 
				from `mazepa_media` where `album` in ({$map}) order by `mazepa_media`.`order`) `e`
			group by `e`.`album`");

		$covers = $q->fetchAll(PDO::FETCH_ASSOC);

		// Ассоциативный массив: Альбом->Обложка
		$keys = array_map(function($a){
			return $a['album'];
		}, $covers);

		$values = array_map(function($a){
			unset($a['album']); 
			return $a;
		}, $covers);
		
		$covers = array_combine($keys, $values);

		foreach ($array as $k => $album) {
			$array[$k]['cover'] = $covers[$album['id']];
		}

		return $array;
	}

	/**
	 * Список открытых альбомов конкретного пользователя
	 */ 
	public function ProfileAlbums($id = false){
		$q = $this->db->query("select * from `mazepa_albums` 
			where `owner` = '{$id}' and `privacy` >= 3 order by `order` asc");
		$albums = $q->fetchAll(PDO::FETCH_ASSOC);
		if(!is_array($albums) || count($albums) == 0) return [];

		return $this->Covers( $albums );
	}

	/**
	 * Список альбомов в галерее
	 */ 
	public function GalleryAlbums($id = false) {
		if (!$id) $id = $this->gallery['id'];
		// Список альбомов
		$q = $this->db->query("select `mazepa_albums`.`id`, `mazepa_albums`.`title`, `mazepa_albums`.`desc`, `mazepa_albums`.`secret` 
			from `mazepa_albums` 
			left join `mazepa_alb_gal` on `mazepa_albums`.`id` = `mazepa_alb_gal`.`aid` 
			where `mazepa_alb_gal`.`gid` = '{$id}' and (`mazepa_albums`.`owner` = '{$this->user['id']}' or `mazepa_albums`.`privacy` != 0) 
			order by `mazepa_alb_gal`.`order` desc");
		$albums = $this->Covers( $q->fetchAll(PDO::FETCH_ASSOC) );
		return $albums;
	}

	/**
	 * Публичная инфомация о пользователе по логину
	 */ 
	public function UserInfo($key){
		$str = $this->IsName($key);
		$uid   = (int) $key;
		if ($str) {
			$tab = "`mazepa_userinfo`.`username`";
		} elseif ($uid > 0) {
			$tab = "`mazepa_userinfo`.`id`";
			$str = $uid;
		} else {
			return false;
		}

		$q = $this->db->prepare("select * from `mazepa_userinfo` 
			where {$tab} = ?");
		$q->execute([$str]);
		$userinfo = $q->fetchAll(PDO::FETCH_ASSOC);

		if(count($userinfo) != 1) return false;
		
		$userinfo[0]['name'] = ($userinfo[0]['name'] == '') ? ('#' . $userinfo[0]['username']) : $userinfo[0]['name'];
		$userinfo[0]['image'] = HOST . "/cache/{$userinfo[0]['id']}w.jpg";
		return $userinfo[0];
	}

	/**
	 * Страница: Альбом, Фотография
	 */ 
	public function Album($e) {
		$album = $this->GetAlbum($e[1], false, $e[2]);
		$this->View('album', [
			'title' => [$album['title'], $album['author']],
			'media' => $album,
			'g'     => @$this->gallery ? $this->gallery : false
		]);
	}

	/**
	 * Страница: Галерея
	 */ 
	public function Gallery() {
		$this->View('gallery', [
			'title' => [$this->gallery['title'], $this->gallery['author']],
			'media' => $this->GalleryAlbums(),
			'g'     => $this->gallery
		]);
	}

}