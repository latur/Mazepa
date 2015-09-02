<?php
class Stats extends Init {
	/**
	 * Инициализация: список log файлов 
	 */ 
	public function Names() {
		$list = [ LOG . "u{$this->user['id']}.log" ];
		$archive = LOG . "archive/u{$this->user['id']}_*";
		exec("ls $archive", $list);
		
		$select = [];		
		foreach ($list as $fn) {
			$name = end(explode("/", $fn));
			if (stristr($name, '_')) {
				$tmp = explode('_', $name);
				$name = 'Archive ' . date("Y-m-d", substr($tmp[1], 0, 10)) . ' ' . substr($tmp[1], 10);
			}
			$select[$name] = $fn;
		}
		return $select;
	}

	/**
	 * Получение всех log файлов 
	 */ 
	public function Export() {
	}

	/**
	 * Получение статистики из log файлов 
	 */ 
	public function __Overview() {
		$names = $this->Names();
		$ip    = [];
		$refs  = [];
		$local = [];
		$dates = [];
		
		foreach ($names as $name) {
			$content = explode("\n", file_get_contents($name));
			foreach ($content as $line) {
				$e = [];
				if(preg_match('/^([0-9\.]{7,15}) \[([0-9]{2}\/[A-z]{3}\/[0-9]{4})\:([0-9]{2}\:[0-9]{2}\:[0-9]{2}) [0-9\+]{1,11}\] \"(.*)\" [0-9]{1,5} [0-9]{1,11} \"(.*)\" \"(.*)\"$/i', $line, $e)){
					// Всего посетителей (IP):
					if (!@$ip[$e[1]]) $ip[$e[1]] = 0;
					$ip[$e[1]]++;

					// Откуда приходят: 
					// Глобальный или локальный реферер:
					if (preg_match('/http[s]{0,1}\:\/\/[a-z0-9\.]{0,256}'.HOST.'\/(.*)$/i', $e[5])) {
						if (!@$local[$e[5]]) $local[$e[5]] = 0;
						$local[$e[5]]++;
					} else {
						if ($e[5] != '-') {
							if (!@$refs[$e[5]]) $refs[$e[5]] = 0;
							$refs[$e[5]]++;
						}
					}
					
					// Даты
					$stamp = strtotime(str_replace("/", " ", $e[2]) . " " . $e[3]);
					if (!@$dates[$stamp]) $dates[$stamp] = 0;
					$dates[$stamp]++;

				}
			}
		}
		
		$combine = function($e){
			asort($e);
			$e = array_reverse($e);
			return array_map( function($x, $y){ return [$x, $y]; }, array_keys($e), array_values($e));
		};
		return [
			'refs' => $combine($refs),
			'local' => $combine($local),
			'ip' => $combine($ip),
			'dates' => $dates
		];
	}

	/**
	 * Получение конкретного log файла 
	 */ 
	public function __Read() {
		$names = $this->Names();
		$file = @$_POST['name'];
		if (!@$names[$file]) return [ 'data' => 'Not found' ];
		$data = htmlspecialchars(file_get_contents($names[$file]));
		return ['data' =>  $data];
	}
	
	
	// SECRET
	
}