<div id="login">
	<div id="buttons">
		<div style="padding: 70px 0 0 20px;">
			<h4>Всем плевать. Но кому-то интересно</h4>
			<h5>Войти с помощью</h5>
			<div class="list">
	    		<div class="ss">
					<a class="waves-effect waves-button waves-float" data-id="vk"><span class="icon icon-vkontakte-rect" ></span> ВКонтакте</a>
					<a class="waves-effect waves-button waves-float" data-id="fb"><span class="icon icon-facebook-rect"  ></span> Facebook</a>
					<a class="waves-effect waves-button waves-float" data-id="gp"><span class="icon icon-googleplus-rect"></span> Google+</a>
				</div>
			</div>
		</div>
	</div>
</div>
<script >
$(function(){
	$('.list .ss a').click(OAuth);
	Waves.displayEffect();
});
</script >

