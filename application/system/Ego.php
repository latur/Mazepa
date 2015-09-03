<?php
class Ego {
	public static $tokenSize = 100; // 20 символов * 5 раз;

	/**
	 * Генерация нового токена, стыковка с предыдущим
	 * Если передать массив данных, к данным будет дописан токен
	 */
	public static function AddToken( $array = false ){
		$key = substr(sha1( uniqid( mt_rand() . microtime() ) ), 1, 18);
		$token = "[$key]" . (@$_SESSION['token'] ? $_SESSION['token'] : '');
		$_SESSION['token'] = substr($token, 0, self::$tokenSize);
		if (is_array($array)) {
			$array['token'] = $key;
			return $array;
		}
		return $key;
	}

	/**
	 * Проверка токена
	 */
	public static function CheckToken(){
		$token = @$_POST['token'];
		return (strlen($token) != 18 || !strstr(@$_SESSION['token'], "[$token]"));
	}

	/**
	 * Определение IP адреса посетителя
	 */
	public static function IP(){
		if(!empty($_SERVER['HTTP_CLIENT_IP'])){
			$ip = $_SERVER['HTTP_CLIENT_IP'];
		} elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
			$ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
		} else {
			$ip = $_SERVER['REMOTE_ADDR'];
		}
		return $ip;
	}
	
	/**
	 * JSON-заголовки ответа
	 */
	public static function JsHead($data = false){
		header("Access-Control-Allow-Origin: *");  
 		header("HTTP/1.0 200 OK");
		header('Content-type: application/json; charset=utf-8');
		header("Cache-Control: no-cache, must-revalidate");
		header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
		header("Pragma: no-cache");
		if($data) echo json_encode($data);
	}

	/**
	 * Зашифровка
	 */
	public static function Encrypt($string) {
		$key = pack('H*', SECRET);
    	$iv_size = mcrypt_get_iv_size(MCRYPT_RIJNDAEL_128, MCRYPT_MODE_CBC);
    	$iv = mcrypt_create_iv($iv_size, MCRYPT_RAND);
    	$ciphertext = mcrypt_encrypt(MCRYPT_RIJNDAEL_128, $key, $string, MCRYPT_MODE_CBC, $iv);
    	$ciphertext = $iv . $ciphertext;
    	$ciphertext_base64 = base64_encode($ciphertext);
    	return $ciphertext_base64;
	}

	/**
	 * Расшифровка
	 */
	public static function Decrypt($string) {
		$key = pack('H*', SECRET);
    	$str = base64_decode($string);
    	$iv_dec = substr($str, 0, $iv_size);
    	$str = substr($str, $iv_size);
    	return mcrypt_decrypt(MCRYPT_RIJNDAEL_128, $key, $str, MCRYPT_MODE_CBC, $iv_dec);
	}
}
