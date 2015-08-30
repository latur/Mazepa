var host     = 'mazepa.us';
var hard     = '//hard.mazepa.us';
var token    = token || '';
var api      = api   || '/root/library/'

function ivEncodeEntities(s){ return $("<div/>").text(s).html(); }
function ivDecodeEntities(s){ return $("<div/>").html(s).text(); }
// -------------------------------------------------------------------------- //
// Вписка списка миниатюрок в заданный размер окна
function FixWidth(container, child, imgsize, margin){
	var img = imgsize || 80;
	var margin = margin || 0;
	$(container).each(function(){
		// Элемент, ширина, дочерние
		var e = $(this), w = e.width() - 1, t = e.find(child);
		// Слишком мало, ничего не делать
		var inline = parseInt(w / img) + 1;
		if(inline > t.length) return true;
		// Выравнивание ряда
		var size = w/inline - margin * 2;
		t.css({ width : size + 'px', height : size + 'px' });
		// Один или два ряда снимков: 
		e.css({ minHeight : (size * parseInt(t.length/inline)) - 1 });
	});
	console.log('Выровнено! =)');
}

// -------------------------------------------------------------------------- //
// !# Запросы к медиатеке 
// !Library(method, data, action)
var Library = (function(token, api){
	// var url = '/root/library/';
	var connection = false;
	return function(method, data, action){
		if (connection) {
			console.log('> Множественные запросы запрещены');
			return ;
		}
		connection = true;
		$.post( api + method, $.extend({token : token}, data || {}), function(e){
			connection = false;
			if (typeof(e) === "object"){
				token = e.token || false;
				if (!token) {
					console.log('> Ошибка: token не найден');
					//location.reload();
				}
				if (typeof(action) === "function") (action)(e);
				return ;
			}
			console.log('> Некорректен формат ответа сервера');
		}, "json");
	};
}(token, api));

// !# Шаблонизация
// !Templates(id, data)
var Templates = (function(selector){
	var html = {};
	$(selector).each(function(){
		html[ $(this).attr('id') ] = $(this).remove().html();
	});
	return function(id, data){
		var data = data || {};
		var H = html[id] || '';
		for (var i in data){
			var find = new RegExp("{" + i + "}", "g");
			H = H.replace(find, data[i]);
		}
		return H;
	};
}('.template'));

// !# Модальное окно
// !Modal
var Modal = (function(selector){
	var Close = function(){
		$('.msg, .black').remove();
		return false;
	};
	var Open = function(content, actions, width){
		$('body').append('<div class="black"></div><div class="box msg"></div>');
		var width = parseInt(width || 300);
		if (width < 100) width = 300;
		if (width > $(window).width() - 40) width = $(window).width() - 40;
		
		$('.black').click(Close).fadeIn(300);
		var Box = $('.msg')
			.append(content || '<h2>Modal</h2>')
			.addClass('animation-jelly');
		Box.css({ width : width, marginLeft : - width/2, top : '50%', marginTop : - Box.height()/2 - 15 });
		(actions || function(e){})( Box );
	};
	return {
		'Open' : Open,
		'Close' : Close
	};
}());

// !# Размер вписываемого изображения
// !Picture
var Picture = (function(){
	// Размер картинки вписан в её URL
	var Size = function(src){
		if (!src) return [0,0];
		var ende = src.split('.').slice(-2,-1)[0];
		var preende = src.split('.').slice(-3,-2)[0];
		var e = ((ende.indexOf('x') >= 0) ? ende : preende).split('x');
		var wh = [ e[0] || 1, e[1] || 1 ];
		return wh;
	};
	// Картинка считается хорошей, если она больше окна
	var IsGood = function(src){
		var wh = Size(src);
		return (wh[0] > $(window).width() || wh[1] > $(window).height());
	};
	// Поиск подходящего размера картинки
	var Src = function(data){
		if (data.src_small  && IsGood(data.src_small))  return hard + data.src_small;
		if (data.src_medium && IsGood(data.src_medium)) return hard + data.src_medium;
		if (data.src_large  && IsGood(data.src_large))  return hard + data.src_large;
		return hard + data.src_main;
	};
	// Вписка картинки в окошко
	var CSS = function(data){
		var imgsize = Size( Src(data) );
	    // Текущие параметры картинки
	    var I = { 'W' : imgsize[0] || 1, 'H' : imgsize[1] || 1, 'padding' : imgsize[2] || 0 }, p = I.W / I.H;
	    // Параметры окна
	    var W = { 'W' : $(window).width(), 'H' : $(window).height() };
	    // Заготовка CSS
	    var css = { top : 0, left : 0, height : I.H, width : I.W };
	    // Пропорция: P — горизонтальность
	    var P = p > ( W.W / (W.H - I.padding) );
	    // Если картинка не на много меньше экрана, растягивать её
	    if(I.W * 1.5 > W.W || I.H * 1.5 > W.H){
	    	if(P) css.height = (W.W / p), css.width = W.W; else css.width = (W.H - I.padding) * p, css.height = W.H - I.padding;
	    }
	    // Отступы - центрирование
	    css.top  = (W.H - I.padding - (css.height || I.H))/2;
	    css.left = (W.W - (css.width || I.W))/2;
	    return css;
	};
	return {
		'Src'  : Src,
		'CSS'  : CSS,
		'Size' : Size
	}
}());

// !# Отложенные действия
// !Stack
var Stack = (function(){
	var actions = {};
	return function(act, timer){
		if (!act) return;
		var ID = act.toString();
		if(actions[ID]) clearInterval(actions[ID]['timeout']);
		actions[ID] = {'timer' : timer || 500 };
		actions[ID]['timeout'] = setInterval(function(){
			if (actions[ID]['timer'] > 0) {
				return actions[ID]['timer'] -= 50;
			}
			clearInterval(actions[ID]['timeout']);
			act();
		}, 50);
	}
}());

// !# Авторизация по протоколу OAuth
// !OAuth
var OAuth = (function(){
	var self = 'https://' + host + '/login/oauth?type=';
	var url = {
		'vk' : [
			'https://oauth.vk.com/authorize?client_id=4560732',
			'display=popup',
			'scope=friends',
			'redirect_uri='+self+'vk',
			'response_type=code' 
		].join('&'),
		'fb' : [
			'https://www.facebook.com/dialog/oauth?client_id=198760110163592',
			'display=popup',
			'redirect_uri='+self+'fb' 
		].join('&'),
		'gp' : [
			'https://accounts.google.com/o/oauth2/auth?client_id=183366446733-u0in3boluil3n9lhqv66g5p63lm52onf.apps.googleusercontent.com',
			'response_type=code',
			'scope=openid',
			'redirect_uri='+self+'gp' 
		].join('&'),
	};
	var Init = function(id){
		if ($(this).data('id')) id = $(this).data('id');
		if(!url[id]) return false;
		var options = 'status=1,width=600,height=420,location=0,menubar=0,centerscreen=yes';
		var win = window.open(url[id], 'OAuth', options), 
			tmp = window.location.hostname.split('.');
		setInterval(function(){
			if (win.location.hash.indexOf('success') != -1){ location.reload(); win.close(); }
		}, 400);
		
		// var h = (tmp.length == 3) ? window.location.protocol + '//' + tmp.slice(1).join('.') : window.location.origin;
		// setInterval(function(){ win.postMessage(window.location.origin, h); }, 300);
	};
	return Init;
}());

// -------------------------------------------------------------------------- //
$(function(){
	var Height = function(){ $("#main").css({ minHeight : $(window).height() - 38 }); };
	$(window).resize(Height);
	Height();

	var Login = function() {
		Modal.Open( Templates('loginModal'), function(){ 
			$('.list .ss a').click(OAuth);
		}, 400);
	};
	
	$(".login").click(Login);
});




















