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
			'gallery' => $gallery->fetchAll(PDO::FETCH_ASSOC)
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
		$aid = (int) $_POST['aid'];
		if($aid > 0 && !$this->IsMy($aid, "mazepa_albums")) return [];
		if(!is_array(@$_POST['data'])) return [];
		$data = array_values(@$_POST['data']);
		foreach($data as $k => $v) $data[$k] = (int) $v;
		$this->db->exec("update `mazepa_media` set `album` = '{$aid}' where `owner` = '{$this->user['id']}' and `id` in (" .implode(', ', $data). " )");
		return [];
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
				order by `mazepa_exifo`.`Date/Time Original`, `mazepa_exifo`.`Modify Date`, `mazepa_exifo`.`File Access Date/Time`";
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
		$e = $this->db->prepare("update `mazepa_media` set `album` = '0' where `owner` = '{$this->user['id']}' and `album` = '{$id}'");
		$e->execute();
		$e = $this->db->prepare("delete from `mazepa_albums` where `owner` = '{$this->user['id']}' and `id` = '{$id}'");
		$e->execute();
		return $this->__Media();
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
			$sql = "insert into `mazepa_albums` 
				(`title`, `desc`, `privacy`, `owner`) 
				values (?, ?, ?, {$this->user['id']})";
		} else {
			$sql = "update `mazepa_albums` 
				set `title` = ?, `desc` = ?, `privacy` = ?
				where `owner` = '{$this->user['id']}' and `id` = '{$aid}'";
		}
		$e = $this->db->prepare($sql);
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
		$app = $this->db->query("select * from `mazepa_gallery` where `owner` = '{$this->user['id']}' and `id` = '{$id}' limit 1");
		$G = $app->fetch(PDO::FETCH_ASSOC);
		if(@$G['id']){
			$e = $this->db->prepare("delete from `mazepa_gallery` where `owner` = '{$this->user['id']}' and `id` = '{$id}'");
			$e->execute();
			$e = $this->db->prepare("delete from `mazepa_alb_gal` where `gid` = '{$id}'");
			$e->execute();
		}
		return $this->__Media();
	}

	/**
	 * Редактирование персональной страницы
	 */
	public function __ProfileInfo(){
		// [Имя, Урл, Приватность, Описание]
		$data = array_slice(@$_POST['data'], 1, 3);
		// Имя
		$data[0] = htmlspecialchars(trim(@$data[0]));
		// Урл
		// Корректен?
		$data[1] = $this->IsName(@$data[1]);
		if ($data[1] === false) return ['error' => 'Логин некорректен'];
		// Уникален?
		$login = $this->db->query("select `id` from `mazepa_userinfo` where `username` = '{$data[1]}' limit 1");
		$uid = $login->fetch(PDO::FETCH_ASSOC);
		if ($uid && @$uid['id'] != $this->user['id']) return ['error' => 'Этот URL уже используется'];
		// Подпись
		$data[2] = htmlspecialchars(@$data[2]);
		// Сохранение информации
		$e = $this->db->prepare("update `mazepa_userinfo` 
			set `name` = ?, `username` = ?, `text` = ? 
			where `id` = '{$this->user['id']}'");
		$e->execute($data);
		return [ 'success' => true ];
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

	/*! --------------------------------------------------------------------- */


	/**
	 * Получить обложку альбома | альбомов по ID
	 */
	private function AlbumCovers($aid){
		$list = is_array($aid) ? implode(',', $aid) : $aid;
		if ($list == "") return [];
		$covers = $this->db->query("select `mazepa_media`.`src_small`, `mazepa_media`.`src_main`, `mazepa_media`.`color`, `mazepa_media`.`album` 
			from `mazepa_media`,`mazepa_alb_gal` where `mazepa_media`.`album` in ($list) 
			group by `mazepa_media`.`album` order by `mazepa_media`.`order`");
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








	// ! ---- Старое


	// Удаление фотографий из корзины
	public function __clearTrashOLD(){
		if(!is_array(@$_POST['ids'])) die("true");
		$array = @$_POST['ids'];
		foreach($array as $k => $v) $array[$k] = (int) $v;
		$where = "where `owner` = '{$this->owner}' and `album` = '-1' and `id` in (" . implode(', ', $array) . " )";
		$files = $this->db->exec("select * from `mazepa_media` $where");
		$list  = '0';
		foreach($files as $file){
			$list .= ',' . $file['id'];
			exec('echo "'.$file['src'].'" >> /home/mathilde/www/hard.mazepa.us/removed');
		}
		$this->db->exec("delete from `mazepa_media` where `id` in ($list)");
		$this->db->exec("delete from `mazepa_colors` where `media` in ($list)");
		return array('files' => $files);
	}
	// Главная : получить последние фотки галереи
	public function __eventsGpreview(){
		$gid = (int) @$_POST['gid'];
		$images = $this->db->exec("select `mazepa_media`.* from `mazepa_media` 
			left join `mazepa_alb_gal` on `mazepa_media`.`album` = `mazepa_alb_gal`.`aid` 
			where `mazepa_alb_gal`.`gid` = '{$gid}' and `mazepa_media`.`owner` = '{$this->owner}' order by `date` desc limit 50");
		return array('images' => $images);
	}
	// Удалить пост! 
	public function __eventRemove(){
		$id = (int) @$_POST['id'];
		$this->db->exec("delete from `mazepa_events` where `id` = '{$id}' and `owner` = '{$this->owner}' limit 1");
		return [];
	}
	// Новый пост на главной!
	public function __postCreate(){
		// Список картиночек
		$picts = @$_POST['picts'];
		if(!is_array($picts)) return [];
		foreach($picts as $k => $v) $picts[$k] = (int) $v['id'];
		$info = array(
			':id' => NULL,
			':owner' => $this->owner,
			':text' => text::clear(@$_POST['text']),
			':alb' => (int) @$_POST['aid'],
			':gal' => (int) @$_POST['gid'],
			':media' => implode(',', $picts)
		);
		// Если альбом/галерея приватны, открываем доступ
		// ПРОВЕРКА
		if($info[':alb'] > 0) $this->db->exec("update `mazepa_albums` set `privacy` = 2 where `id` = '{$info[':alb']}' and `owner` = '{$this->owner}' and `privacy` < 2");
		if($info[':gal'] > 0) $this->db->exec("update `mazepa_gallery` set `privacy` = 2 where `id` = '{$info[':gal']}' and `owner` = '{$this->owner}' and `privacy` < 2");
		// Добавление новости
		$this->db->exec("insert into `mazepa_events` values(".implode(", ", array_keys($info)).")", $info);
		return array('ok' => true);
	}
	
	// Получение галереи
	public function __gallery(){
		return $this->gallery((int) @$_POST['id']);
	}
	// Проверка существования [false,true,data] = [Некорректно, Уникально, Существует]
	public function __existGalleryUrl($url){
		$url = $this->me->is_name(htmlspecialchars($url));
		if(!$url) return false;
		$gallery = $this->db->exec("select * from `mazepa_gallery` where `url` = '{$url}' limit 1");
		return (count($gallery) == 0) ? true : $gallery[0];
	}
	// Получить медиатеку
	public function __listfull(){
		return $this->listfull();
	}
	// Подарить инвайт
	public function __Invite(){
		$id = (int) $_POST['id'];
		$this->db->begin();
		$this->db->exec("update `mazepa_userinfo` set `level` = '2', `inviter` = '{$this->owner}' where `id` = '{$id}' and `level` = '1'");
		$this->db->exec("update `mazepa_invites` set `inviter` = '{$this->owner}' where `user` = '{$id}'");
		$this->db->commit();
		return [];
	}
	// Поиск по медиатеке автора по цвету
	public function __color_search(){
		$color = substr(@$_POST['color'], 0, 6);
		if(!preg_match('/^[a-z0-9]+/i', $color)) return false;
		return $this->color_search($color, $this->owner);
	}
}
