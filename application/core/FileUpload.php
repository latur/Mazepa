<?php
class FileUpload extends Init {
	function __construct() {

		parent::__construct();
		// Загрузка изображения в медиатеку
		if(is_array(@$_FILES['invite']) && @$_FILES['invite']['error'] == 0){
			$hash = Invite::HashFile(@$_FILES['invite']['tmp_name']);
			echo $this->InviteExist($hash) ? '0' : '1';
			exit;
		}

		// Следующие методы только для авторов
		if ($this->user['level'] < 2) return false;
		
		// Загрузка изображения в медиатеку
		if (is_array(@$_FILES['files']) && @$_FILES['files']['error'] == 0) {
			return $this->Image($_FILES['files']);
		}
		// Загрузка картинки для профиля
		if (is_array(@$_FILES['cover']) && @$_FILES['cover']['error'] == 0) {
			return $this->Cover($_FILES['cover']);
		}
		// Загрузка аватарки для профиля
		if (is_array(@$_FILES['pict']) && @$_FILES['pict']['error'] == 0) {
			return $this->Pict($_FILES['pict']);
		}
		
		Init::Error(404);
	}

	private $pdoImage = "insert into `mazepa_media` 
		( `id`,`owner`,`title`,`album`,`date`,`order`,`color`,`src_main`,`src_large`,`src_medium`,`src_small`,`src_mini`,`src_thumb`,`src_xthumb`) values
		( :id, :owner, :title, :album, :date, :order, :color, :src_main, :src_large, :src_medium, :src_small, :src_mini, :src_thumb, :src_xthumb)";
	private $pdoColor = "insert into `mazepa_colors` 
		( `id`,`media`,`color`,`val`) values 
		(NULL, :media, :color, :val)";

	/**
	 * Загрузка изображения в медиатеку
	 */
	public function Image($_files){
		$thumbs = EditImages::ImageUpload($this->user['id'], $_files);
		if (!$thumbs) return false;

		$src = @$thumbs['small'] ? $thumbs['small'] : $thumbs['main'];
		$palette = ColorPalette::GenerateFromLocalImage(EXPORTS . $src);
		
		// Фотография
		$data = array(
			':id'         => NULL,
			':owner'      => $this->user['id'],
			':title'      => EditImages::ImageTitle($_files['name']),
			':album'      => 0,
			':date'       => date('Y-m-d H:i:s'),
			':order'      => 0,
			':color'      => array_shift( array_keys($palette) ),
			':src_main'   => @$thumbs['main'],
			':src_large'  => @$thumbs['large'],
			':src_medium' => @$thumbs['medium'],
			':src_small'  => @$thumbs['small'],
			':src_mini'   => @$thumbs['mini'],
			':src_thumb'  => @$thumbs['thumb'],
			':src_xthumb' => @$thumbs['xthumb']
		);
		$stmt = $this->db->prepare($this->pdoImage);
		$stmt->execute($data);
		$imageID = $this->db->lastInsertId();
		
		$this->SavePalette($imageID, $palette);
		$this->ImageExif($imageID, $thumbs['main']);
		return true;
	}
	/**
	 * Сохранение Exif-данных фотографии
	 */
	public function ImageExif($id, $src){
		$exif = array_merge(EditImages::Exif(EXPORTS . $src), array('id' => $id));
		if (!@is_array($exif)) return false;
		foreach($exif as $name => $value) $exif[$name] = $this->db->quote($value);
		$keys = implode("`, `", array_keys($exif));
		$values = implode(", ", array_values($exif));
		$stmt = $this->db->prepare("insert into `mazepa_exifo` (`{$keys}`) values ({$values})");
		$stmt->execute();
	}
	/**
	 * Сохранение основных цветов фотографии
	 */
	public function SavePalette($media, $palette){
		if (!@is_array($palette)) return false;
		$this->db->beginTransaction();
		foreach($palette as $color => $val){
			if ($val >= 150){
				$e = $this->db->prepare($this->pdoColor);
				$e->execute(array(':media' => $media, ':color' => $color, ':val' => $val));
			}
		}
		$this->db->commit();
	}
	/**
	 * Сохранение обложки автора
	 * /path/cover_large.jpg  1620 x 540
	 * /path/cover_medium.jpg 1050 x 350
	 * /path/cover_small.jpg  600  x 200
	 */
	public function Cover($_files){
		// Проверка по расширению
		$ext = pathinfo(strtolower(@$_files['name']), PATHINFO_EXTENSION);
		if( $ext == "tif"){ $ext = "tiff"; }
		if( !stristr(EditImages::$exts, "|$ext|")) die('0'); 

		// Проверка по размеру. Минимум 200x500
		$s = getimagesize(@$_files['tmp_name']);
		if($s[1] < 200 || $s[0] < 500) return [];
		
		// Обработка: размер
		$dir = EditImages::MediaDirectory($this->user['id']);
		$cropX = $s[0]/$s[1] > 1620/540 ? 'x540' : '1620';
		
		$cL = $dir . 'cover_large.jpg';
		$cM = $dir . 'cover_medium.jpg';
		$cS = $dir . 'cover_small.jpg';
		
		exec(CONVERT . "{$_files['tmp_name']}[0] -resize {$cropX} {$cL}\n");
		exec(CONVERT . "{$cL} -gravity Center -crop 1620x540-0-0 +repage {$cL}\n");
		exec(CONVERT . "{$cL} -resize 1050 {$cM}\n");
		exec(CONVERT . "{$cL} -resize 600 {$cS}\n");
		
		if (!file_exists($cL) || !file_exists($cM) || !file_exists($cS)) die(1);

		$src = str_replace(EXPORTS, '', $dir);
		$this->db->query("update `mazepa_userinfo` set `cover` = '{$src}' where `id` = '{$this->user['id']}'");
		
		echo $src;
	}
	/**
	 * Сохранение аватарки автора
	 * x{uid}.jpg 200 x 200
	 * w{uid}.jpg 80 x 80
	 */
	public function Pict($_files){
		// Проверка по расширению
		$ext = pathinfo(strtolower(@$_files['name']), PATHINFO_EXTENSION);
		if( $ext == "tif"){ $ext = "tiff"; }
		if( !stristr(EditImages::$exts, "|$ext|")) die('0'); 

		// Проверка по размеру. Минимум 200x200
		$s = getimagesize(@$_files['tmp_name']);
		if($s[1] < 200 || $s[0] < 200) return [];

		$pW = CACHE . "pict/{$this->user['id']}w.jpg";
		$pX = CACHE . "pict/{$this->user['id']}x.jpg";

		$cropX = $s[0]/$s[1] > 200/200 ? 'x200' : '200';
		exec(CONVERT . "{$_files['tmp_name']}[0] -resize {$cropX} {$pW}\n");
		exec(CONVERT . "{$pW} -gravity center -crop 200x200-0-0 +repage {$pW}\n");
		exec(CONVERT . "{$pW} -resize 80 {$pX}\n");
		
		if (!file_exists($pW) || !file_exists($pX)) die(1);
		
		echo "Конь";
	}
	/**
	 * Проверка инвайта
	 */
	public function InviteExist($code){
		if (strlen($code) < 8*8) return false;
		$invites = $this->db->query("select `code`,`user`,`id` from `mazepa_invite`");
		$optimal = 4;
		$finded  = false;
		
		// Поиск ближайшего хэша
		foreach ($invites->fetchAll(PDO::FETCH_ASSOC) as $img) {
			$distance = abs( Invite::Distance($img['code'], $code) );
			if($optimal > $distance){
				$optimal = $distance;
				$finded = $img;
			}
		}
		
		if (!$finded) return false;

		// Приглашение найдено. Текущего пользователя повышаем, приглашение удаляем
		$this->db->query("delete from `mazepa_invite` where `id` = '{$h['id']}'");
		$this->db->query("update `mazepa_userinfo` set `level` = '2', `inviter` = '{$finded['user']}' where `id` = '{$this->user['id']}' and `level` = '1'");
		// unlink($h['src']);
		return true;
	}

}
