<?php
class Text {
	// Удаление повторяющихся переносов строк, пробелов
	public static function Clear($str){
		$str = strip_tags( $str );
		$str = preg_replace('/\\n{2,}|\\r{2,}/', "\n", $str);
		$str = preg_replace('/ {2,}/', ' ', $str);
		return htmlspecialchars($str);
	}

	// Запрет переносов строк
	public static function Inline($str, $maxlen = 0){
		$str = self::Clear( $str );
		$str = preg_replace('/\\n/', '', $str);
		return $maxlen > 0 ? mb_substr($str, 0, $maxlen) : $str;
	}
	
	// Обрамление ссылок в тэг a 
	public static function Href($str, $attr = ' target="_blanc"'){
		$str = preg_replace('@(https?://([-\w\.]+)+(:\d+)?(/([-\w/_\.]*(\?\S+)?)?)?)@', '<a href="$1"'.$attr.'>$1</a>', $str);
		return $str;
	}

	// Замена переносов на <br/>
	public static function Br($str){
		$str = str_replace("\n", '<br/>', $str);
		return $str;
	}
	
	// Текст
	public static function Simple($str){
		return self::Br( self::Href( $str ) );
	}
	
}