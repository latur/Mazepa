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





















/*!
 * Waves v0.4.2
 * https://publicis-indonesia.github.io/Waves
 *
 * Copyright 2014 Publicis Metro Indonesia, PT. and other contributors
 * Released under the BSD license
 * https://github.com/publicis-indonesia/Waves/blob/master/LICENSE
 */

;(function(window) {
    'use strict';

    var Waves = Waves || {};
    var $$ = document.querySelectorAll.bind(document);

    // Find exact position of element
    function position(obj) {

        var left = 0;
        var top = 0;
        
        if (obj.offsetParent) {
            do {
                left += obj.offsetLeft;
                top += obj.offsetTop;
            } while (obj = obj.offsetParent);
        }

        return {
            top: top, 
            left: left
        };
    }

    function convertStyle(obj) {

        var style = '';

        for (var a in obj) {
            if (obj.hasOwnProperty(a)) {
                style += (a + ':' + obj[a] + ';');
            }
        }

        return style;
    }

    var Effect = {

        // Effect delay
        duration: 500,

        show: function(e) {

            var el = this;

            // Create ripple
            var ripple = document.createElement('div');
            ripple.className = ripple.className + 'waves-ripple';
            el.appendChild(ripple);

            // Get click coordinate and element witdh
            var pos         = position(el);
            var relativeY   = (e.pageY - pos.top);
            var relativeX   = (e.pageX - pos.left);
            var width       = el.clientWidth * 1.4;

            // Attach data to element
            ripple.setAttribute('data-hold', Date.now());
            ripple.setAttribute('data-x', relativeX);
            ripple.setAttribute('data-y', relativeY);

            // Set ripple position
            var rippleStyle = {
                'top': relativeY+'px',
                'left': relativeX+'px'
            };
            
            ripple.className = ripple.className + ' waves-notransition';
            ripple.setAttribute('style', convertStyle(rippleStyle));
            ripple.offsetHeight;
            ripple.className = ripple.className.replace('waves-notransition', '');

            rippleStyle['border-width'] = width+'px';
            rippleStyle['margin-top']   = '-'+width+'px';
            rippleStyle['margin-left']  = '-'+width+'px';
            rippleStyle['opacity']      = '1';

            rippleStyle['-webkit-transition-duration'] = Effect.duration + 'ms';
            rippleStyle['-moz-transition-duration']    = Effect.duration + 'ms';
            rippleStyle['-o-transition-duration']      = Effect.duration + 'ms';
            rippleStyle['transition-duration']         = Effect.duration + 'ms';

            ripple.setAttribute('style', convertStyle(rippleStyle));

        },

        hide: function(e) {
            
            var el = this;

            var width = el.clientWidth * 1.4;
            
            // Get first ripple
            var ripple = null;

            for (var a = 0; a < el.children.length; a++) {
                if (el.children[a].className.indexOf('waves-ripple') !== -1) {
                    ripple = el.children[a];
                    continue;
                }
            }

            if (!ripple) {
                return false;
            }

            var relativeX   = ripple.getAttribute('data-x');
            var relativeY   = ripple.getAttribute('data-y');

            // Get delay beetween mousedown and mouse leave
            var diff = Date.now() - Number(ripple.getAttribute('data-hold'));
            var delay = 500 - diff;

            if (delay < 0) {
                delay = 0;
            }

            // Fade out ripple after delay
            setTimeout(function() {

                var style = {
                    'top': relativeY+'px',
                    'left': relativeX+'px',
                    'border-width': width+'px',
                    'margin-top': '-'+width+'px',
                    'margin-left': '-'+width+'px',
                    'opacity': '0',

                    // Duration
                    '-webkit-transition-duration': Effect.duration + 'ms',
                    '-moz-transition-duration': Effect.duration + 'ms',
                    '-o-transition-duration': Effect.duration + 'ms',
                    'transition-duration': Effect.duration + 'ms',
                };

                ripple.setAttribute('style', convertStyle(style));

                setTimeout(function() {

                    try {
                        el.removeChild(ripple);
                    } catch(e) {
                        return false;
                    }

                    
                }, 300);

            }, delay);

        },

        // Little hack to make <input> can perform waves effect
        wrapInput: function(elements) {

            for (var a = 0; a < elements.length; a++) {

                var el = elements[a];

                if (el.tagName.toLowerCase() === 'input') {

                    var parent = el.parentNode;

                    // If input already have parent just pass through
                    if (parent.tagName.toLowerCase() === 'i' && parent.className.indexOf('waves-effect') !== -1) {
                        return false;
                    }

                    // Put element class and style to the specified parent
                    var wrapper = document.createElement('i');
                    wrapper.className = el.className + ' waves-input-wrapper';

                    var elementStyle = el.getAttribute('style');
                    var dimensionStyle = 'width:'+el.offsetWidth+'px;height:'+el.clientHeight+'px;';

                    if (!elementStyle) {
                        elementStyle = '';
                    }

                    wrapper.setAttribute('style', dimensionStyle+elementStyle);
                    
                    el.className = 'waves-button-input';
                    el.removeAttribute('style');

                    // Put element as child
                    parent.replaceChild(wrapper, el);
                    wrapper.appendChild(el);

                }
                
            }
        }
    };

    Waves.displayEffect = function(options) {

        options = options || {};

        if ('duration' in options) {
            Effect.duration = options.duration;
        }
        
        //Wrap input inside <i> tag
        Effect.wrapInput($$('.waves-effect'));

        Array.prototype.forEach.call($$('.waves-effect'), function(i) {
            
            if (window.Touch) {
                i.addEventListener('touchstart', Effect.show, false);
                i.addEventListener('touchend', Effect.hide, false);
            }

            i.addEventListener('mousedown', Effect.show, false);
            i.addEventListener('mouseup', Effect.hide, false);
            i.addEventListener('mouseleave', Effect.hide, false);

        });

    };

    window.Waves = Waves;

})(window);
/*!
* 	FSVS - Full Screen Vertical Scroller
* 	https://github.com/lukesnowden/FSVS
* 	Copyright 2014 Luke Snowden
* 	Released under the MIT license:
* 	http://www.opensource.org/licenses/mit-license.php
*/

;( function($){

	$.fn.fsvs = function( options ) {

		options = options || {};

		/**
		 * [defaults description]
		 * @type {Object}
		 */

		var defaults = {
			speed : 5000,
			bodyID : 'fsvs-body',
			selector : '> .slide',
			mouseSwipeDisance : 40,
			afterSlide : function(){},
			beforeSlide : function(){},
			endSlide : function(){},
			mouseWheelEvents : true,
			mouseWheelDelay : false,
			mouseDragEvents : true,
			touchEvents : true,
			arrowKeyEvents : true,
			pagination : true,
			nthClasses : false,
			detectHash : true
		};

		for( var i in options ) {
			defaults[i] = options[i];
		}
		options = defaults;

		/**
		 * [currentSlideIndex description]
		 * @type {Number}
		 */

		var currentSlideIndex = 0;

		/**
		 * [ignoreHashChange description]
		 * @type {Boolean}
		 */

		var ignoreHashChange = false;

		/**
		 * [bodyTimeout description]
		 * @type {[type]}
		 */

		var bodyTimeout = null;

		/**
		 * [body description]
		 * @type {[type]}
		 */

		var body = null;

		/**
		 * [scrolling description]
		 * @type {Boolean}
		 */

		var scrolling = false;

		/**
		 * [mouseWheelTimer description]
		 * @type {Boolean}
		 */

		var mouseWheelTimer = false;

		/**
		 * [mouseWheelScrollStart description]
		 * Indicates when the mouseWheel last invoked a slide event.
		 * @type {Integer}
		 */

		var mouseWheelScrollStart = 0;

		/**
		 * [pagination description]
		 * @type {Boolean}
		 */

		var pagination = false;

		/**
		 * [isChrome description]
		 * @reference http://stackoverflow.com/questions/4565112/javascript-how-to-find-out-if-the-user-browser-is-chrome
		 * @return {Boolean} [description]
		 */

		var isChrome = function() {
			var isChromium = window.chrome,
			    vendorName = window.navigator.vendor;
			if( isChromium !== null && vendorName === "Google Inc." ) {
			   return true;
			}
			return false;
		};

		/**
		 * [changeViaHash description]
		 * @return {[type]} [description]
		 */

		var changeViaHash = function() {
			if( ! ignoreHashChange ) {
				if( window.location.hash !== '' ) {
					var slideID = window.location.hash;
					var slideTo = $( '> ' + slideID, body );
					app.slideToIndex( slideTo.index() );
				}
			}
			ignoreHashChange = false;
		};

		/**
		 * [detectHash description]
		 * @return {[type]} [description]
		 */

		var detectHash = function(){
			$( options.selector, body ).each( function( i ) {
				var slide = $(this);
				if( ! slide.attr( 'id' ) ) {
					slide.attr( 'id', 'slide-' + (i+1) );
				}
			});
			changeViaHash();
		};

		/**
		 * [hasTransition description]
		 * @return {Boolean} [description]
		 */

		var hasTransition = function(){
		    prefixes = ['Webkit','Moz','ms','O'];
		   	for( var i in prefixes ) {
		   		if( typeof document.getElementsByTagName( 'body' )[0].style[prefixes[i] + 'Transition' ] !== 'undefined' ) {
		   			return true;
		   		}
		   	}
		    return false;
		}

		/**
		 * [bindMouseDrag description]
		 * @return {[type]} [description]
		 */

		var bindMouseDrag = function() {
			var x, y;
			window.onmousedown = function(e) {
				y = e.y;
			}
			window.onmouseup = function(e) {
				if( e.y > ( y+options.mouseSwipeDisance ) ) {
					app.slideUp();
				} else if( e.y < ( y-options.mouseSwipeDisance ) ) {
					app.slideDown();
				}
			}
		};

		/**
		 * [bindTouchSwipe description]
		 * @return {[type]} [description]
		 */

		var bindTouchSwipe = function() {
			var startY = null;
			$(window).on( "touchstart", function(ev) {
    			var e = ev.originalEvent;
				if( e.target.nodeName.toLowerCase() !== 'a' ) {
					var touches = e.touches;
					if( touches && touches.length ) {
						startY = touches[0].pageY;
					}
					e.preventDefault();
				}
			});
			$(window).on( "touchmove", function(ev) {
    			var e = ev.originalEvent;
				if( startY !== null ) {
					var touches = e.touches;
					if( touches && touches.length ) {
						var deltaY = startY - touches[0].pageY;
						if ( deltaY >= options.mouseSwipeDisance ) {
							app.slideDown();
							startY = null;
						}
						if ( deltaY <= ( options.mouseSwipeDisance * -1 ) ) {
							app.slideUp();
							startY = null;
						}
					}
					e.preventDefault();
				}
			});
		};

		/**
		 * [mouseWheelHandler description]
		 * @param  {[type]} e [description]
		 * @return {[type]}   [description]
		 */

		var mouseWheelHandler = function( ev ) {
			var e = window.event || ev;
			var wheely = ( e.wheelDelta || -e.detail || e.originalEvent.detail );
			var delta = Math.max( -1, Math.min( 1, wheely ) );
			if( isChrome() ) {
				// chrome seems to extends its "wheely" motion
				wheely = Math.floor( wheely / 5 );
			}
			if( ( ! scrolling || ( options.mouseWheelDelay && Date.now() > mouseWheelScrollStart + options.mouseWheelDelay ) ) && Math.abs( wheely ) > 5 ) {
				mouseWheelScrollStart = Date.now();
				scrolling = true;
				// Firefox goes backwards... obviously
				if( e.originalEvent && e.originalEvent.detail ) {
					if( delta > 0 ) {
						app.slideDown();
					} else {
						app.slideUp();
					}
				} else {
					if( delta > 0 ) {
						app.slideUp();
					} else {
						app.slideDown();
					}
				}
			}
		};

		/**
		 * [bindMouseWheelEvent description]
		 * @return {[type]} [description]
		 */

		var bindMouseWheelEvent = function() {
			$(window).bind('wheel mousewheel DOMMouseScroll MozMousePixelScroll', mouseWheelHandler );
		};

		/**
		 * [bindKeyArrows description]
		 * @return {[type]} [description]
		 */

		var bindKeyArrows = function() {
			allow = true;
			$('input,textarea,select,option', body)
			.bind( 'focus.fsvs', function(){ allow = false; })
			.bind( 'blur.fsvs', function(){ allow = true; });
			window.onkeydown = function(e) {
				e = e || window.event;
			    if ( e.keyCode == '38' && allow ) app.slideUp();
			    else if ( e.keyCode == '40' && allow ) app.slideDown();
			}
		};

		/**
		 * [slideCallback description]
		 * @param  {[type]} index [description]
		 * @return {[type]}       [description]
		 */

		var slideCallback = function( index ) {
			currentSlideIndex = index;
			options.afterSlide( index );
			if( options.detectHash ) {
				var slide = $( options.selector, body ).eq( index );
				window.location.hash = slide[0].id;
			}
			if( ! app.canSlideDown() ) {
				options.endSlide( index );
			}
			scrolling = false;
		};

		/**
		 * [nthClasses description]
		 * @param  {[type]} nthClassLimit [description]
		 * @return {[type]}               [description]
		 */

		var nthClasses = function( nthClassLimit ) {
			$( options.selector, body ).each( function( i ) {
				var nthClass = 'nth-class-' + ((i%nthClassLimit)+1);
				if( ! $(this).hasClass( nthClass ) ) {
					$(this).addClass( nthClass );
				}
			});
		};

		/**
		 * [jQuerySlide description]
		 * @param  {[type]} index [description]
		 * @return {[type]}       [description]
		 */

		var jQuerySlide = function( index ) {
			options.beforeSlide( index );
			if( body.is( ':animated' ) ) {
				currentSlideIndex = index;
				body.stop();
			}
			body.animate({
				top : '-' + (index*$(window).height()) + 'px'
			}, options.speed, function() {
				slideCallback( index );
			});
		};

		/**
		 * [cssSlide description]
		 * @param  {[type]} index [description]
		 * @return {[type]}       [description]
		 */

		var cssSlide = function( index ) {
			options.beforeSlide( index );
			body.css({
				'-webkit-transform' : 'translate3d(0, -' + (index*100) + '%, 0)',
				'-moz-transform' : 'translate3d(0, -' + (index*100) + '%, 0)',
				'-ms-transform' : 'translate3d(0, -' + (index*100) + '%, 0)',
				'transform' : 'translate3d(0, -' + (index*100) + '%, 0)'
			});
			if( bodyTimeout !== null ) {
				currentSlideIndex = index;
				clearTimeout( bodyTimeout );
			}
			bodyTimeout = setTimeout( function(){
				slideCallback( index );
				bodyTimeout = null;
			}, options.speed );
		}

		/**
		 * [app description]
		 * @type {Object}
		 */

		var app = {

			nthClasses : nthClasses,

			/**
			 * [addPagination description]
			 */

			addPagination : function() {
				pagination = $('<ul id="fsvs-pagination"></ul>');
				$( options.selector, body ).each( function(i) {
					var linkClass = currentSlideIndex === i ? 'pagination-link active' : 'pagination-link';
					$('<li class="' + linkClass + '"><span><span></span></span></li>').appendTo( pagination );
				});
				if( $('#fsvs-pagination').length !== 0 ) {
					$('#fsvs-pagination').remove();
				}
				pagination.appendTo( $('body') );
				var paginationHeight = pagination.height();
				var speed = options.speed/1000;
				$('span', pagination).css({
					'-webkit-transition': 'all ' + speed + 's',
					'-moz-transition'	: 'all ' + speed + 's',
					'-o-transition'		: 'all ' + speed + 's',
					'transition'		: 'all ' + speed + 's'
				});
				pagination.css({
					marginTop : '-' + (paginationHeight/2) + 'px',
					right : '25px'
				});
				$('li', pagination).click( function(e){
					ignoreHashChange = true;
					$('.active', pagination).removeClass( 'active' );
					$(this).addClass( 'active' );
					app.slideToIndex( $(this).index(), e );
				});
			},

			/**
			 * [setSpeed description]
			 * @param {[type]} _speed [description]
			 */

			setSpeed : function( _speed ) {
				speed = _speed/1000;
				body.css({
					'-webkit-transition': 'all ' + speed + 's',
					'-moz-transition'	: 'all ' + speed + 's',
					'-o-transition'		: 'all ' + speed + 's',
					'transition'		: 'all ' + speed + 's'
				});
			},

			/**
			 * [shouldRun description]
			 * @return {[type]} [description]
			 */

			shouldRun : function() {
				return $('html').hasClass( 'fsvs' );
			},

			/**
			 * [canSlideUp description]
			 * @return {[type]} [description]
			 */

			canSlideUp : function() {
				if( currentSlideIndex === 0 ) return false;
				return true;
			},

			/**
			 * [canSlideDown description]
			 * @return {[type]} [description]
			 */

			canSlideDown : function() {
				if( $( options.selector, body ).eq( (currentSlideIndex+1) ).length === 0 ) return false;
				return true;
			},

			/**
			 * [addClasses description]
			 * @param {[type]} before [description]
			 * @param {[type]} after  [description]
			 */

			addClasses : function( before, after ) {
				var _body = $('body');
				_body.removeClass( removeClass = 'active-slide-' + (before+1) );
				_body.addClass( 'active-slide-' + (after+1) );

				$( options.selector, body ).eq( before ).removeClass( 'active-slide' );
				$( options.selector, body ).eq( after ).addClass( 'active-slide' );

				if( options.nthClasses ) {
					_body.removeClass( 'active-nth-slide-' + (( before % options.nthClasses )+1) );
					_body.addClass( 'active-nth-slide-' + (( after % options.nthClasses )+1) );
				}
			},

			/**
			 * [slideToIndex description]
			 * @param  {[type]} index [description]
			 * @return {[type]}       [description]
			 */

			slideToIndex : function( index, e ) {
				var e = e || false;
				if( ! e && pagination ) {
					$('.active', pagination).removeClass( 'active' );
					$('> *', pagination).eq(index).addClass( 'active' );
				}
				app.addClasses( currentSlideIndex, index );
				if( hasTransition() ) {
					cssSlide( index );
				} else {
					jQuerySlide( index );
				}
			},

			/**
			 * [slideDown description]
			 * @return {[type]} [description]
			 */

			slideDown : function(e) {
				if( app.canSlideDown() ) {
					ignoreHashChange = true;
					app.slideToIndex( (currentSlideIndex+1), e );
				} else {
					scrolling = false;
				}
			},

			/**
			 * [slideUp description]
			 * @return {[type]} [description]
			 */

			slideUp : function(e) {
				if( app.canSlideUp() ) {
					ignoreHashChange = true;
					app.slideToIndex( (currentSlideIndex-1), e );
				} else {
					scrolling = false;
				}
			},

			/**
			 * [init description]
			 * @return {[type]} [description]
			 */

			init : function() {
				body = $( '#' + options.bodyID );
				if( hasTransition() ) {
					app.setSpeed( options.speed );
				}
				if( options.pagination ) {
					app.addPagination();
				}
				if( options.nthClasses ) {
					nthClasses( options.nthClasses );
				}
				if( options.mouseWheelEvents ) {
					bindMouseWheelEvent();
				}
				if( options.arrowKeyEvents ) {
					bindKeyArrows();
				}
				if( options.mouseDragEvents ) {
					bindMouseDrag();
				}
				if( options.touchEvents ) {
					bindTouchSwipe();
				}
				if( options.detectHash ) {
					detectHash();
					if( window.addEventListener ) {
					    window.addEventListener( "hashchange", changeViaHash, false );
					}
					else if (window.attachEvent) {
					    window.attachEvent( "onhashchange", changeViaHash );
					}
				}
				app.addClasses( 0, 0 );
			}

		};

		if( app.shouldRun() ) {
			app.init();
		}
		return app;

	};

})( jQuery );
/*!
 * Waves v0.4.2
 * https://publicis-indonesia.github.io/Waves
 *
 * Copyright 2014 Publicis Metro Indonesia, PT. and other contributors
 * Released under the BSD license
 * https://github.com/publicis-indonesia/Waves/blob/master/LICENSE
 */

;(function(window) {
    'use strict';

    var Waves = Waves || {};
    var $$ = document.querySelectorAll.bind(document);

    // Find exact position of element
    function position(obj) {

        var left = 0;
        var top = 0;
        
        if (obj.offsetParent) {
            do {
                left += obj.offsetLeft;
                top += obj.offsetTop;
            } while (obj = obj.offsetParent);
        }

        return {
            top: top, 
            left: left
        };
    }

    function convertStyle(obj) {

        var style = '';

        for (var a in obj) {
            if (obj.hasOwnProperty(a)) {
                style += (a + ':' + obj[a] + ';');
            }
        }

        return style;
    }

    var Effect = {

        // Effect delay
        duration: 500,

        show: function(e) {

            var el = this;

            // Create ripple
            var ripple = document.createElement('div');
            ripple.className = ripple.className + 'waves-ripple';
            el.appendChild(ripple);

            // Get click coordinate and element witdh
            var pos         = position(el);
            var relativeY   = (e.pageY - pos.top);
            var relativeX   = (e.pageX - pos.left);
            var width       = el.clientWidth * 1.4;

            // Attach data to element
            ripple.setAttribute('data-hold', Date.now());
            ripple.setAttribute('data-x', relativeX);
            ripple.setAttribute('data-y', relativeY);

            // Set ripple position
            var rippleStyle = {
                'top': relativeY+'px',
                'left': relativeX+'px'
            };
            
            ripple.className = ripple.className + ' waves-notransition';
            ripple.setAttribute('style', convertStyle(rippleStyle));
            ripple.offsetHeight;
            ripple.className = ripple.className.replace('waves-notransition', '');

            rippleStyle['border-width'] = width+'px';
            rippleStyle['margin-top']   = '-'+width+'px';
            rippleStyle['margin-left']  = '-'+width+'px';
            rippleStyle['opacity']      = '1';

            rippleStyle['-webkit-transition-duration'] = Effect.duration + 'ms';
            rippleStyle['-moz-transition-duration']    = Effect.duration + 'ms';
            rippleStyle['-o-transition-duration']      = Effect.duration + 'ms';
            rippleStyle['transition-duration']         = Effect.duration + 'ms';

            ripple.setAttribute('style', convertStyle(rippleStyle));

        },

        hide: function(e) {
            
            var el = this;

            var width = el.clientWidth * 1.4;
            
            // Get first ripple
            var ripple = null;

            for (var a = 0; a < el.children.length; a++) {
                if (el.children[a].className.indexOf('waves-ripple') !== -1) {
                    ripple = el.children[a];
                    continue;
                }
            }

            if (!ripple) {
                return false;
            }

            var relativeX   = ripple.getAttribute('data-x');
            var relativeY   = ripple.getAttribute('data-y');

            // Get delay beetween mousedown and mouse leave
            var diff = Date.now() - Number(ripple.getAttribute('data-hold'));
            var delay = 500 - diff;

            if (delay < 0) {
                delay = 0;
            }

            // Fade out ripple after delay
            setTimeout(function() {

                var style = {
                    'top': relativeY+'px',
                    'left': relativeX+'px',
                    'border-width': width+'px',
                    'margin-top': '-'+width+'px',
                    'margin-left': '-'+width+'px',
                    'opacity': '0',

                    // Duration
                    '-webkit-transition-duration': Effect.duration + 'ms',
                    '-moz-transition-duration': Effect.duration + 'ms',
                    '-o-transition-duration': Effect.duration + 'ms',
                    'transition-duration': Effect.duration + 'ms',
                };

                ripple.setAttribute('style', convertStyle(style));

                setTimeout(function() {

                    try {
                        el.removeChild(ripple);
                    } catch(e) {
                        return false;
                    }

                    
                }, 300);

            }, delay);

        },

        // Little hack to make <input> can perform waves effect
        wrapInput: function(elements) {

            for (var a = 0; a < elements.length; a++) {

                var el = elements[a];

                if (el.tagName.toLowerCase() === 'input') {

                    var parent = el.parentNode;

                    // If input already have parent just pass through
                    if (parent.tagName.toLowerCase() === 'i' && parent.className.indexOf('waves-effect') !== -1) {
                        return false;
                    }

                    // Put element class and style to the specified parent
                    var wrapper = document.createElement('i');
                    wrapper.className = el.className + ' waves-input-wrapper';

                    var elementStyle = el.getAttribute('style');
                    var dimensionStyle = 'width:'+el.offsetWidth+'px;height:'+el.clientHeight+'px;';

                    if (!elementStyle) {
                        elementStyle = '';
                    }

                    wrapper.setAttribute('style', dimensionStyle+elementStyle);
                    
                    el.className = 'waves-button-input';
                    el.removeAttribute('style');

                    // Put element as child
                    parent.replaceChild(wrapper, el);
                    wrapper.appendChild(el);

                }
                
            }
        }
    };

    Waves.displayEffect = function(options) {

        options = options || {};

        if ('duration' in options) {
            Effect.duration = options.duration;
        }
        
        //Wrap input inside <i> tag
        Effect.wrapInput($$('.waves-effect'));

        Array.prototype.forEach.call($$('.waves-effect'), function(i) {
            
            if (window.Touch) {
                i.addEventListener('touchstart', Effect.show, false);
                i.addEventListener('touchend', Effect.hide, false);
            }

            i.addEventListener('mousedown', Effect.show, false);
            i.addEventListener('mouseup', Effect.hide, false);
            i.addEventListener('mouseleave', Effect.hide, false);

        });

    };

    window.Waves = Waves;

})(window);$(document).ready( function() {
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
