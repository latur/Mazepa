<?php
class Library extends Init {
	/**
	 * Обновление Кэша
	 */
	public function __Cache(){
		// Картинки профилей:
		exec("rm -f " . CACHE . "*");
		$e = $this->db->query("select `id`,`image`,`picture` from `mazepa_userinfo` 
			left join `mazepa_social` on `mazepa_social`.`owner` = `mazepa_userinfo`.`id`
			where `mazepa_userinfo`.`level` >= 2");
		foreach ($e->fetchAll(PDO::FETCH_ASSOC) as $user) {
			if ($user['picture']) file_put_contents(CACHE . "{$user['id']}x.jpg", file_get_contents($user['picture']));
			if ($user['image'])   file_put_contents(CACHE . "{$user['id']}w.jpg", file_get_contents($user['image']));
		}
		return [];
	}

	/**
	 * Созидание приглашения на мазепу
	 */
	public function __CreateInvite(){
		// Library('CreateInvite', {}, function(e){ console.log(e.src) })
		if ($this->user['id'] != 1) return [];

		$filename = CACHE . 'invite.' . md5(rand()) . '.png';
		$b64image = Invite::Generate($filename);
		$hash     = Invite::HashFile($filename);
		$this->db->query("insert into `mazepa_invite` (`user`, `code`, `src`) values ('{$this->user['id']}', '{$hash}', '{$b64image}')");
		return [ 'src' => $filename ];
	}

	/**
	 * Получение полного списка альбомов и галерей текущего пользователя
	 */
	public function __Media(){
		$albums = $this->db->query("select *, 
			'picture' as `icon`, 'album' as `type` 
			from `mazepa_albums` where `owner` = '{$this->user['id']}' 
			order by `id` desc"); 
		$gallery = $this->db->query("select *, 
			'aperture' as `icon`, 'gall' as `type` 
			from `mazepa_gallery` where `owner` = '{$this->user['id']}' 
			order by `id` desc"); 
		return [
			'albums' => $albums->fetchAll(PDO::FETCH_ASSOC),
			'gallery' => $gallery->fetchAll(PDO::FETCH_ASSOC),
			'note' => $this->Helper()
		];
	}

	/**
	 * Получение списка фотографий в альбоме и списка отметок
	 */
	public function __Images($aid = false){
		$id = (int) ($aid ? $aid : $_POST['aid']);
		if ($id < -1) return false;
		$images = $this->db->query("select * 
			from `mazepa_media` where `owner` = '{$this->user['id']}' and `album` = '{$id}' 
			order by `order`");
		$tags = $this->db->query("select `mazepa_social`.`sid`,`mazepa_social`.`name`,`mazepa_social`.`picture` from `mazepa_social` 
			left join `mazepa_tags` on `mazepa_tags`.`sid` = `mazepa_social`.`sid`
			where `mazepa_tags`.`aid` = '{$id}' and `mazepa_tags`.`active` = 1");
		return [
			'images' => $images->fetchAll(PDO::FETCH_ASSOC),
			'tags'   => $tags->fetchAll(PDO::FETCH_ASSOC)
		];
	}

	/**
	 * Информация о фотографии: EXIF и цвета
	 */
	public function __ImageInfo(){
		$mid  = (int) @$_POST['mid'];
		$exif = $this->db->query("select `mazepa_exifo`.* 
			from `mazepa_media` 
			left join `mazepa_exifo` on `mazepa_media`.`id` = `mazepa_exifo`.`id`
			where `mazepa_media`.`id` = '{$mid}' and `mazepa_media`.`owner` = '{$this->user['id']}' limit 1");
		$colors = $this->db->query("select `color`,`val` 
			from `mazepa_colors` where `media` = '{$mid}' 
			order by `val` desc limit 30");
		return [
			'exif'   => @$exif->fetch(PDO::FETCH_ASSOC),
			'colors' => @$colors->fetchAll(PDO::FETCH_ASSOC)
		];
	}

	/**
	 * Удаление/перемещение фотографий
	 */
	public function __ImagesToAlbum(){
		$aid  = (int) $_POST['to'];
		$imgs = @$_POST['imgs'];
		if ($aid == 0 || !is_array($imgs)) return ['haha' => 1];

		// Список
		$imgs = array_values($imgs);
		foreach($imgs as $k => $v) $imgs[$k] = (int) $v;
		$imgs = implode(', ', $imgs);
		
		// Проверка авторства альбомов (from/to)

		// Откуда перемещаем
		$e = $this->db->query("select `mazepa_media`.`album`,`mazepa_albums`.* from `mazepa_media` 
			left join `mazepa_albums` on `mazepa_albums`.`id` = `mazepa_media`.`album`
			where `mazepa_media`.`owner` = '{$this->user['id']}' and `mazepa_media`.`id` in ({$imgs}) limit 1 ");
		$fromAlb = @$e->fetch(PDO::FETCH_ASSOC);
		if (!$fromAlb) return ['haha' => 2];
		
		if ($fromAlb['album'] == -1) $msg = "Фотографии перемещены из корзины";
		else if ($fromAlb['album'] == 0 ) $msg = "Фотографии перемещены из папки «Импорт»";
		else $msg = "Фотографии перемещены из альбома <b>«{$fromAlb['title']}»</b>";

		// Куда перемещаем: 
		if ($aid == -1 || $aid == 0) {
			$msg = "Фотографии перемещены в корзину";
		} else {
			$e = $this->db->query("select `title` from `mazepa_albums` where `owner` = '{$this->user['id']}' and `id` = '{$aid}' limit 1");
			$toAlb = @$e->fetch(PDO::FETCH_ASSOC);
			if (!$toAlb || !@$toAlb['title']) return ['haha' => 3];
			$msg .= " в альбом <b>«{$toAlb['title']}»</b>.";
		}
		
		// Обратка
		$sql = [ "update `mazepa_media` set `album` = '{$fromAlb['album']}' where `owner` = '{$this->user['id']}' and `id` in ({$imgs})" ];

		// Перемещение
		$this->db->exec("update `mazepa_media` set `album` = '{$aid}' where `owner` = '{$this->user['id']}' and `id` in ({$imgs})");

		return [
			'message' => $msg,
			'reverse' => $this->Reverse($sql)
		];
	}

	/**
	 * Сортировка фотографий
	 */
	public function __ImagesSort(){
		$aid  = (int) @$_POST['aid'];
		$by   = @$_POST['by'];

		if(!$this->IsMy($aid, "mazepa_albums")) return [];

		if($by == 'date'){
			$sql = "select `mazepa_media`.`id` from `mazepa_media` 
				left join `mazepa_exifo` on `mazepa_exifo`.`id` = `mazepa_media`.`id` 
				where `mazepa_media`.`owner` = '{$this->user['id']}' and `mazepa_media`.`album` = '{$aid}' 
				order by `mazepa_exifo`.`Modify Date`, `mazepa_exifo`.`Date/Time Original`";
		}
		if($by == 'name'){
			$sql = "select `id` from `mazepa_media` 
				where `owner` = '{$this->user['id']}' and `album` = '{$aid}' 
				order by `title`, `id`";
		}
		if($by == 'invert'){
			$sql = "select `id` from `mazepa_media` 
				where `owner` = '{$this->user['id']}' and `album` = '{$aid}' 
				order by `order` desc";
		}
		
		if ($sql) {
			$e = $this->db->query($sql);
			$array = $e->fetchAll();
			foreach($array as $k => $e) $array[$k] = $e['id'];
		} elseif(is_array(@$_POST['list'])) {
			$array = array_values($_POST['list']);
		} else {
			return [];
		}

		$this->db->beginTransaction();
		foreach($array as $k => $v) {
			$v = (int) $v;
			if ($v > 0) $this->db->query("update `mazepa_media` set `order` = '{$k}' where `owner` = '{$this->user['id']}' and `id` = '{$v}'");
		}
		$this->db->commit();

		return ['ok' => $array];
	}

	/**
	 * Поворот фотографий
	 */
	public function __ImagesRotate(){
		// Список изображений:
		$aid   = (int) @$_POST['aid'];
		$list  = @$_POST['list'];
		$angle = @$_POST['angle'] == 'right' ? 90 : 270;
		
		// Информация о фотографиях:
		if (!is_array($list)) return [];
		$list = array_values($list);
		foreach ($list as $k => $v) $list[$k] = (int) $v;
		$list = implode(',', $list);
		
		$images = $this->db->query("select * from `mazepa_media`
			where `id` in ({$list}) and `owner` = '{$this->user['id']}' and `album` = '{$aid}'");
		$imagesData = $images->fetchAll(PDO::FETCH_ASSOC);
		
		$update = $this->db->prepare("update `mazepa_media` set 
			`src_main` = :src_main,
			`src_large` = :src_large,
			`src_medium` = :src_medium,
			`src_small` = :src_small,
			`src_thumb` = :src_thumb,
			`src_xthumb` = :src_xthumb
			where `owner` = '{$this->user['id']}' and `id` = :id");

		foreach ($imagesData as $img) {
			$thumbs = EditImages::Rotate($img, $angle, $this->user['id']);
			$data = [
				':src_main'   => @$thumbs['main'],
				':src_large'  => @$thumbs['large'],
				':src_medium' => @$thumbs['medium'],
				':src_small'  => @$thumbs['small'],
				':src_thumb'  => @$thumbs['thumb'],
				':src_xthumb' => @$thumbs['xthumb'],
				':id'         => @$img['id']
			];
			$update->execute($data);
		}
		
		return $this->__Images($aid);
	}

	/**
	 * Сменить имя фотографии
	 */
	public function __ImageRename(){
		$mid = (int) @$_POST['mid'];
		$title = Text::Inline(@$_POST['title']);
		$e = $this->db->prepare("update `mazepa_media` set `title` = ? where `id` = '{$mid}' and `owner` = '{$this->user['id']}'");
		$e->execute([$title]);
		return ['title' => $title];
	}
	
	/**
	 * Очистка корзины
	 */
	public function __ClearTrash(){
		$e = $this->db->query("select * from `mazepa_media` where `album` = '-1' and `owner` = '{$this->user['id']}'");
		$files = $e->fetchAll(PDO::FETCH_ASSOC);
		$files_src = '';
		$list = [];
		foreach ($files as $img) {
			$list[] = $img['id'];
			foreach ($img as $k => $v) if ($k[0] == 's' && $v != '') $files_src .= "$v\n";
		}
		exec("echo \"$files_src\" >> ".EXPORTS."/removed");
		$list = implode(',', $list);
		$this->db->exec("delete from `mazepa_media` where `id` in ($list)");
		$this->db->exec("delete from `mazepa_colors` where `media` in ($list)");
		return [ 'files' => $files ];
	}

	/**
	 * Удаление альбома
	 */
	public function __AlbumDelete(){
		$id = (int) $_POST['aid'];

		// Обратка: фотографии
		$e = $this->db->query("select `id` from `mazepa_media` where `owner` = '{$this->user['id']}' and `album` = '{$id}'");
		$ids = array_map(function($a){ return $a['id']; }, $e->fetchAll(PDO::FETCH_ASSOC));
		// Обратка: Информация альбома
		$e = $this->db->query("select * from `mazepa_albums` where `owner` = '{$this->user['id']}' and `id` = '{$id}'");
		$albuminfo = $e->fetch(PDO::FETCH_ASSOC);
		// Сообщение
		$msg = "Альбом <b>«{$albuminfo['title']}»</b> удалён.";
		if (count($ids) > 0 ) $msg .= " Фотографии альбома перемещены в корзину (".count($ids)."шт.)";

		$sql = [ "insert into `mazepa_albums` values (". implode(",", $this->AQuote($albuminfo)) .");" ];
		if (count($ids) > 0) $sql[] = "update `mazepa_media` set `album` = '{$id}' where `owner` = '{$this->user['id']}' and `id` in (".implode(',', $ids).");";

		// Удаление
		$this->db->query("update `mazepa_media` set `album` = '0' where `owner` = '{$this->user['id']}' and `album` = '{$id}'");
		$this->db->query("delete from `mazepa_albums` where `owner` = '{$this->user['id']}' and `id` = '{$id}'");
		
		return [
			'media' => $this->__Media(), 
			'message' => $msg,
			'reverse' => $this->Reverse($sql)
		];
	}

	/**
	 * Редактирование альбома
	 */
	public function __AlbumEdit(){
		$aid = (int) $_POST['aid'];
		$data = array_slice(@$_POST['data'], 0, 3);
		// Имя
		$data[0] = htmlspecialchars(trim(@$data[0]));
		// Описание
		$data[1] = htmlspecialchars(@$data[1]);
		// Приватность
		$data[2] = (int) @$data[2];
		if ($data[2] < 0 || $data[2] > 3) $data[2] = 1;
		// Сохранение информации
		if ($aid == 0){
			$secret = substr(sha1(rand() . uniqid()), 0, 8);
			$e = $this->db->prepare("insert into `mazepa_albums` 
				(`title`, `desc`, `privacy`, `owner`, `secret`) 
				values (?, ?, ?, {$this->user['id']}, '{$secret}')");
		} else {
			$e = $this->db->prepare("update `mazepa_albums` 
				set `title` = ?, `desc` = ?, `privacy` = ?
				where `owner` = '{$this->user['id']}' and `id` = '{$aid}'");
		}
		$e->execute($data);
		$media = $this->__Media();
		$media['last'] = $aid > 0 ? $aid : $this->db->lastInsertId();
		return $media;
	}
	
	/**
	 * Получение списка всех моих друзей
	 */
	public function __MyFriends(){
		$friends = $this->db->query("select 
			`mazepa_social`.`sid`,`mazepa_social`.`name`,`mazepa_social`.`picture` from `mazepa_social` 
			left join `mazepa_friends` on `mazepa_social`.`sid` = `mazepa_friends`.`sid`
			where `mazepa_friends`.`uid` = '{$this->user['id']}'");
		return [
			'friends' => $friends->fetchAll(PDO::FETCH_ASSOC)
		];
	}

	/**
	 * Поставить/удалить отметку альбмоа
	 */
	public function __AlbumTag(){
		$aid = (int) $_POST['aid'];
		$sid =       $_POST['sid'];
		if($aid == 0 || !$this->IsMy($aid, "mazepa_albums")) return [];
		if(!preg_match('/^[fb|gp|vk][a-z0-9]{1,38}$/i', $sid)) return [];
		
		if (@$_POST['act'] == 'add') {
			$e = $this->db->prepare("insert into `mazepa_tags` (`aid_sid` ,`aid`, `sid`) 
				values (:aid_sid, :aid, :sid) on duplicate key update `active` = 1");
			$e->execute([':sid' => $sid, ':aid' => $aid, ':aid_sid' => $aid.$sid]);
		} else {
			$e = $this->db->prepare("update `mazepa_tags` set `active` = 0 
				where `aid_sid` = :aid_sid");
				$e->execute([':aid_sid' => $aid.$sid]);
		}
		return [];
	}

	/**
	 * Получение списка альбомов в галерее
	 */
	public function __Albums($gid = false){
		$id = (int) ($gid ? $gid : $_POST['gid']);
		if ($id <= 0) return false;
		$albums = $this->db->query("select `mazepa_albums`.* from `mazepa_albums` 
			left join `mazepa_alb_gal` on `mazepa_alb_gal`.`aid` = `mazepa_albums`.`id` 
			where `mazepa_alb_gal`.`gid` = '{$id}' and `mazepa_albums`.`owner` = '{$this->user['id']}' 
			order by `order`");
		$albumsData = $albums->fetchAll(PDO::FETCH_ASSOC);
		return [
			'albums' => $albumsData,
			'covers' => $this->AlbumCovers(array_map(function($e){ return $e['id']; }, $albumsData))
		];
	}

	/**
	 * Добавить или убрать альбом в галерею
	 */
	public function __AlbumsInGallery(){
		$gid = (int) $_POST['gid'];
		$aid = (int) $_POST['aid'];
		$rem = (boolean) @$_POST['remove'];
		// Проверка авторства
		if(!$this->IsMy($gid, "mazepa_gallery") || !$this->IsMy($aid, "mazepa_albums")) return [];
		// Вставка # удалние альбома
		$this->db->query("delete from `mazepa_alb_gal` where `aid` = '{$aid}' and `gid` = '{$gid}' limit 1");
		if(!$rem) $this->db->query("insert into `mazepa_alb_gal` (`aid`, `gid`) values ('$aid', '$gid')");
		return [ 'covers' => $this->AlbumCovers($aid) ];
	}

	/**
	 * Порядок альбомов в галерее
	 */
	public function __AlbumsInGalleryOrder(){
		$id = (int) @$_POST['gid'];
		$ordered = (@$_POST['ordered']);
		foreach($ordered as $k => $v) $ordered[$k] = (int) $v;
		if(count($ordered) == 0) return [];
		// Все ли альбомы авторские?
		if(!$this->IsMy(array_values($ordered), "mazepa_albums")) return [];
		// Авторская ли галерея?
		if(!$this->IsMy($id, "mazepa_gallery")) return [];
		// Обновление информации
		$this->db->beginTransaction();
		foreach($ordered as $k => $v){
			$e = $this->db->prepare("update `mazepa_alb_gal` set `order` = ? where `aid` = ? and `gid` = ?");
			$e->execute([$k, $v, $id]);
		}
		$this->db->commit();
		return [];
	}

	/**
	 * Редактирование галереи
	 */
	public function __GalleryInfo(){
		$id = (int) $_POST['gid'];
		// [Имя, Урл, Приватность, Описание]
		$data = array_slice(@$_POST['data'], 0, 4);
		// Имя
		$data[0] = htmlspecialchars(trim(@$data[0]));
		// Урл
		$data[1] = $this->IsName(@$data[1]);
		if ($data[1] === false) return ['error' => 'URL некорректен'];
		$urlfix = $this->__GalleryGetID($data[1])['result'];
		if ($urlfix !== 0 && $urlfix != $id) return ['error' => 'Этот URL уже используется'];
		// Описание
		$data[2] = htmlspecialchars(@$data[2]);
		// Приватность
		$data[3] = (int) @$data[3];
		if ($data[3] != 3 && $data[3] != 1 && $data[3] != 0) $data[3] = 1;
		// Сохранение информации
		if ($id == 0){
			$sql = "insert into `mazepa_gallery` 
				(`title`, `url`, `desc`, `privacy`, `owner`) 
				values (?, ?, ?, ?, {$this->user['id']})";
		} else {
			$sql = "update `mazepa_gallery` 
				set `title` = ?, `url` = ?, `desc` = ?, `privacy` = ? 
				where `owner` = '{$this->user['id']}' and `id` = '{$id}'";
		}
		$e = $this->db->prepare($sql);
		$e->execute($data);
		$media = $this->__Media();
		$media['last'] = $id > 0 ? $id : $this->db->lastInsertId();
		return $media;
	}

	/**
	 * Удаление галереи
	 */
	public function __GalleryDelete(){
		$id = (int) $_POST['gid'];
		$e = $this->db->query("select * from `mazepa_gallery` where `owner` = '{$this->user['id']}' and `id` = '{$id}' limit 1");
		$G = $e->fetch(PDO::FETCH_ASSOC);
		if (@$G['id']) {
			// Обратка
			$msg = "Галерея «{$G['title']}» удалена.";
			$G = $this->AQuote($G);
			$sql = [ "insert into `mazepa_gallery` values (". implode(",", $G) .");" ];
			$albgal = $this->db->query("select * from `mazepa_alb_gal` where `gid` = '{$id}'");
			foreach ($albgal->fetchAll(PDO::FETCH_ASSOC) as $line) {
				$sql[] = "insert into `mazepa_alb_gal` values (". implode(",", $this->AQuote($line)) .");";
			}

			// Удаление
			$this->db->query("delete from `mazepa_gallery` where `owner` = '{$this->user['id']}' and `id` = '{$id}'");
			$this->db->query("delete from `mazepa_alb_gal` where `gid` = '{$id}'");
			return [
				'media' => $this->__Media(), 
				'message' => $msg,
				'reverse' => $this->Reverse($sql)
			];
		}
		
		return [];
	}

	/**
	 * Редактирование персональной страницы
	 */
	public function __ProfileInfo(){
		// [Имя, Урл, Описание]
		$data = array_slice(@$_POST['data'], 0, 3);
		// Имя
		$data[0] = htmlspecialchars(trim(@$data[0]));
		// Урл
		// Корректен?
		// $data[1] = $this->IsName(@$data[1]);
		// if ($data[1] === false) return ['error' => 'Логин некорректен'];
		// Уникален?
		//$login = $this->db->query("select `id` from `mazepa_userinfo` where `username` = '{$data[1]}' limit 1");
		//$uid = $login->fetch(PDO::FETCH_ASSOC);
		//if ($uid && @$uid['id'] != $this->user['id']) return ['error' => 'Этот URL уже используется'];
		// Подпись
		$data[1] = '';
		$data[2] = htmlspecialchars(@$data[2]);
		print_r($data);
		// Сохранение информации
		$e = $this->db->prepare("update `mazepa_userinfo` 
			set `name` = ?, `username` = ?, `text` = ? 
			where `id` = '{$this->user['id']}'");
		$e->execute($data);
		return [ 'success' => true, 'username' => $data[1]];
	}

	/**
	 * Добавить альбом на главную страницу
	 */
	public function __ProfileAddAlbums(){
		$aid = (int) $_POST['aid'];
		$cnt = (int) $_POST['cnt'];
		$this->db->query("update `mazepa_albums` set `privacy` = '3', `order` = '{$cnt}' where `owner` = '{$this->user['id']}' and `id` = '{$aid}'");
		return [ 'covers' => $this->AlbumCovers($aid) ];
	}

	/**
	 * Альбомы на главной странице — порядок
	 */
	public function __ProfileAlbumsOrder(){
		$ordered = @$_POST['ordered'];
		foreach($ordered as $k => $v) $ordered[$k] = (int) $v;
		if(count($ordered) == 0) return [];
		// Обновление информации
		$this->db->beginTransaction();
		foreach($ordered as $k => $v){
			$e = $this->db->prepare("update `mazepa_albums` set `order` = ? where `id` = ? and `owner` = '{$this->user['id']}'");
			$e->execute([$k, $v]);
		}
		$this->db->commit();
		return [];
	}

	/**
	 * Получение информации о пользователе 
	 */
	public function __Profile(){
		// Общее
		$user = $this->db->query("select * from `mazepa_userinfo` where `mazepa_userinfo`.`id` = '{$this->user['id']}' limit 1");
		$userInfo = $user->fetch(PDO::FETCH_ASSOC);
		// Социалки привязанные
		$social = $this->db->query("select * from `mazepa_social` where `owner` = '{$this->user['id']}' order by `date` desc");
		$userInfo['social'] = $social->fetchAll(PDO::FETCH_ASSOC);
		// Публичные альбомы мои
		$albums = $this->db->query("select `id` from `mazepa_albums` where `owner` = '{$this->user['id']}' and `privacy` = '3' order by `order` asc");
		$userInfo['albums'] = array_map(function($e){ return (int) $e['id']; }, $albums->fetchAll(PDO::FETCH_ASSOC));
		$userInfo['covers'] = $this->AlbumCovers($userInfo['albums']);
		return $userInfo;
	}

	public function __SocialRemove(){
		$sid = @$_POST['sid'];
		// Текущие привязанные
		$e = $this->db->query("select * from `mazepa_social` where `owner` = '{$this->user['id']}' order by `date` desc");
		$social = $e->fetchAll(PDO::FETCH_ASSOC);
		if (count($social) > 1) {
			foreach ($social as $s) {
				if ($s['sid'] == $sid) $this->db->query("delete from `mazepa_social` where `sid` = '{$s['sid']}'");
			}
		}
		return [];
	}

	/**
	 * Проверка существования URL адреса галереи
	 * [false/0/ID] — некорректно/нет такого/найден ID
	 */
	public function __GalleryGetID($url = false){
		$url = $url ? $url : $_POST['url'];
		$url = $this->IsName($url);
		if (!$url) return ['result' => false];
		$gallery = $this->db->query("select `id` from `mazepa_gallery` where `url` = '{$url}' limit 1");
		$data = $gallery->fetch(PDO::FETCH_ASSOC);
		return ['result' => @$data['id'] ? $data['id'] : 0];
	}

	/**
	 * Поиск по медиатеке автора по цвету
	 */
	public function __ColorSearch(){
		$colores = [];
		foreach (@$_POST['color'] as $rgb) {
			if(preg_match('/^[a-f0-9]{6}/i', $rgb)) $colores[] = $rgb;
		}

		if ($colores == []) return [];
		$color = implode("','", $colores);
		$e = $this->db->query("select * from (select `mazepa_media`.*, `mazepa_colors`.`val` from `mazepa_colors` 
			left join `mazepa_media` on `mazepa_media`.`id` = `mazepa_colors`.`media`
			where `mazepa_colors`.`color` in ('$color') and `mazepa_media`.`owner` = '{$this->user['id']}'
			group by `mazepa_media`.`id`) as `tmp` order by `tmp`.`val` desc limit 150");
		return ['images' => $e->fetchAll(PDO::FETCH_ASSOC) ];
	}

	/**
	 * Запуск обратного процесса
	 */
	public function __ReverseRun(){
		$code = (int) @$_POST['code'];
		$sql  = file_get_contents(LOG . "reverse/{$this->user['id']}-{$code}.sql");
		if ($sql) $this->db->query($sql);
		return [];
	}


	public function __HelperStop(){
		$note = LOG . "notes/s{$this->user['id']}.json";
		file_put_contents($note, json_encode(['show' => false]));
		return [];
	}


	/*! --------------------------------------------------------------------- */

	/**
	 * Помогалка: случайный совет при старте:
	 */
	private function Helper(){
		$helps = [
			'Быстрый просмотр фотографии — выделить и нажать пробел',
			'Удалять выделенные фотографии можно клавишами <span class="key">delete</span> или <span class="key">backspace</span>',
			'Выделить все фотографии в альбоме — клавиша <span class="key">F</span>',
			'Отменить выбор фотографий — клавиша <span class="key">Q</span>',
			'Нажмите правой кнопкой мыши на альбоме или галерее слева для вызова контекстного меню',
			'Нажмите правой кнопкой мыши на фотографии для вызова контекстного меню',
			'Повернуть выделенные фотографии можно клавишами <span class="key">]</span> и <span class="key">[</span>',
			'Выделить несколько фотографий в альбоме можно зажав клавишу <span class="key">Shift</span> или <span class="key">Cmd</span>'
		];

		shuffle($helps);
		$note = LOG . "notes/s{$this->user['id']}.json";

		if (file_exists($note)) {
			$info = json_decode(file_get_contents($note));
			if (!$info->show) return false;
			$helpsMy = $info->helps;
		} else {
			$helpsMy = $helps;
		}
		
		$help = $helpsMy[0];
		$helpsMy = (count($helpsMy) > 1) ? array_slice($helpsMy, 1) : $helps;
		file_put_contents($note, json_encode(['show' => true, 'helps' => $helpsMy]));
		
		return $help;
	}

	/**
	 * Обработка массива db->quote
	 */
	private function AQuote($a) {
		foreach ($a as $k => $item) $a[$k] = $this->db->quote($item);
		return $a;
	}

	/**
	 * Обратка действий пользователя
	 */
	private function Reverse($sql) {
		$reverse = rand();
		exec("rm -f " . LOG . "reverse/{$this->user['id']}-*");
		file_put_contents(LOG . "reverse/{$this->user['id']}-{$reverse}.sql", implode("\n", $sql));
		return $reverse;
	}

	/**
	 * Получить обложку альбома | альбомов по ID
	 */
	private function AlbumCovers($aid){
		$list = is_array($aid) ? implode(',', $aid) : $aid;
		if ($list == "") return [];
		$covers = $this->db->query("select * from (select `mazepa_media`.`src_small`, `mazepa_media`.`src_main`, `mazepa_media`.`color`, `mazepa_media`.`album` 
			from `mazepa_media` where `mazepa_media`.`album` in ($list) 
			order by `mazepa_media`.`order`) as `tmp` group by `tmp`.`album`");
		return $covers->fetchAll(PDO::FETCH_ASSOC);
	}

	/**
	 * Проверка авторства галереи или альбома
	 */
	private function IsMy($ID, $table){
		$list = $ID;
		$count = 1;
		if (is_array($ID)){
			$list = implode(',', $ID);
			$count = count($ID);
		}
		$test = $this->db->query("select count(`id`) as `count` from `$table` where `owner` = '{$this->user['id']}' and `id` in ($list)");
		return (@$test->fetchAll(PDO::FETCH_ASSOC)[0]['count'] == $count);
	}

	/*! --------------------------------------------------------------------- */

	// Старое
	// Подарить инвайт
	public function __Invite(){
		$id = (int) $_POST['id'];
		$this->db->begin();
		$this->db->exec("update `mazepa_userinfo` set `level` = '2', `inviter` = '{$this->owner}' where `id` = '{$id}' and `level` = '1'");
		$this->db->exec("update `mazepa_invites` set `inviter` = '{$this->owner}' where `user` = '{$id}'");
		$this->db->commit();
		return [];
	}
}
