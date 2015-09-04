<?php
class Stats extends Init {
	/**
	 * Инициализация: список log файлов 
	 */ 
	public function Names($userID = false) {
		$userID = $userID ? $userID : $this->user['id'];
		$list = [ LOG . "u{$userID}.log" ];
		$archive = LOG . "archive/u{$userID}_*";
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
	 * Получение всех log файлов одним txt
	 */ 
	public function Export($code) {
		list($r1, $userID, $r2) = explode('-', Ego::Decrypt($code));
		header("Content-Type:text/plain");
		foreach ($this->Names((int) $userID) as $name) echo file_get_contents($name);
		return true;
	}

	/**
	 * Получение ссылки на log файл
	 */ 
	public function __ExportCode() {
		$code = mt_rand() . '-' . $this->user['id'] . '-' . mt_rand();
		return [ 'code' => Ego::Encrypt($code) ];
	}

	/**
	 * Получение статистики из log файлов 
	 */ 
	public function __Full($export = false) {
		$names = $this->Names();
		$this->data = [];
		$this->data['ip']    = []; // Список IP адресов
		$this->data['refs']  = []; // Список внешних ссылок-источников
		$this->data['local'] = []; // Список внутренних ссылок-источников
		$this->data['dates'] = []; // Разбивка активности по дням
		
		foreach ($names as $name) {
			$content = explode("\n", file_get_contents($name));
			foreach ($content as $line) {
				$e = [];
				if(preg_match('/^([0-9\.]{7,15}) \[([0-9]{2}\/[A-z]{3}\/[0-9]{4})\:([0-9]{2}\:[0-9]{2}\:[0-9]{2}) [0-9\+]{1,11}\] \"(.*)\" [0-9]{1,5} [0-9]{1,11} \"(.*)\" \"(.*)\"$/i', $line, $e)){
					// Всего посетителей (IP):
					if (!@$this->data['ip'][$e[1]]) $this->data['ip'][$e[1]] = 0;
					$this->data['ip'][$e[1]]++;
			
					// Откуда приходят: 
					// Глобальный или локальный реферер:
					if (preg_match('/http[s]{0,1}\:\/\/[a-z0-9\.]{0,256}'.HOST.'\/(.*)$/i', $e[5])) {
						if (!@$this->data['local'][$e[5]]) $this->data['local'][$e[5]] = 0;
						$this->data['local'][$e[5]]++;
					} else {
						if ($e[5] != '-') {
							if (!@$this->data['refs'][$e[5]]) $this->data['refs'][$e[5]] = 0;
							$this->data['refs'][$e[5]]++;
						}
					}
			
					// Даты
					$stamp = strtotime(str_replace("/", " ", $e[2]) . " " . $e[3]);
					if (!@$this->data['dates'][$stamp]) $this->data['dates'][$stamp] = 0;
					$this->data['dates'][$stamp]++;
				}
			}
		}
		
		$combine = function($e){
			asort($e);
			$e = array_reverse($e);
			//$e = array_filter($e, function($t){ return $t[1] > 1; });
			return array_map( function($x, $y){ return [$x, $y]; }, array_keys($e), array_values($e));
		};
		
		$this->data['ip']    = $combine($this->data['ip']);
		$this->data['refs']  = $combine($this->data['refs']);
		$this->data['local'] = $combine($this->data['local']);
		return $this->data;
	}

	/**
	 * Получение конкретного log файла 
	 */ 
	public function __Read() {
		$names = $this->Names();
		$file = @$_POST['name'];
		if (!@$names[$file]) return [ 'data' => 'Not found' ];
		$data = htmlspecialchars(file_get_contents($names[$file]));
		return [ 'data' => $data, 'desc' => $file ];
	}
}