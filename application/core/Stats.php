<?php
class Stats extends Init {
	/**
	 * Инициализация: список log файлов 
	 */ 
	public function Filenames() {
		$list = [ LOG . "u{$this->user['id']}.log" ];
		$archive = LOG . "archive/u{$this->user['id']}_*";
		exec("ls $archive", $list);
		return $list;
	}

	/**
	 * Получение конкретного log файла 
	 */ 
	public function __GetFile() {
		$list = [ LOG . "u{$this->user['id']}.log" ];
		$data = htmlspecialchars(file_get_contents($list[0]));
		return ['data' =>  $data];
	}
	
	
	
}