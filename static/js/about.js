$(document).ready( function() {
	var slider = $.fn.fsvs({
		speed : 700,
		bodyID : 'fsvs-body',
		selector : '> .slide',
		mouseSwipeDisance : 40,
		mouseWheelEvents : true,
		mouseWheelDelay : false,
		mouseDragEvents : true,
		touchEvents : true,
		arrowKeyEvents : true,
		pagination : true,
		nthClasses : false,
		detectHash : true
	});
	$('#footer').css({ display : 'none' });
	$('.next a.down').click(function(){ slider.slideDown(); });
	$('.next a.autore').click(function(){ 
		Modal.Open(Templates('autore'), function(){
			$('a.close').click(Modal.Close);
		}, 460);
	});
	
	(function(){
		var imgliska = document.querySelector('.liska__back--mover');
		var win = { width: window.innerWidth, height: window.innerHeight };
		var init = false;
		var xVal = 0, yVal = 0, transX = 0, transY = 0, transZ = 0;

		window.addEventListener('mousemove', function(ev){
			xVal = -1/(win.height/2)*ev.clientY + 1,
			yVal = 1/(win.width/2)*ev.clientX - 1,
			transX = 20/(win.width)*ev.clientX - 10,
			transY = 20/(win.height)*ev.clientY - 10,
			transZ = 100/(win.height)*ev.clientY - 50;
		});
		
		setTimeout(function(){
			init = true;
		}, 200)
		
		setInterval(function(){
			if (!init) return;
			imgliska.style.WebkitTransform = 'perspective(1000px) translate3d(' + transX + 'px,' + transY + 'px,' + transZ + 'px) rotate3d(' + xVal + ',' + yVal + ',0,2deg)';
			imgliska.style.transform = 'perspective(1000px) translate3d(' + transX + 'px,' + transY + 'px,' + transZ + 'px) rotate3d(' + xVal + ',' + yVal + ',0,2deg)';
		}, 100);
	}());
	
	$('body').append('<link href="/static/css/about.css" rel="stylesheet" type="text/css">');
});
Waves.displayEffect();
