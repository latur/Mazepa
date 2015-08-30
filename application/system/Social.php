<?php
// Схема авторизации OAuth:
// -> переход посетителем по ссылке к приложению в соц.сети
// -> получение прав приложением -> код авторизации на сайт
// -> получение TOKEN'а по коду авторизации
// -> проверка TOKEN'а -> успех

class Social {

	// ---------------------------------------------------------------------- //
	public static function Init(){
		if (@$_GET['type'] == 'fb') return self::Fb();
		if (@$_GET['type'] == 'vk') return self::Vk();
		if (@$_GET['type'] == 'gp') return self::Gp();
		return false;
	}

	// ---------------------------------------------------------------------- //
	// Вконтакте
	private static function Vk(){
		if(@$_GET['code'] == null || @$_GET['type'] == null) return false;
		
		// Получение token'а
		$request = [
			'client_id'     => vkID, 
			'client_secret' => vkCD, 
			'code'          => $_GET['code'], 
			'redirect_uri'  => URLOAUTH . 'vk'
		];
		$data = json_decode( @ file_get_contents( 'https://oauth.vk.com/access_token?' . http_build_query($request)));
		if( @!$data->access_token ) die('<pre>Error#1');
		
		// Проверка token'а
		$req = "https://api.vk.com/method/users.get?uid={$data->user_id}&fields=first_name,last_name,sex,photo,photo_big&access_token={$data->access_token}";
		$info = json_decode( @ file_get_contents( $req ) );
		if(@$info->response[0]->uid != $data->user_id) die('<pre>Error#2');
		
		// Экспорт
		return [
			':sid'     => 'vk' . $data->user_id,
			':token'   => $data->access_token,
			':name'    => htmlspecialchars( $info->response[0]->first_name . ' ' . $info->response[0]->last_name ),
			':image'   => $info->response[0]->photo_big,
			':picture' => $info->response[0]->photo,
			':date'    => date('Y-m-d H:i:s')
		];
	}
	// ---------------------------------------------------------------------- //
	// Facebook
	private static function Fb(){
		$request = [
			'client_id'     => fbID, 
			'client_secret' => fbCD, 
			'code'          => $_GET['code'], 
			'redirect_uri'  => URLOAUTH . 'fb'
		];
		$data = json_decode( @file_get_contents( 'https://graph.facebook.com/v2.3/oauth/access_token?' . http_build_query($request)));
		if( @!$data->access_token ) die('<pre>Error#1');
		
		$token = $data->access_token;
		
		// Проверка token'а
		$userinfo = json_decode( @ file_get_contents('https://graph.facebook.com/me?fields=picture.width(160).height(160),picture.width(80).height(80),name&access_token=' . $token) );
		$photo = json_decode( @ file_get_contents('https://graph.facebook.com/me?fields=picture.width(160).height(160)&access_token=' . $token) );
		
		if(!isset($userinfo->picture) || !isset($photo->picture)) die('<pre>f#2');
		
		// Экспорт
		return [
			':sid'     => 'fb' . $userinfo->id,
			':token'   => $token,
			':name'    => htmlspecialchars( $userinfo->name ),
			':image'   => $photo->picture->data->url,
			':picture' => $userinfo->picture->data->url,
			':date'    => date('Y-m-d H:i:s')
		];
	}
	// ---------------------------------------------------------------------- //
	// Gplus
	private static function Gp(){
		// Получение token'а
		$postdata = http_build_query([
			'code' => $_GET['code'],
			'client_id' => gpID,
			'client_secret' => gpCD,
			'redirect_uri' => URLOAUTH . 'gp',
			'grant_type' => 'authorization_code'
		]);
		$opts = ['http' => [ 
			'method'  => 'POST', 
			'header'  => 'Content-type: application/x-www-form-urlencoded', 
			'content' => $postdata
		]];
		$context  = stream_context_create($opts);
		$result = json_decode( @ file_get_contents('https://accounts.google.com/o/oauth2/token', false, $context) );

		if(!isset($result->access_token)) die('<pre>' . self::errormsg);
		$info = json_decode( @ file_get_contents('https://www.googleapis.com/plus/v1/people/me?access_token=' . $result->access_token));
		if(!isset($info->displayName) || !isset($info->id)) die('<pre>' . self::errormsg);

		// Экспорт
		return [
			':sid'     => 'gp' . $info->id,
			':token'   => $result->access_token,
			':name'    => htmlspecialchars( $info->displayName ),
			':image'   => str_replace('?sz=50', '?sz=200', $info->image->url),
			':picture' => $info->image->url,
			':date'    => date('Y-m-d H:i:s')
		];
	}

	// ---------------------------------------------------------------------- //
	public static function Friends($id, $token, $type){
		$users = [];
		if ($type == 'vk') {
			$req  = "https://api.vk.com/method/friends.get?user_id={$id}&fields=first_name,last_name,photo,photo_big";
			$info = json_decode( @ file_get_contents( $req ) );
			if(@$info->response) {
				foreach ($info->response as $u) {
					$users[] = [
						':sid'     => 'vk' . $u->user_id,
						':name'    => htmlspecialchars( $u->first_name . ' ' . $u->last_name ),
						':image'   => $u->photo_big,
						':picture' => $u->photo,
					];
				}
			}
		}
		if ($type == 'fb') {
			echo('<pre>');
			$req  = 'https://graph.facebook.com/v2.3/me/friends?fields=name,first_name&access_token=' . $token;
			$info = json_decode( @ file_get_contents( $req ) );
			if (@$info->data) {
				foreach ($info->data as $u) {
					$users[] = [
						':sid'     => 'fb' . $u->id,
						':name'    => htmlspecialchars( $u->name ),
						':image'   => 'http://graph.facebook.com/'. $u->id . '/picture?type=large',
						':picture' => 'http://graph.facebook.com/'. $u->id . '/picture',
					];
				}
			}
		}
		return $users;
	}

}

