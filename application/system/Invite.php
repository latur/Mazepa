<?php
class Invite {
	// Генерачим картинку-приглашение:
	public static function Generate($filename = false, $W = 365){
		// http://www.imagemagick.org/Usage/canvas/
		$name = '/tmp/invite-' . rand() . '.png';
		$H = round($W/sqrt(2));

		// Плазма + закрутка + сегменты
		$swirl = rand(-50,-100);
		exec("/usr/bin/convert -size {$W}x{$H} plasma:white-red -blur 0x2 -swirl {$swirl} -background black -paint 3 {$name}");
		// Понтовое размытие
		//exec("/usr/bin/convert {$name} \( +clone -blur 0x5 \) -compose Lighten -composite {$name}");
		// Апертура
		$ap = '/home/mathilde/www/mazepa.us/client/img/aperture.png';
		exec("/usr/bin/composite -gravity center {$ap} {$name} {$name}");
		// Текст
		$num = rand() . rand();
		exec("/usr/bin/convert {$name} -gravity southwest -annotate +12+9 '{$num}' {$name}");
		// Рамка
		exec("/usr/bin/convert {$name} -splice 1x1+5+5 -splice 1x1+".($W-4)."+".($H-4)." {$name}");
		// Размытие
		exec("/usr/bin/convert {$name} -blur 0x2 {$name}.blur");
		// Наложение размытой на исходную с прозрачностью
		// http://www.imagemagick.org/Usage/compose/
		exec("/usr/bin/composite -dissolve 60 -gravity South {$name} {$name}.blur -alpha Set {$name}");
		// Результат в файл или в base64
		if($filename) copy($name, $filename);
		return 'data:image/png;base64,' . base64_encode(file_get_contents($name));
	}

	public static function ImageHash($filename){
		if(!file_exists($filename)) return false;
		$name = '/tmp/invite-' . rand() . '.png';
		// Уменьшить
		exec("/usr/bin/convert {$filename} -resize 12x12\! {$name}");
		//echo "<img src='".'data:image/png;base64,' . base64_encode(file_get_contents($name))."'>";
		// Маска
		//exec("/usr/bin/convert {$name} -convolve 1,1,1,0,0,0,-1,-1,-1 -fx \"abs(u)\" {$name}");
		//echo "<img src='".'data:image/png;base64,' . base64_encode(file_get_contents($name))."'>";
		// В Ч-Б и извлечь значения все
		exec("/usr/bin/convert {$name} -colorspace gray -compress none -depth 8 PGM:-", $matrix);
		// Первые три строки - информация: 
		$e = explode(' ', implode(' ', array_slice($matrix, 2)));
		// Округляем значения, чтобы поместить их в интервал 0-9
		$k = array_map(function($i){ return round($i * 9 / 255); }, $e);
		// Разбиваем на строки, извлекаем только центральные значения
		//$t = array_map(function($a){ return substr(implode('', $a), 2, 8); }, array_chunk($k, 12));
		$t = $k;
		// Готово!
		// Первая строка малоинформативна, как и вторая, отрезаем
		return implode('', $t);
	}

	public static function HashFile($file){
		// Если картинка не золотого сечения или огромна, нужно лесом слать
		$info = getimagesize($file);
		if($info[0] > 400) return false;
		if(abs($info[0] - $info[1] * sqrt(2)) > 10) return false;

		// Проверяем хэш 
		return self::ImageHash($file);
	}

	// Разность считаем меж числами смежными
	public static function Distance($X, $Y){
		$distance = 0;
		for($i = 0; $i < strlen($X); $i++) $distance += (int) @$X[$i] - (int) @$Y[$i];
		return $distance;
	}
}
