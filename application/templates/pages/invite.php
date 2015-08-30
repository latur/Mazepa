<div class="page">
	<div id="in">
		<div id="social" class="group">
			<h2 class="myname">
				<div class="guest-img inset" style="background-image:url('<?=$this->user['picture']?>')"></div>
				<?=$this->user['name']?>
			</h2>
			<h3>Войти с приглашением</h2>
			<p>Желаете публиковать на Мазепе произведения своего фотоискусства?<br/>
			Тогда вам стоит выпросить приглашение у любого, имеющего здесь аккаунт.</p>
			<p>Приглашение — своеобразная картинка.</p>
			<form id="upload" method="post" action="/upload" enctype="multipart/form-data">
				<div id="drop">
					<p>Перетащите сюда вашу картинку-приглашение</p>
					<a class="select waves-effect waves-button waves-float mini">Обзор</a>
					<input type="file" name="invite" multiple />
				</div>
			</form>
		</div>
	</div>
</div>
