<div class="page">
	<? if ($this->user['level'] > 0){ ?>
	<div class="switch">
		<a href="/" class="animate s current" data-act="remove">Лента</a>
		<a href="" class="animate s" data-act="add">Закладки/Отметки</a>
	</div>
	<? } ?>
	<div class="main animate">
		<div class="feed">
			<h2>Что посмотреть:</h2>
			<div id="stream"></div>
			<a class="more waves-effect waves-button waves-float mini">Далее</a>
		</div>
		<? if ($this->user['level'] > 0){ ?>
		<div class="swithed">
		<div class="alist bookmarks">
			<h2>Мои закладки:</h2>
			<div class="bookmarksArea area">
				<div class="boxed list animate"></div>
			</div>
		</div>
		<div class="alist tags">
			<h2>Вы отмечены:</h2>
			<div class="tagsArea area">
				<div class="boxed list animate"></div>
			</div>
		</div>
		</div>
		<? } ?>
	</div>
</div>

<div class="template" id="albumElement">
	<div class="item animate boxed">
		<div class="cover">
			<a title="{title}" href="{url}">{img}</a>
		</div>
		<div class="data">
			<a class="owner animate" href="/{username}">
				{pict}
				<span>{name}</span>
			</a>
			<h3>{title}</h3>
			<p>{desc}</p>
			<div class="points">{points}</div>
		</div>
	</div>
</div>

<div class="template" id="bookmarkElement">
	<div class="bm">
		<div class="album">
			<span class="icon icon-{icon}"></span>
			<h4><a class="animate" href="/albums/{id32}">{title}</a></h4>
			<a class="animate" href="/albums/{id32}"><p>{desc}</p></a>
			<small>Автор: <a class="animate" href="/{username}">{author} </a></small>
			<a data-aid="{id}" class="animate delete"><span class="icon icon-cancel"></span></a>
		</div>
	</div>
</div>

<div class="template" id="tagsEmpty">
	<p>Если вас отметят в альбоме, этот альбом пренепременно отобразится здесь</p> 
</div>
<div class="template" id="bookmarksEmpty">
	<p>В ваших закладках категорически ничего нет.</p> 
	<p>Чтобы сохранять альбомы в закладки, нажимайте на иконку <span class="icon icon-bookmark"></span> в правом верхнем углу альбома.</p> 
	<p>Все сохранённые альбомы будут доступны здесь</p> 
</div>


<script>
	var api = '/api/';
	var events = <?=json_encode($data['events'])?>;
	var bookmarks = <?=json_encode($data['bookmarks'])?>;
	var tags = <?=json_encode($data['tags'])?>;
</script>
