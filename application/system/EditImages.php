<?php
class EditImages {
	// Форматы, отображаемые в браузере
	public static $exts = '|jpg|jpeg|png|gif|';
	// Форматы небраузерные, для которых создаётся копия изображения
	public static $extsraw = '|tiff|tif|psd|bmp|nef|raw|raf|cr2|orf|dng|';
	// Считываемые поля EXIF
	public static $exif_fields = '|File Size|File Access Date/Time|File Type|MIME Type|Camera Model Name|Software|Modify Date|Artist|Compression|X Resolution|Y Resolution|Exposure Program|ISO|Exposure Compensation|Max Aperture Value|Flash|White Balance|Focus Mode|Quality|Field Of View|Focal Length|Exposure Mode|Focal Length In 35mm Format|Date/Time Original|Aperture|Auto Focus|Image Size|Color Space|F Number|Daylight Savings|Vignette Control|Lens Type|Lens|GPS Latitude|GPS Longitude|GPS Position|GPS Altitude|Encoding Process|';

	/**
	 * Обёртка для загрузки фотографий:
	 * $user - ID автора
	 * $_files - $_FILES параметр
	 */
	public static function ImageUpload($user, $_files){
		$ext = pathinfo(@$_files['name'] ? $_files['name'] : $_files['tmp_name'], PATHINFO_EXTENSION);
		$exifDate = self::Exif(@$_files['tmp_name'], '-DateTimeOriginal');
		$imageDir = self::MediaDirectory($user, strtotime(@$exifDate['Date/Time Original']));
		return self::Thumbnails($imageDir, $_files['tmp_name'], $ext);
	}

	/**
	 * Создание миниатюр к фотографиям:
	 * $path - директория для картинок 
	 * $source - исходный загруженный файл
	 * $ext - расширение
	 * T thumb:  X xthumb:  S small:  M medium:  L large:  E main:
	 * 128x128,  256x256,   800x600,  1200x980,  1600x120  000x000
	 */
	public static function Thumbnails($path, $source, $ext){
		if (!@file_exists($source)) return false;
		
		$inf = getimagesize($source);
		$src = $path . 'main' . self::ImageName($ext, $inf);

		if ($inf[0] < 256 || $inf[1] < 256) return false;

		if (stristr(self::$extsraw, "|$ext|")) {
			copy($source, $src);
			$ext = ($ext == 'psd') ? 'png' : 'jpg';
			$src = "{$src}.{$ext}";
			exec(CONVERT . "{$source} -flatten {$src}\n");
		} else if (stristr(self::$exts, "|$ext|")) {
			copy($source, $src);
		} else {
			return false;
		}

		$sizes = array(
			'thumb'  => '128x128^',
			'xthumb' => '256x256^',
			'mini'   => '360x500',
			'small'  => '800x600',
			'medium' => '1200x980',
			'large'  => '1600x1200'
		);

		$files = array();

		foreach ($sizes as $key => $size) {
			list($toWidth, $toHeight) = explode('x', str_replace('^', '', $size));
			if ($inf[0] >= (int) $toWidth || $inf[1] >= (int) $toHeight) {
				$name = self::ImageName($ext, strstr($key, 'thumb') ? $toWidth."x".$toHeight : '@');
				$files[$key] = self::Resize($src, $path . $key . $name, $size);
				if (!file_exists($files[$key])) {
					exec("rm -f " . implode(' ', $files));
					return false;
				}
			}
		}
		
		exec(CONVERT . "{$files['xthumb']}[0] -gravity center -crop 256x256-0-0 +repage -quality 70 {$files['xthumb']} 2>&1", $exec);
		exec(CONVERT . "{$files['thumb']}[0]  -gravity center -crop 128x128-0-0 +repage -quality 70 {$files['thumb']} 2>&1", $exec);
		
		foreach ($files as $file) exec(OPTIM . "{$file} --strip-all --all-progressive 2>&1", $exec);
		// echo "\n  - " . implode("\n  - ", $exec);
		
		$files['main'] = $src;
		foreach ($files as $k => $v) $files[$k] = substr($v, strlen(EXPORTS));
		return $files;
	}

	/**
	 * Извлечение метаинформации из фотографии
	 */
	public static function Exif($source, $options = ''){
		exec(EXIF . "{$source} {$options} 2>&1", $data);
		$exif = array();
		foreach($data as $line){
			@list($name, $value) = explode('|', preg_replace("/( ){0,50}\: /", "|", $line));
			if(stristr(self::$exif_fields, "|$name|")) $exif[$name] = htmlspecialchars($value);
		}
		return $exif;
	}

	/**
	 * Имя изображения из имени файла:
	 * 
	 */
	public static function ImageTitle($str){
		$ext = pathinfo($str, PATHINFO_EXTENSION);
		$str = str_replace("_", " ", $str);
		$str = str_replace(".$ext", "", $str);
		$str = htmlspecialchars(nl2br($str));
		return $str;
	}

	/**
	 * Поворот изображения:
	 */
	public static function Rotate($img, $angle, $uid){
		if (!@$img['src_main']) return false;
		$_files = ['tmp_name' => EXPORTS . $img['src_main']];
		exec(CONVERT . "-rotate {$angle} {$_files['tmp_name']} {$_files['tmp_name']}\n", $exec); 
		return self::ImageUpload($uid, $_files);
	}

	
	// Вспомогательные функции

	/**
	 * Генерация нового имени файла
	 */
	private static function ImageName($ext, $size = '@'){
		$tmp = base_convert(rand(1111111, 9999999), 10, 32) . uniqid();
		$imagesize = is_array($size) ? ($size[0] . 'x' . $size[1]) : $size;
		return "{$tmp}.{$imagesize}.{$ext}";
	}

	/**
	 * Изменение размера изображения. Сохранение файла с инф. о размере
	 */
	private static function Resize($src, $dst, $size){
		if (!@file_exists($src)) return false;

		exec(CONVERT . "{$src} -resize {$size} -quality 85 {$dst} 2>&1", $exec);

		if (stristr($dst, ".@.")) {
			list($W, $H) = getimagesize($dst);
			$dsts = str_replace(".@.", ".{$W}x{$H}.", $dst);
			exec("mv $dst $dsts");
			return $dsts;
		}

		return $dst;
	}

	/**
	 * Создание папки для сохранения фотографии
	 */
	public static function MediaDirectory($uid, $time = false){
		$time = (int) $time > 0 ? (int) $time : time();
		$uid  = (int) $uid;
		if($uid <= 0) return false;

		$directory = implode("/", array(EXPORTS, date('Y', $time), date('n', $time), date('j', $time), $uid, ''));
		exec("mkdir -p -m 0775 {$directory}");

		return $directory;
	}

}

