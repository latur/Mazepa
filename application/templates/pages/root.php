<div id="media" class="HideInfo">
	<div id="left">
		<div id="search"><input type="text" class="form-c" placeholder="Поиск по альбомам и галереям" /></div>
		<div id="list"></div>
		<div id="add">
		</div>
		<div class="ctrls">	
			<span class="simptip-position-top simptip-smooth simptip-fade k" data-tooltip="Корзина">
				<div class="icon waves-button"><span class="icon-trash"></span></div>
			</span>
			<span class="simptip-position-top simptip-smooth simptip-fade i" data-tooltip="Загруженные фотографии">
				<div class="icon waves-button"><span class="icon-archive"></span></div>
			</span>
			<span class="simptip-position-top simptip-smooth simptip-fade p" data-tooltip="Персональная страница">
				<div class="icon waves-button"><span class="icon-person"></span></div>
			</span>
		</div>
	</div>
	<div id="right" class="animate"></div>
	<div id="info" class="animate">
		<div class="info">
			<div id="ainfo"></div>
			<div id="one">
				<div id="thumb"></div>
				<div id="colors"></div>
				<div id="name"></div>
				<div id="meta"></div>
				<div id="data"></div>
			</div>
			<div id="multi"></div>
		</div>
		<div class="ctrls">	
			<span class="simptip-position-top simptip-smooth simptip-fade down" data-tooltip="Загрузить фотографии">
				<div class="icon waves-button waves-effect"><span class="icon-up-circled"></span></div>
			</span>
		</div>
		<div class="upload animate">
			<form id="upload" method="post" action="/upload" enctype="multipart/form-data">
				<div id="drop">
					<!-- <a class="close"><span class="icon icon-cancel"></span></a> -->
					<p>Загрузка фотографий:<br/>Перетащите файлы сюда</p>
					<a class="select waves-effect waves-button waves-float">Обзор</a>
					<input type="file" name="files" multiple />
				</div>
				<ul></ul>
			</form>
		</div>
	</div>
</div>

<? /* Шаблоны */ ?>
<div class="template" id="default">
	<div class="new">
		<a class="waves-effect waves-button waves-float U"><span class="icon icon-up-circled"></span> Загрузить фотографии</a>
		<a class="waves-effect waves-button waves-float A"><span class="icon icon-picture"   ></span> Создать альбом</a> 
		<a class="waves-effect waves-button waves-float G"><span class="icon icon-aperture"  ></span> Создать галерею</a> 
	</div>
</div>
<div class="template" id="createGallery">
	<div>
		<p class="previewGURL">Новая галерея</p>
		<p><input type="text" class="form-c" value="" placeholder="Название галереи" /></p>
		<p><input type="text" class="form-c url" value="" placeholder="URL галереи (субдомен)" /></p>
		<p><textarea class="form-c" rows="2" placeholder="Описание галереи"></textarea></p>
	</div>
	<p class="privacy">
		<label for="privacy">Приватность: </label>
		<select name="privacy">
			<option value="3">Опубликована на странице</option>
			<option value="1">По прямой ссылке</option>
			<option value="0">Галерея закрыта</option>
		</select>
	</p>
	<p class="ctrl">
		<a class="waves-button waves-float mini cancel">Отмена</a>
		<a class="waves-button waves-float mini save hide">Сохранить</a> 
	</p>
</div>
<div class="template" id="createAlbum">
	<div>
		<p><input type="text" class="form-c" value="" placeholder="Название альбома" /></p>
		<p><textarea class="form-c" rows="2" placeholder="Описание альбома"></textarea></p>
	</div>
	<p class="privacy">
		<label for="privacy">Приватность: </label>
		<select name="privacy">
			<option value="3">Опубликован на странице</option>
			<option value="2">Открыт</option>
			<option value="1">По прямой ссылке</option>
			<option value="0">Альбом закрыт</option>
		</select>
	</p>
	<p class="ctrl">
		<a class="waves-button waves-float mini cancel">Отмена</a>
		<a class="waves-button waves-float mini save">Сохранить</a> 
	</p>
</div>
<div class="template" id="leftBlock">
	<div class="e {type}" data-id="{id}">
		<div class="border animate privacy-{privacy}"></div>
		<h4><span class="icon icon-{icon}"></span> <b>{title}</b></h4>
		<div class="cog animate"><span class="icon icon-cog"></span></div>
		<p>{desc}</p>
		<!-- <span class="url">{url}</span> -->
	</div>
</div>
<div class="template" id="editAlbumInfo">
	<p><input type="text" class="form-c" value="{url}" placeholder="URL" readonly /></p>
	<div class="sent">
		<p><input type="text" class="form-c" value="{title}" placeholder="Название альбома" /></p>
		<p><textarea class="form-c" rows="3" placeholder="Описание альбома">{desc}</textarea></p>
		<p class="privacy">
			<label for="privacy">Приватность: </label>
			<select name="privacy">
				<option value="3">Опубликован на странице</option>
				<option value="2">Открыт</option>
				<option value="1">По прямой ссылке</option>
				<option value="0">Альбом закрыт</option>
			</select>
		</p>
	</div>
	<p>
		<a id="ViewAlbum" class="select waves-effect waves-button waves-float mini">Просмотр альбома</a>
		<a id="DeleteAlbum" class="select waves-effect waves-button waves-float mini">Удалить</a>
	</p>
	<hr />
	<div class="tags">
		<p>Отметки: </p>
		<div class="list"></div>
		<div class="tagsinput">
			<input type="text" class="form-c" placeholder="Начните писать имя друга" />
			<div class="friendsbox"> <div class="l">Загрузка</div> </div>
		</div>
	</div>
	<hr />
	<div class="qr">{qr}</div>
</div>
<div class="template" id="imageColors">
	<div class="c" style="width:{W}px"><a href="{color}" style="background:#{color}" title="{T}"></a></div>
</div>
<div class="template" id="galleryElement">
	<div class="a-cover" data-id="{id}">
		<div class="img" style="background:#{color}">{img}</div>
		<h3>{title}</h3>
		<a class="del waves-effect waves-button waves-float mini">убрать</a>
	</div>
</div>
<div class="template" id="albumContent">
	<div class="alb">
		<div class="h"><h3>{title}</h3>{option}</div>
		<div id="images"></div>
	</div>
</div>
<div class="template" id="eImage">
	<div class="image" data-id="{id}" style="background-color:#{color}">
		<span class="waves-effect waves-light">{thumb}</span>
	</div>
</div>
<div class="template" id="openImage">
	<div class="view">
		<div class="edit">
			<a class="simptip-position-bottom simptip-smooth simptip-fade D" data-tooltip="Удалить фотографию"><span class="icon icon-trash"></span></a>
			<a class="simptip-position-bottom simptip-smooth simptip-fade L" data-tooltip="Повернуть против часовой стрелки"><span class="icon icon-ccw"></span></a>
			<a class="simptip-position-bottom simptip-smooth simptip-fade R" data-tooltip="Повернуть по часовой стрелке"><span class="icon icon-cw"></span></a>
			<a class="simptip-position-bottom simptip-smooth simptip-fade X" data-tooltip="Выйти из просмотра"><span class="icon icon-cancel"></span></a>
		</div>
		<div class="cnt" style="background:#{color}">
			<img src="" />
			<div class="load"></div>
		</div>
	</div>
</div>
<div class="template" id="exportImages">
	<div class="images-export">
		<p>Оригиналы загруженных файлов:</p>
		<textarea class="form-c" rows="4" placeholder="Описание">{main}</textarea>
		<p>Галерейные версии фотографий:</p>
		<textarea class="form-c" rows="4" placeholder="Описание">{gall}</textarea>
	</div>
	<p class="ctrl">
		<a class="waves-button waves-float mini cancel">Закрыть</a>
	</p>
</div>
<div class="template" id="exportImageInput">
	<p><a target="_blank" href="{src}" class="size">{w} × {h}</a> <span class="url"><input class="form-c" value="{src}"/></span></p>
</div>
<div class="template" id="exportImage">
	<div class="images-export">{inputs}</div>
	<p class="ctrl">
		<a class="waves-button waves-float mini cancel">Закрыть</a>
	</p>
</div>
<div class="template" id="imageMultiSelect">
	<div class="mis">
		<div class="r selcount">Выбрано фотогарфий: {count}</div>
		<div class="th {sclass}">{images}</div>
		<div class="r"><select class="place">{achange}</select></div>
		<div class="c">
			<a class="simptip-position-top simptip-smooth simptip-fade R" data-tooltip="Повернуть «[»"><span class="waves-effect waves-button waves-float mini"><span class="icon icon-ccw"></span></span></a>
			<a class="simptip-position-top simptip-smooth simptip-fade L" data-tooltip="Повернуть «]»"><span class="waves-effect waves-button waves-float mini"><span class="icon icon-cw"></span></span></a>
			<a class="simptip-position-top simptip-smooth simptip-fade D" data-tooltip="Удалить «Backspase»"><span class="waves-effect waves-button waves-float mini"><span class="icon icon-trash"></span></span></a>
			<a class="simptip-position-top simptip-smooth simptip-fade F" data-tooltip="Выбрать все фотографии «F»"><span class="waves-effect waves-button waves-float mini"><span class="icon icon-ok"></span></span></a>
			<a class="simptip-position-top simptip-smooth simptip-fade Q" data-tooltip="Отменить выбор «Q»"><span class="waves-effect waves-button waves-float mini"><span class="icon icon-cancel"></span></span></a>
		</div>
	</div>
</div>
<div class="template" id="eSocial">
	<div class="es">
		<p><span class="icon icon-{icon}-rect"></span> <a class="ext-url" target="_blank" href="{url}"><span class="name">{name}</span></a> </p>
		<a class="del" data-sid="{sid}">Отвязать</a>
	</div>
</div>
<div class="template" id="galleryContent">
	<div class="gallery frame">
		<div class="box">
			<div class="g-albums-dp"></div>
			<div class="g-info">
				<div class="settings f-settings">
					<input class="form-c name" value="{title}" placeholder="Название галереи"/>
					<p class="subdomain">
						<input class="form-c url" value="{url}" placeholder="Субдомен (URL-адрес)"/>
						<span class="domain">.HOST</span>
					</p>
					<textarea class="form-c" rows="3" placeholder="Описание">{desc}</textarea>
					<p class="privacy">
						<label for="privacy">Приватность: </label>
						<select name="privacy">
							<option value="3">Галерея видна на персональной странице</option>
							<option value="1">Галерея доступна прямой ссылке</option>
							<option value="0">Галерея видна только вам</option>
						</select>
					</p>
				</div>
				<div class="helper">
					<p>Перетащите сюда альбомы из панели слева,<br/> чтобы добавить их в галерею</p>
					<a class="delgal waves-effect waves-button waves-float mini">Удалить галерею</a>
				</div>
			</div>
			<div class="g-albums"></div>
			<div class="g-albums-empty">В галерее нет ни одного альбома</div>
		</div>
		<div class="box qr">
		</div>
	</div>
</div>
<div class="template" id="profileContent">
	<div class="pfl frame">
		<div class="box">
			<div class="g-albums-dp"></div>
			<form id="cover-upload" method="post" action="/upload" enctype="multipart/form-data"><input type="file" name="cover" multiple /></form>
			<div class="c">
				{cover}
				<div class="status"><i></i></div>
				<div class="h"><span>Перетащите сюда файл для загрузки обложки к вашей персональной странице</span></div>
			</div>
			<div class="s">
				<div class="lt">
					<p>Ваше полное имя, отображаемое на странице</p>
					<input class="form-c" value="{name}" placeholder="Полное имя"/>
					<p>Логин: ваше краткое имя — URL адрес персональной страницы</p>
					<p class="url">
						<span>.HOST</span>
						<input class="form-c" value="{username}" placeholder="Логин"/>
					</p>
					<p>Подпись</p>
					<textarea class="form-c" rows="3" placeholder="Будет отображаться под вашим именем">{text}</textarea>
				</div>
				<div class="rt">
					<p>Привязанные аккаунты для входа на Мазепу</p>
					<div class="social">{insocial}</div>
					<p>Привязать аккаунт</p>
					<div class="ss">
						<a class="waves-effect waves-button waves-float" href="#" data-id="vk"><span class="icon icon-vkontakte-rect" ></span> ВКонтакте</a>
						<a class="waves-effect waves-button waves-float" href="#" data-id="fb"><span class="icon icon-facebook-rect"  ></span> Facebook</a>
						<a class="waves-effect waves-button waves-float" href="#" data-id="gp"><span class="icon icon-googleplus-rect"></span> Google+</a>
		    		</div>
				</div>
			</div>
			<div class="m"></div>
		</div>
		<div class="box qr">
		</div>
	</div>
</div>
<div class="template" id="contentQR">
	<div class="qr-bottom">{qr}</div>
	<div class="url-bottom"><a href="{url}">{url}</a></div>
</div>
<div class="template" id="contextMenu">
	<div class="background" id="cMenuBG"></div>
	<ul id="cmenu" class="dd-menu"></ul>
</div>
<div class="template" id="myFriend">
	<div class="f" data-sid="{sid}" data-i="{i}">
		<img src="{picture}" />
		<span>{name}</span>
		<a data-sid="{sid}" class="animate"><span class="icon icon-cancel"></span></a>
	</div>
</div>

<? /* [END] Шаблоны */ ?>

<link href="/cache/@root.css" rel="stylesheet" type="text/css">
