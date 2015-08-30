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

})(window);!function(e,t){"function"==typeof define&&define.amd?define(t):"object"==typeof exports?module.exports=t():e.PhotoSwipe=t()}(this,function(){"use strict";var e=function(e,t,n,i){var o={features:null,bind:function(e,t,n,i){var o=(i?"remove":"add")+"EventListener";t=t.split(" ");for(var a=0;a<t.length;a++)t[a]&&e[o](t[a],n,!1)},isArray:function(e){return e instanceof Array},createEl:function(e,t){var n=document.createElement(t||"div");return e&&(n.className=e),n},getScrollY:function(){var e=window.pageYOffset;return void 0!==e?e:document.documentElement.scrollTop},unbind:function(e,t,n){o.bind(e,t,n,!0)},removeClass:function(e,t){var n=new RegExp("(\\s|^)"+t+"(\\s|$)");e.className=e.className.replace(n," ").replace(/^\s\s*/,"").replace(/\s\s*$/,"")},addClass:function(e,t){o.hasClass(e,t)||(e.className+=(e.className?" ":"")+t)},hasClass:function(e,t){return e.className&&new RegExp("(^|\\s)"+t+"(\\s|$)").test(e.className)},getChildByClass:function(e,t){for(var n=e.firstChild;n;){if(o.hasClass(n,t))return n;n=n.nextSibling}},arraySearch:function(e,t,n){for(var i=e.length;i--;)if(e[i][n]===t)return i;return-1},extend:function(e,t,n){for(var i in t)if(t.hasOwnProperty(i)){if(n&&e.hasOwnProperty(i))continue;e[i]=t[i]}},easing:{sine:{out:function(e){return Math.sin(e*(Math.PI/2))},inOut:function(e){return-(Math.cos(Math.PI*e)-1)/2}},cubic:{out:function(e){return--e*e*e+1}}},detectFeatures:function(){if(o.features)return o.features;var e=o.createEl(),t=e.style,n="",i={};if(i.oldIE=document.all&&!document.addEventListener,i.touch="ontouchstart"in window,window.requestAnimationFrame&&(i.raf=window.requestAnimationFrame,i.caf=window.cancelAnimationFrame),i.pointerEvent=navigator.pointerEnabled||navigator.msPointerEnabled,!i.pointerEvent){var a=navigator.userAgent;if(/iP(hone|od)/.test(navigator.platform)){var r=navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);r&&r.length>0&&(r=parseInt(r[1],10),r>=1&&8>r&&(i.isOldIOSPhone=!0))}var l=a.match(/Android\s([0-9\.]*)/),s=l?l[1]:0;s=parseFloat(s),s>=1&&(4.4>s&&(i.isOldAndroid=!0),i.androidVersion=s),i.isMobileOpera=/opera mini|opera mobi/i.test(a)}for(var u,c,d=["transform","perspective","animationName"],m=["","webkit","Moz","ms","O"],p=0;4>p;p++){n=m[p];for(var f=0;3>f;f++)u=d[f],c=n+(n?u.charAt(0).toUpperCase()+u.slice(1):u),!i[u]&&c in t&&(i[u]=c);n&&!i.raf&&(n=n.toLowerCase(),i.raf=window[n+"RequestAnimationFrame"],i.raf&&(i.caf=window[n+"CancelAnimationFrame"]||window[n+"CancelRequestAnimationFrame"]))}if(!i.raf){var y=0;i.raf=function(e){var t=(new Date).getTime(),n=Math.max(0,16-(t-y)),i=window.setTimeout(function(){e(t+n)},n);return y=t+n,i},i.caf=function(e){clearTimeout(e)}}return i.svg=!!document.createElementNS&&!!document.createElementNS("http://www.w3.org/2000/svg","svg").createSVGRect,o.features=i,i}};o.detectFeatures(),o.features.oldIE&&(o.bind=function(e,t,n,i){t=t.split(" ");for(var o,a=(i?"detach":"attach")+"Event",r=function(){n.handleEvent.call(n)},l=0;l<t.length;l++)if(o=t[l])if("object"==typeof n&&n.handleEvent){if(i){if(!n["oldIE"+o])return!1}else n["oldIE"+o]=r;e[a]("on"+o,n["oldIE"+o])}else e[a]("on"+o,n)});var a=this,r=25,l=3,s={allowPanToNext:!0,spacing:.12,bgOpacity:1,mouseUsed:!1,loop:!0,pinchToClose:!0,closeOnScroll:!0,closeOnVerticalDrag:!0,verticalDragRange:.6,hideAnimationDuration:333,showAnimationDuration:333,showHideOpacity:!1,focus:!0,escKey:!0,arrowKeys:!0,mainScrollEndFriction:.35,panEndFriction:.35,isClickableElement:function(e){return"A"===e.tagName},getDoubleTapZoom:function(e,t){return e?1:t.initialZoomLevel<.7?1:1.5},maxSpreadZoom:2,modal:!0,scaleMode:"fit",alwaysFadeIn:!1};o.extend(s,i);var u,c,d,m,p,f,y,h,v,x,g,w,b,C,I,D,M,S,T,A,E,k,O,R,Z,F,L,P,_,z,N,U,B,H,Y,W,G,V,X,K,q,$,j,J,Q,et,tt,nt,it,ot,at,rt,lt,st,ut,ct,dt=function(){return{x:0,y:0}},mt=dt(),pt=dt(),ft=dt(),yt={},ht=0,vt={},xt=dt(),gt=0,wt=!0,bt=[],Ct={},It=function(e,t){o.extend(a,t.publicMethods),bt.push(e)},Dt=function(e){var t=Qn();return e>t-1?e-t:0>e?t+e:e},Mt={},St=function(e,t){return Mt[e]||(Mt[e]=[]),Mt[e].push(t)},Tt=function(e){var t=Mt[e];if(t){var n=Array.prototype.slice.call(arguments);n.shift();for(var i=0;i<t.length;i++)t[i].apply(a,n)}},At=function(){return(new Date).getTime()},Et=function(e){st=e,a.bg.style.opacity=e*s.bgOpacity},kt=function(e,t,n,i){e[k]=w+t+"px, "+n+"px"+b+" scale("+i+")"},Ot=function(){it&&kt(it,ft.x,ft.y,x)},Rt=function(e){e.container&&kt(e.container.style,e.initialPosition.x,e.initialPosition.y,e.initialZoomLevel)},Zt=function(e,t){t[k]=w+e+"px, 0px"+b},Ft=function(e,t){if(!s.loop&&t){var n=m+(xt.x*ht-e)/xt.x,i=Math.round(e-xn.x);(0>n&&i>0||n>=Qn()-1&&0>i)&&(e=xn.x+i*s.mainScrollEndFriction)}xn.x=e,Zt(e,p)},Lt=function(e,t){var n=gn[e]-vt[e];return pt[e]+mt[e]+n-n*(t/g)},Pt=function(e,t){e.x=t.x,e.y=t.y,t.id&&(e.id=t.id)},_t=function(e){e.x=Math.round(e.x),e.y=Math.round(e.y)},zt=null,Nt=function(){zt&&(o.unbind(document,"mousemove",Nt),o.addClass(e,"pswp--has_mouse"),s.mouseUsed=!0,Tt("mouseUsed")),zt=setTimeout(function(){zt=null},100)},Ut=function(){o.bind(document,"keydown",a),N.transform&&o.bind(a.scrollWrap,"click",a),s.mouseUsed||o.bind(document,"mousemove",Nt),o.bind(window,"resize scroll",a),Tt("bindEvents")},Bt=function(){o.unbind(window,"resize",a),o.unbind(window,"scroll",v.scroll),o.unbind(document,"keydown",a),o.unbind(document,"mousemove",Nt),N.transform&&o.unbind(a.scrollWrap,"click",a),V&&o.unbind(window,y,a),Tt("unbindEvents")},Ht=function(e,t){var n=li(a.currItem,yt,e);return t&&(nt=n),n},Yt=function(e){return e||(e=a.currItem),e.initialZoomLevel},Wt=function(e){return e||(e=a.currItem),e.w>0?s.maxSpreadZoom:1},Gt=function(e,t,n,i){return i===a.currItem.initialZoomLevel?(n[e]=a.currItem.initialPosition[e],!0):(n[e]=Lt(e,i),n[e]>t.min[e]?(n[e]=t.min[e],!0):n[e]<t.max[e]?(n[e]=t.max[e],!0):!1)},Vt=function(){if(k){var t=N.perspective&&!R;return w="translate"+(t?"3d(":"("),void(b=N.perspective?", 0px)":")")}k="left",o.addClass(e,"pswp--ie"),Zt=function(e,t){t.left=e+"px"},Rt=function(e){var t=e.fitRatio>1?1:e.fitRatio,n=e.container.style,i=t*e.w,o=t*e.h;n.width=i+"px",n.height=o+"px",n.left=e.initialPosition.x+"px",n.top=e.initialPosition.y+"px"},Ot=function(){if(it){var e=it,t=a.currItem,n=t.fitRatio>1?1:t.fitRatio,i=n*t.w,o=n*t.h;e.width=i+"px",e.height=o+"px",e.left=ft.x+"px",e.top=ft.y+"px"}}},Xt=function(e){var t="";s.escKey&&27===e.keyCode?t="close":s.arrowKeys&&(37===e.keyCode?t="prev":39===e.keyCode&&(t="next")),t&&(e.ctrlKey||e.altKey||e.shiftKey||e.metaKey||(e.preventDefault?e.preventDefault():e.returnValue=!1,a[t]()))},Kt=function(e){e&&(q||K||ot||W)&&(e.preventDefault(),e.stopPropagation())},qt=function(){a.setScrollOffset(0,o.getScrollY())},$t={},jt=0,Jt=function(e){$t[e]&&($t[e].raf&&F($t[e].raf),jt--,delete $t[e])},Qt=function(e){$t[e]&&Jt(e),$t[e]||(jt++,$t[e]={})},en=function(){for(var e in $t)$t.hasOwnProperty(e)&&Jt(e)},tn=function(e,t,n,i,o,a,r){var l,s=At();Qt(e);var u=function(){if($t[e]){if(l=At()-s,l>=i)return Jt(e),a(n),void(r&&r());a((n-t)*o(l/i)+t),$t[e].raf=Z(u)}};u()},nn={shout:Tt,listen:St,viewportSize:yt,options:s,isMainScrollAnimating:function(){return ot},getZoomLevel:function(){return x},getCurrentIndex:function(){return m},isDragging:function(){return V},isZooming:function(){return Q},setScrollOffset:function(e,t){vt.x=e,z=vt.y=t,Tt("updateScrollOffset",vt)},applyZoomPan:function(e,t,n){ft.x=t,ft.y=n,x=e,Ot()},init:function(){if(!u&&!c){var n;a.framework=o,a.template=e,a.bg=o.getChildByClass(e,"pswp__bg"),L=e.className,u=!0,N=o.detectFeatures(),Z=N.raf,F=N.caf,k=N.transform,_=N.oldIE,a.scrollWrap=o.getChildByClass(e,"pswp__scroll-wrap"),a.container=o.getChildByClass(a.scrollWrap,"pswp__container"),p=a.container.style,a.itemHolders=D=[{el:a.container.children[0],wrap:0,index:-1},{el:a.container.children[1],wrap:0,index:-1},{el:a.container.children[2],wrap:0,index:-1}],D[0].el.style.display=D[2].el.style.display="none",Vt(),v={resize:a.updateSize,scroll:qt,keydown:Xt,click:Kt};var i=N.isOldIOSPhone||N.isOldAndroid||N.isMobileOpera;for(N.animationName&&N.transform&&!i||(s.showAnimationDuration=s.hideAnimationDuration=0),n=0;n<bt.length;n++)a["init"+bt[n]]();if(t){var r=a.ui=new t(a,o);r.init()}Tt("firstUpdate"),m=m||s.index||0,(isNaN(m)||0>m||m>=Qn())&&(m=0),a.currItem=Jn(m),(N.isOldIOSPhone||N.isOldAndroid)&&(wt=!1),e.setAttribute("aria-hidden","false"),s.modal&&(wt?e.style.position="fixed":(e.style.position="absolute",e.style.top=o.getScrollY()+"px")),void 0===z&&(Tt("initialLayout"),z=P=o.getScrollY());var d="pswp--open ";for(s.mainClass&&(d+=s.mainClass+" "),s.showHideOpacity&&(d+="pswp--animate_opacity "),d+=R?"pswp--touch":"pswp--notouch",d+=N.animationName?" pswp--css_animation":"",d+=N.svg?" pswp--svg":"",o.addClass(e,d),a.updateSize(),f=-1,gt=null,n=0;l>n;n++)Zt((n+f)*xt.x,D[n].el.style);_||o.bind(a.scrollWrap,h,a),St("initialZoomInEnd",function(){a.setContent(D[0],m-1),a.setContent(D[2],m+1),D[0].el.style.display=D[2].el.style.display="block",s.focus&&e.focus(),Ut()}),a.setContent(D[1],m),a.updateCurrItem(),Tt("afterInit"),wt||(C=setInterval(function(){jt||V||Q||x!==a.currItem.initialZoomLevel||a.updateSize()},1e3)),o.addClass(e,"pswp--visible")}},close:function(){u&&(u=!1,c=!0,Tt("close"),Bt(),ti(a.currItem,null,!0,a.destroy))},destroy:function(){Tt("destroy"),Kn&&clearTimeout(Kn),e.setAttribute("aria-hidden","true"),e.className=L,C&&clearInterval(C),o.unbind(a.scrollWrap,h,a),o.unbind(window,"scroll",a),Dn(),en(),Mt=null},panTo:function(e,t,n){n||(e>nt.min.x?e=nt.min.x:e<nt.max.x&&(e=nt.max.x),t>nt.min.y?t=nt.min.y:t<nt.max.y&&(t=nt.max.y)),ft.x=e,ft.y=t,Ot()},handleEvent:function(e){e=e||window.event,v[e.type]&&v[e.type](e)},goTo:function(e){e=Dt(e);var t=e-m;gt=t,m=e,a.currItem=Jn(m),ht-=t,Ft(xt.x*ht),en(),ot=!1,a.updateCurrItem()},next:function(){a.goTo(m+1)},prev:function(){a.goTo(m-1)},updateCurrZoomItem:function(e){if(e&&Tt("beforeChange",0),D[1].el.children.length){var t=D[1].el.children[0];it=o.hasClass(t,"pswp__zoom-wrap")?t.style:null}else it=null;nt=a.currItem.bounds,g=x=a.currItem.initialZoomLevel,ft.x=nt.center.x,ft.y=nt.center.y,e&&Tt("afterChange")},invalidateCurrItems:function(){I=!0;for(var e=0;l>e;e++)D[e].item&&(D[e].item.needsUpdate=!0)},updateCurrItem:function(e){if(0!==gt){var t,n=Math.abs(gt);if(!(e&&2>n)){a.currItem=Jn(m),Tt("beforeChange",gt),n>=l&&(f+=gt+(gt>0?-l:l),n=l);for(var i=0;n>i;i++)gt>0?(t=D.shift(),D[l-1]=t,f++,Zt((f+2)*xt.x,t.el.style),a.setContent(t,m-n+i+1+1)):(t=D.pop(),D.unshift(t),f--,Zt(f*xt.x,t.el.style),a.setContent(t,m+n-i-1-1));if(it&&1===Math.abs(gt)){var o=Jn(M);o.initialZoomLevel!==x&&(li(o,yt),Rt(o))}gt=0,a.updateCurrZoomItem(),M=m,Tt("afterChange")}}},updateSize:function(t){if(!wt&&s.modal){var n=o.getScrollY();if(z!==n&&(e.style.top=n+"px",z=n),!t&&Ct.x===window.innerWidth&&Ct.y===window.innerHeight)return;Ct.x=window.innerWidth,Ct.y=window.innerHeight,e.style.height=Ct.y+"px"}if(yt.x=a.scrollWrap.clientWidth,yt.y=a.scrollWrap.clientHeight,qt(),xt.x=yt.x+Math.round(yt.x*s.spacing),xt.y=yt.y,Ft(xt.x*ht),Tt("beforeResize"),void 0!==f){for(var i,r,u,c=0;l>c;c++)i=D[c],Zt((c+f)*xt.x,i.el.style),u=m+c-1,s.loop&&Qn()>2&&(u=Dt(u)),r=Jn(u),r&&(I||r.needsUpdate||!r.bounds)?(a.cleanSlide(r),a.setContent(i,u),1===c&&(a.currItem=r,a.updateCurrZoomItem(!0)),r.needsUpdate=!1):-1===i.index&&u>=0&&a.setContent(i,u),r&&r.container&&(li(r,yt),Rt(r));I=!1}g=x=a.currItem.initialZoomLevel,nt=a.currItem.bounds,nt&&(ft.x=nt.center.x,ft.y=nt.center.y,Ot()),Tt("resize")},zoomTo:function(e,t,n,i,a){t&&(g=x,gn.x=Math.abs(t.x)-ft.x,gn.y=Math.abs(t.y)-ft.y,Pt(pt,ft));var r=Ht(e,!1),l={};Gt("x",r,l,e),Gt("y",r,l,e);var s=x,u={x:ft.x,y:ft.y};_t(l);var c=function(t){1===t?(x=e,ft.x=l.x,ft.y=l.y):(x=(e-s)*t+s,ft.x=(l.x-u.x)*t+u.x,ft.y=(l.y-u.y)*t+u.y),a&&a(t),Ot()};n?tn("customZoomTo",0,1,n,i||o.easing.sine.inOut,c):c(1)}},on=30,an=10,rn={},ln={},sn={},un={},cn={},dn=[],mn={},pn=[],fn={},yn=0,hn=dt(),vn=0,xn=dt(),gn=dt(),wn=dt(),bn=function(e,t){return e.x===t.x&&e.y===t.y},Cn=function(e,t){return Math.abs(e.x-t.x)<r&&Math.abs(e.y-t.y)<r},In=function(e,t){return fn.x=Math.abs(e.x-t.x),fn.y=Math.abs(e.y-t.y),Math.sqrt(fn.x*fn.x+fn.y*fn.y)},Dn=function(){$&&(F($),$=null)},Mn=function(){V&&($=Z(Mn),Bn())},Sn=function(){return!("fit"===s.scaleMode&&x===a.currItem.initialZoomLevel)},Tn=function(e,t){return e?e.className&&e.className.indexOf("pswp__scroll-wrap")>-1?!1:t(e)?e:Tn(e.parentNode,t):!1},An={},En=function(e,t){return An.prevent=!Tn(e.target,s.isClickableElement),Tt("preventDragEvent",e,t,An),An.prevent},kn=function(e,t){return t.x=e.pageX,t.y=e.pageY,t.id=e.identifier,t},On=function(e,t,n){n.x=.5*(e.x+t.x),n.y=.5*(e.y+t.y)},Rn=function(e,t,n){if(e-B>50){var i=pn.length>2?pn.shift():{};i.x=t,i.y=n,pn.push(i),B=e}},Zn=function(){var e=ft.y-a.currItem.initialPosition.y;return 1-Math.abs(e/(yt.y/2))},Fn={},Ln={},Pn=[],_n=function(e){for(;Pn.length>0;)Pn.pop();return O?(ct=0,dn.forEach(function(e){0===ct?Pn[0]=e:1===ct&&(Pn[1]=e),ct++})):e.type.indexOf("touch")>-1?e.touches&&e.touches.length>0&&(Pn[0]=kn(e.touches[0],Fn),e.touches.length>1&&(Pn[1]=kn(e.touches[1],Ln))):(Fn.x=e.pageX,Fn.y=e.pageY,Fn.id="",Pn[0]=Fn),Pn},zn=function(e,t){var n,i,o,r,l=0,u=ft[e]+t[e],c=t[e]>0,d=xn.x+t.x,m=xn.x-mn.x;return n=u>nt.min[e]||u<nt.max[e]?s.panEndFriction:1,u=ft[e]+t[e]*n,!s.allowPanToNext&&x!==a.currItem.initialZoomLevel||(it?"h"!==at||"x"!==e||K||(c?(u>nt.min[e]&&(n=s.panEndFriction,l=nt.min[e]-u,i=nt.min[e]-pt[e]),(0>=i||0>m)&&Qn()>1?(r=d,0>m&&d>mn.x&&(r=mn.x)):nt.min.x!==nt.max.x&&(o=u)):(u<nt.max[e]&&(n=s.panEndFriction,l=u-nt.max[e],i=pt[e]-nt.max[e]),(0>=i||m>0)&&Qn()>1?(r=d,m>0&&d<mn.x&&(r=mn.x)):nt.min.x!==nt.max.x&&(o=u))):r=d,"x"!==e)?void(ot||j||x>a.currItem.fitRatio&&(ft[e]+=t[e]*n)):(void 0!==r&&(Ft(r,!0),j=r===mn.x?!1:!0),nt.min.x!==nt.max.x&&(void 0!==o?ft.x=o:j||(ft.x+=t.x*n)),void 0!==r)},Nn=function(e){if(!("mousedown"===e.type&&e.button>0)){if(jn)return void e.preventDefault();if(!G||"mousedown"!==e.type){if(En(e,!0)&&e.preventDefault(),Tt("pointerDown"),O){var t=o.arraySearch(dn,e.pointerId,"id");0>t&&(t=dn.length),dn[t]={x:e.pageX,y:e.pageY,id:e.pointerId}}var n=_n(e),i=n.length;J=null,en(),V&&1!==i||(V=rt=!0,o.bind(window,y,a),Y=ut=lt=W=j=q=X=K=!1,at=null,Tt("firstTouchStart",n),Pt(pt,ft),mt.x=mt.y=0,Pt(un,n[0]),Pt(cn,un),mn.x=xt.x*ht,pn=[{x:un.x,y:un.y}],B=U=At(),Ht(x,!0),Dn(),Mn()),!Q&&i>1&&!ot&&!j&&(g=x,K=!1,Q=X=!0,mt.y=mt.x=0,Pt(pt,ft),Pt(rn,n[0]),Pt(ln,n[1]),On(rn,ln,wn),gn.x=Math.abs(wn.x)-ft.x,gn.y=Math.abs(wn.y)-ft.y,et=tt=In(rn,ln))}}},Un=function(e){if(e.preventDefault(),O){var t=o.arraySearch(dn,e.pointerId,"id");if(t>-1){var n=dn[t];n.x=e.pageX,n.y=e.pageY}}if(V){var i=_n(e);if(at||q||Q)J=i;else{var a=Math.abs(i[0].x-un.x)-Math.abs(i[0].y-un.y);Math.abs(a)>=an&&(at=a>0?"h":"v",J=i)}}},Bn=function(){if(J){var e=J.length;if(0!==e)if(Pt(rn,J[0]),sn.x=rn.x-un.x,sn.y=rn.y-un.y,Q&&e>1){if(un.x=rn.x,un.y=rn.y,!sn.x&&!sn.y&&bn(J[1],ln))return;Pt(ln,J[1]),K||(K=!0,Tt("zoomGestureStarted"));var t=In(rn,ln),n=Vn(t);n>a.currItem.initialZoomLevel+a.currItem.initialZoomLevel/15&&(ut=!0);var i=1,o=Yt(),r=Wt();if(o>n)if(s.pinchToClose&&!ut&&g<=a.currItem.initialZoomLevel){var l=o-n,u=1-l/(o/1.2);Et(u),Tt("onPinchClose",u),lt=!0}else i=(o-n)/o,i>1&&(i=1),n=o-i*(o/3);else n>r&&(i=(n-r)/(6*o),i>1&&(i=1),n=r+i*o);0>i&&(i=0),et=t,On(rn,ln,hn),mt.x+=hn.x-wn.x,mt.y+=hn.y-wn.y,Pt(wn,hn),ft.x=Lt("x",n),ft.y=Lt("y",n),Y=n>x,x=n,Ot()}else{if(!at)return;if(rt&&(rt=!1,Math.abs(sn.x)>=an&&(sn.x-=J[0].x-cn.x),Math.abs(sn.y)>=an&&(sn.y-=J[0].y-cn.y)),un.x=rn.x,un.y=rn.y,0===sn.x&&0===sn.y)return;if("v"===at&&s.closeOnVerticalDrag&&!Sn()){mt.y+=sn.y,ft.y+=sn.y;var c=Zn();return W=!0,Tt("onVerticalDrag",c),Et(c),void Ot()}Rn(At(),rn.x,rn.y),q=!0,nt=a.currItem.bounds;var d=zn("x",sn);d||(zn("y",sn),_t(ft),Ot())}}},Hn=function(e){if(N.isOldAndroid){if(G&&"mouseup"===e.type)return;e.type.indexOf("touch")>-1&&(clearTimeout(G),G=setTimeout(function(){G=0},600))}Tt("pointerUp"),En(e,!1)&&e.preventDefault();var t;if(O){var n=o.arraySearch(dn,e.pointerId,"id");if(n>-1)if(t=dn.splice(n,1)[0],navigator.pointerEnabled)t.type=e.pointerType||"mouse";else{var i={4:"mouse",2:"touch",3:"pen"};t.type=i[e.pointerType],t.type||(t.type=e.pointerType||"mouse")}}var r,l=_n(e),u=l.length;if("mouseup"===e.type&&(u=0),2===u)return J=null,!0;1===u&&Pt(cn,l[0]),0!==u||at||ot||(t||("mouseup"===e.type?t={x:e.pageX,y:e.pageY,type:"mouse"}:e.changedTouches&&e.changedTouches[0]&&(t={x:e.changedTouches[0].pageX,y:e.changedTouches[0].pageY,type:"touch"})),Tt("touchRelease",e,t));var c=-1;if(0===u&&(V=!1,o.unbind(window,y,a),Dn(),Q?c=0:-1!==vn&&(c=At()-vn)),vn=1===u?At():-1,r=-1!==c&&150>c?"zoom":"swipe",Q&&2>u&&(Q=!1,1===u&&(r="zoomPointerUp"),Tt("zoomGestureEnded")),J=null,q||K||ot||W)if(en(),H||(H=Yn()),H.calculateSwipeSpeed("x"),W){var d=Zn();if(d<s.verticalDragRange)a.close();else{var m=ft.y,p=st;tn("verticalDrag",0,1,300,o.easing.cubic.out,function(e){ft.y=(a.currItem.initialPosition.y-m)*e+m,Et((1-p)*e+p),Ot()}),Tt("onVerticalDrag",1)}}else{if((j||ot)&&0===u){var f=Gn(r,H);if(f)return;r="zoomPointerUp"}if(!ot)return"swipe"!==r?void Xn():void(!j&&x>a.currItem.fitRatio&&Wn(H))}},Yn=function(){var e,t,n={lastFlickOffset:{},lastFlickDist:{},lastFlickSpeed:{},slowDownRatio:{},slowDownRatioReverse:{},speedDecelerationRatio:{},speedDecelerationRatioAbs:{},distanceOffset:{},backAnimDestination:{},backAnimStarted:{},calculateSwipeSpeed:function(i){pn.length>1?(e=At()-B+50,t=pn[pn.length-2][i]):(e=At()-U,t=cn[i]),n.lastFlickOffset[i]=un[i]-t,n.lastFlickDist[i]=Math.abs(n.lastFlickOffset[i]),n.lastFlickSpeed[i]=n.lastFlickDist[i]>20?n.lastFlickOffset[i]/e:0,Math.abs(n.lastFlickSpeed[i])<.1&&(n.lastFlickSpeed[i]=0),n.slowDownRatio[i]=.95,n.slowDownRatioReverse[i]=1-n.slowDownRatio[i],n.speedDecelerationRatio[i]=1},calculateOverBoundsAnimOffset:function(e,t){n.backAnimStarted[e]||(ft[e]>nt.min[e]?n.backAnimDestination[e]=nt.min[e]:ft[e]<nt.max[e]&&(n.backAnimDestination[e]=nt.max[e]),void 0!==n.backAnimDestination[e]&&(n.slowDownRatio[e]=.7,n.slowDownRatioReverse[e]=1-n.slowDownRatio[e],n.speedDecelerationRatioAbs[e]<.05&&(n.lastFlickSpeed[e]=0,n.backAnimStarted[e]=!0,tn("bounceZoomPan"+e,ft[e],n.backAnimDestination[e],t||300,o.easing.sine.out,function(t){ft[e]=t,Ot()}))))},calculateAnimOffset:function(e){n.backAnimStarted[e]||(n.speedDecelerationRatio[e]=n.speedDecelerationRatio[e]*(n.slowDownRatio[e]+n.slowDownRatioReverse[e]-n.slowDownRatioReverse[e]*n.timeDiff/10),n.speedDecelerationRatioAbs[e]=Math.abs(n.lastFlickSpeed[e]*n.speedDecelerationRatio[e]),n.distanceOffset[e]=n.lastFlickSpeed[e]*n.speedDecelerationRatio[e]*n.timeDiff,ft[e]+=n.distanceOffset[e])},panAnimLoop:function(){return $t.zoomPan&&($t.zoomPan.raf=Z(n.panAnimLoop),n.now=At(),n.timeDiff=n.now-n.lastNow,n.lastNow=n.now,n.calculateAnimOffset("x"),n.calculateAnimOffset("y"),Ot(),n.calculateOverBoundsAnimOffset("x"),n.calculateOverBoundsAnimOffset("y"),n.speedDecelerationRatioAbs.x<.05&&n.speedDecelerationRatioAbs.y<.05)?(ft.x=Math.round(ft.x),ft.y=Math.round(ft.y),Ot(),void Jt("zoomPan")):void 0}};return n},Wn=function(e){return e.calculateSwipeSpeed("y"),nt=a.currItem.bounds,e.backAnimDestination={},e.backAnimStarted={},Math.abs(e.lastFlickSpeed.x)<=.05&&Math.abs(e.lastFlickSpeed.y)<=.05?(e.speedDecelerationRatioAbs.x=e.speedDecelerationRatioAbs.y=0,e.calculateOverBoundsAnimOffset("x"),e.calculateOverBoundsAnimOffset("y"),!0):(Qt("zoomPan"),e.lastNow=At(),void e.panAnimLoop())},Gn=function(e,t){var n;ot||(yn=m);var i;if("swipe"===e){var r=un.x-cn.x,l=t.lastFlickDist.x<10;r>on&&(l||t.lastFlickOffset.x>20)?i=-1:-on>r&&(l||t.lastFlickOffset.x<-20)&&(i=1)}var u;i&&(m+=i,0>m?(m=s.loop?Qn()-1:0,u=!0):m>=Qn()&&(m=s.loop?0:Qn()-1,u=!0),(!u||s.loop)&&(gt+=i,ht-=i,n=!0));var c,d=xt.x*ht,p=Math.abs(d-xn.x);return n||d>xn.x==t.lastFlickSpeed.x>0?(c=Math.abs(t.lastFlickSpeed.x)>0?p/Math.abs(t.lastFlickSpeed.x):333,c=Math.min(c,400),c=Math.max(c,250)):c=333,yn===m&&(n=!1),ot=!0,Tt("mainScrollAnimStart"),tn("mainScroll",xn.x,d,c,o.easing.cubic.out,Ft,function(){en(),ot=!1,yn=-1,(n||yn!==m)&&a.updateCurrItem(),Tt("mainScrollAnimComplete")}),n&&a.updateCurrItem(!0),n},Vn=function(e){return 1/tt*e*g},Xn=function(){var e=x,t=Yt(),n=Wt();t>x?e=t:x>n&&(e=n);var i,r=1,l=st;return lt&&!Y&&!ut&&t>x?(a.close(),!0):(lt&&(i=function(e){Et((r-l)*e+l)}),a.zoomTo(e,0,300,o.easing.cubic.out,i),!0)};It("Gestures",{publicMethods:{initGestures:function(){var e=function(e,t,n,i,o){S=e+t,T=e+n,A=e+i,E=o?e+o:""};O=N.pointerEvent,O&&N.touch&&(N.touch=!1),O?navigator.pointerEnabled?e("pointer","down","move","up","cancel"):e("MSPointer","Down","Move","Up","Cancel"):N.touch?(e("touch","start","move","end","cancel"),R=!0):e("mouse","down","move","up"),y=T+" "+A+" "+E,h=S,O&&!R&&(R=navigator.maxTouchPoints>1||navigator.msMaxTouchPoints>1),a.likelyTouchDevice=R,v[S]=Nn,v[T]=Un,v[A]=Hn,E&&(v[E]=v[A]),N.touch&&(h+=" mousedown",y+=" mousemove mouseup",v.mousedown=v[S],v.mousemove=v[T],v.mouseup=v[A]),R||(s.allowPanToNext=!1)}}});var Kn,qn,$n,jn,Jn,Qn,ei,ti=function(t,n,i,r){Kn&&clearTimeout(Kn),jn=!0,$n=!0;var l;t.initialLayout?(l=t.initialLayout,t.initialLayout=null):l=s.getThumbBoundsFn&&s.getThumbBoundsFn(m);var u=i?s.hideAnimationDuration:s.showAnimationDuration,c=function(){Jt("initialZoom"),i?(a.template.removeAttribute("style"),a.bg.removeAttribute("style")):(Et(1),n&&(n.style.display="block"),o.addClass(e,"pswp--animated-in"),Tt("initialZoom"+(i?"OutEnd":"InEnd"))),r&&r(),jn=!1};if(!u||!l||void 0===l.x){var p=function(){Tt("initialZoom"+(i?"Out":"In")),x=t.initialZoomLevel,Pt(ft,t.initialPosition),Ot(),e.style.opacity=i?0:1,Et(1),c()};return void p()}var f=function(){var n=d,r=!a.currItem.src||a.currItem.loadError||s.showHideOpacity;t.miniImg&&(t.miniImg.style.webkitBackfaceVisibility="hidden"),i||(x=l.w/t.w,ft.x=l.x,ft.y=l.y-P,a[r?"template":"bg"].style.opacity=.001,Ot()),Qt("initialZoom"),i&&!n&&o.removeClass(e,"pswp--animated-in"),r&&(i?o[(n?"remove":"add")+"Class"](e,"pswp--animate_opacity"):setTimeout(function(){o.addClass(e,"pswp--animate_opacity")},30)),Kn=setTimeout(function(){if(Tt("initialZoom"+(i?"Out":"In")),i){var a=l.w/t.w,s={x:ft.x,y:ft.y},d=x,m=st,p=function(t){1===t?(x=a,ft.x=l.x,ft.y=l.y-z):(x=(a-d)*t+d,ft.x=(l.x-s.x)*t+s.x,ft.y=(l.y-z-s.y)*t+s.y),Ot(),r?e.style.opacity=1-t:Et(m-t*m)};n?tn("initialZoom",0,1,u,o.easing.cubic.out,p,c):(p(1),Kn=setTimeout(c,u+20))}else x=t.initialZoomLevel,Pt(ft,t.initialPosition),Ot(),Et(1),r?e.style.opacity=1:Et(1),Kn=setTimeout(c,u+20)},i?25:90)};f()},ni={},ii=[],oi={index:0,errorMsg:'<div class="pswp__error-msg"><a href="%url%" target="_blank">The image</a> could not be loaded.</div>',forceProgressiveLoading:!1,preload:[1,1],getNumItemsFn:function(){return qn.length}},ai=function(){return{center:{x:0,y:0},max:{x:0,y:0},min:{x:0,y:0}}},ri=function(e,t,n){var i=e.bounds;i.center.x=Math.round((ni.x-t)/2),i.center.y=Math.round((ni.y-n)/2)+e.vGap.top,i.max.x=t>ni.x?Math.round(ni.x-t):i.center.x,i.max.y=n>ni.y?Math.round(ni.y-n)+e.vGap.top:i.center.y,i.min.x=t>ni.x?0:i.center.x,i.min.y=n>ni.y?e.vGap.top:i.center.y},li=function(e,t,n){if(e.src&&!e.loadError){var i=!n;if(i&&(e.vGap||(e.vGap={top:0,bottom:0}),Tt("parseVerticalMargin",e)),ni.x=t.x,ni.y=t.y-e.vGap.top-e.vGap.bottom,i){var o=ni.x/e.w,a=ni.y/e.h;e.fitRatio=a>o?o:a;var r=s.scaleMode;"orig"===r?n=1:"fit"===r&&(n=e.fitRatio),n>1&&(n=1),e.initialZoomLevel=n,e.bounds||(e.bounds=ai())}if(!n)return;return ri(e,e.w*n,e.h*n),i&&n===e.initialZoomLevel&&(e.initialPosition=e.bounds.center),e.bounds}return e.w=e.h=0,e.initialZoomLevel=e.fitRatio=1,e.bounds=ai(),e.initialPosition=e.bounds.center,e.bounds},si=function(e,t,n,i,o,r){if(!t.loadError){var l,u=a.isDragging()&&!a.isZooming(),c=e===m||a.isMainScrollAnimating()||u;!o&&(R||s.alwaysFadeIn)&&c&&(l=!0),i&&(l&&(i.style.opacity=0),t.imageAppended=!0,di(i,t.w,t.h),n.appendChild(i),l&&setTimeout(function(){i.style.opacity=1,r&&setTimeout(function(){t&&t.loaded&&t.placeholder&&(t.placeholder.style.display="none",t.placeholder=null)},500)},50))}},ui=function(e){e.loading=!0,e.loaded=!1;var t=e.img=o.createEl("pswp__img","img"),n=function(){e.loading=!1,e.loaded=!0,e.loadComplete?e.loadComplete(e):e.img=null,t.onload=t.onerror=null,t=null};return t.onload=n,t.onerror=function(){e.loadError=!0,n()},t.src=e.src,t},ci=function(e,t){return e.src&&e.loadError&&e.container?(t&&(e.container.innerHTML=""),e.container.innerHTML=s.errorMsg.replace("%url%",e.src),!0):void 0},di=function(e,t,n){e.style.width=t+"px",e.style.height=n+"px"},mi=function(){if(ii.length){for(var e,t=0;t<ii.length;t++)e=ii[t],e.holder.index===e.index&&si(e.index,e.item,e.baseDiv,e.img);ii=[]}};It("Controller",{publicMethods:{lazyLoadItem:function(e){e=Dt(e);var t=Jn(e);!t||t.loaded||t.loading||(Tt("gettingData",e,t),t.src&&ui(t))},initController:function(){o.extend(s,oi,!0),a.items=qn=n,Jn=a.getItemAt,Qn=s.getNumItemsFn,ei=s.loop,Qn()<3&&(s.loop=!1),St("beforeChange",function(e){var t,n=s.preload,i=null===e?!0:e>0,o=Math.min(n[0],Qn()),r=Math.min(n[1],Qn());for(t=1;(i?r:o)>=t;t++)a.lazyLoadItem(m+t);for(t=1;(i?o:r)>=t;t++)a.lazyLoadItem(m-t)}),St("initialLayout",function(){a.currItem.initialLayout=s.getThumbBoundsFn&&s.getThumbBoundsFn(m)}),St("mainScrollAnimComplete",mi),St("initialZoomInEnd",mi),St("destroy",function(){for(var e,t=0;t<qn.length;t++)e=qn[t],e.container&&(e.container=null),e.placeholder&&(e.placeholder=null),e.img&&(e.img=null),e.preloader&&(e.preloader=null),e.loadError&&(e.loaded=e.loadError=!1);ii=null})},getItemAt:function(e){return e>=0&&void 0!==qn[e]?qn[e]:!1},allowProgressiveImg:function(){return s.forceProgressiveLoading||!R||s.mouseUsed||screen.width>1200},setContent:function(e,t){s.loop&&(t=Dt(t));var n=a.getItemAt(e.index);n&&(n.container=null);var i,r=a.getItemAt(t);if(!r)return void(e.el.innerHTML="");Tt("gettingData",t,r),e.index=t,e.item=r;var l=r.container=o.createEl("pswp__zoom-wrap");if(!r.src&&r.html&&(r.html.tagName?l.appendChild(r.html):l.innerHTML=r.html),ci(r),!r.src||r.loadError||r.loaded)r.src&&!r.loadError&&(i=o.createEl("pswp__img","img"),i.style.webkitBackfaceVisibility="hidden",i.style.opacity=1,i.src=r.src,di(i,r.w,r.h),si(t,r,l,i,!0));else{if(r.loadComplete=function(n){if(u){if(n.img&&(n.img.style.webkitBackfaceVisibility="hidden"),e&&e.index===t){if(ci(n,!0))return n.loadComplete=n.img=null,li(n,yt),Rt(n),void(e.index===m&&a.updateCurrZoomItem());n.imageAppended?!jn&&n.placeholder&&(n.placeholder.style.display="none",n.placeholder=null):N.transform&&(ot||jn)?ii.push({item:n,baseDiv:l,img:n.img,index:t,holder:e}):si(t,n,l,n.img,ot||jn)}n.loadComplete=null,n.img=null,Tt("imageLoadComplete",t,n)}},o.features.transform){var c="pswp__img pswp__img--placeholder";c+=r.msrc?"":" pswp__img--placeholder--blank";var d=o.createEl(c,r.msrc?"img":"");r.msrc&&(d.src=r.msrc),di(d,r.w,r.h),l.appendChild(d),r.placeholder=d}r.loading||ui(r),a.allowProgressiveImg()&&(!$n&&N.transform?ii.push({item:r,baseDiv:l,img:r.img,index:t,holder:e}):si(t,r,l,r.img,!0,!0))}li(r,yt),$n||t!==m?Rt(r):(it=l.style,ti(r,i||r.img)),e.el.innerHTML="",e.el.appendChild(l)},cleanSlide:function(e){e.img&&(e.img.onload=e.img.onerror=null),e.loaded=e.loading=e.img=e.imageAppended=!1}}});var pi,fi={},yi=function(e,t,n){var i=document.createEvent("CustomEvent"),o={origEvent:e,target:e.target,releasePoint:t,pointerType:n||"touch"};i.initCustomEvent("pswpTap",!0,!0,o),e.target.dispatchEvent(i)};It("Tap",{publicMethods:{initTap:function(){St("firstTouchStart",a.onTapStart),St("touchRelease",a.onTapRelease),St("destroy",function(){fi={},pi=null})},onTapStart:function(e){e.length>1&&(clearTimeout(pi),pi=null)},onTapRelease:function(e,t){if(t&&!q&&!X&&!jt){var n=t;if(pi&&(clearTimeout(pi),pi=null,Cn(n,fi)))return void Tt("doubleTap",n);if("mouse"===t.type)return void yi(e,t,"mouse");var i=e.target.tagName.toUpperCase();if("BUTTON"===i||o.hasClass(e.target,"pswp__single-tap"))return void yi(e,t);Pt(fi,n),pi=setTimeout(function(){yi(e,t),pi=null},300)}}}});var hi;It("DesktopZoom",{publicMethods:{initDesktopZoom:function(){_||(R?St("mouseUsed",function(){a.setupDesktopZoom()}):a.setupDesktopZoom(!0))},setupDesktopZoom:function(t){hi={};var n="wheel mousewheel DOMMouseScroll";St("bindEvents",function(){o.bind(e,n,a.handleMouseWheel)}),St("unbindEvents",function(){hi&&o.unbind(e,n,a.handleMouseWheel)}),a.mouseZoomedIn=!1;var i,r=function(){a.mouseZoomedIn&&(o.removeClass(e,"pswp--zoomed-in"),a.mouseZoomedIn=!1),1>x?o.addClass(e,"pswp--zoom-allowed"):o.removeClass(e,"pswp--zoom-allowed"),l()},l=function(){i&&(o.removeClass(e,"pswp--dragging"),i=!1)};St("resize",r),St("afterChange",r),St("pointerDown",function(){a.mouseZoomedIn&&(i=!0,o.addClass(e,"pswp--dragging"))}),St("pointerUp",l),t||r()},handleMouseWheel:function(e){if(x<=a.currItem.fitRatio)return s.modal&&(s.closeOnScroll?k&&Math.abs(e.deltaY)>2&&(d=!0,a.close()):e.preventDefault()),!0;if(e.stopPropagation(),hi.x=0,"deltaX"in e)1===e.deltaMode?(hi.x=18*e.deltaX,hi.y=18*e.deltaY):(hi.x=e.deltaX,hi.y=e.deltaY);else if("wheelDelta"in e)e.wheelDeltaX&&(hi.x=-.16*e.wheelDeltaX),hi.y=e.wheelDeltaY?-.16*e.wheelDeltaY:-.16*e.wheelDelta;else{if(!("detail"in e))return;hi.y=e.detail}Ht(x,!0);var t=ft.x-hi.x,n=ft.y-hi.y;(s.modal||t<=nt.min.x&&t>=nt.max.x&&n<=nt.min.y&&n>=nt.max.y)&&e.preventDefault(),a.panTo(t,n)},toggleDesktopZoom:function(t){t=t||{x:yt.x/2+vt.x,y:yt.y/2+vt.y};var n=s.getDoubleTapZoom(!0,a.currItem),i=x===n;a.mouseZoomedIn=!i,a.zoomTo(i?a.currItem.initialZoomLevel:n,t,333),o[(i?"remove":"add")+"Class"](e,"pswp--zoomed-in")}}});var vi,xi,gi,wi,bi,Ci,Ii,Di,Mi,Si,Ti,Ai={history:!0,galleryUID:1},Ei=function(){return Si.hash.substring(1)},ki=function(){vi&&clearTimeout(vi),xi&&clearTimeout(xi)},Oi=function(){var e=Ei(),t={};if(e.length<5)return t;var n,i=e.split("&");for(n=0;n<i.length;n++)if(i[n]){var o=i[n].split("=");o.length<2||(t[o[0]]=o[1])}if(s.galleryPIDs){var a=t.pid;for(t.pid=0,n=0;n<qn.length;n++)if(qn[n].pid===a){t.pid=n;break}}else t.pid=parseInt(t.pid,10)-1;return t.pid<0&&(t.pid=0),t},Ri=function(){return!1};It("History",{publicMethods:{initHistory:function(){if(o.extend(s,Ai,!0),s.history){Si=window.location,Mi=!1,Di=!1,Ii=!1,Ci=Ei(),Ti="pushState"in history,Ci.indexOf("gid=")>-1&&(Ci=Ci.split("&gid=")[0],Ci=Ci.split("?gid=")[0]),St("afterChange",a.updateURL),St("unbindEvents",function(){o.unbind(window,"hashchange",a.onHashChange)});var e=function(){bi=!0,Di||(Mi?history.back():Ci?Si.hash=Ci:Ti?history.pushState("",document.title,Si.pathname+Si.search):Si.hash=""),ki()};St("unbindEvents",function(){d&&e()}),St("destroy",function(){bi||e()}),St("firstUpdate",function(){m=Oi().pid});var t=Ci.indexOf("pid=");t>-1&&(Ci=Ci.substring(0,t),"&"===Ci.slice(-1)&&(Ci=Ci.slice(0,-1))),setTimeout(function(){u&&o.bind(window,"hashchange",a.onHashChange)},40)}},onHashChange:function(){return Ei()===Ci?(Di=!0,void a.close()):void(gi||(wi=!0,a.goTo(Oi().pid),wi=!1))},updateURL:function(){ki(),wi||(Ii?vi=setTimeout(Ri,800):Ri())}}}),o.extend(a,nn)};return e});!function(a,b){"function"==typeof define&&define.amd?define(b):"object"==typeof exports?module.exports=b():a.PhotoSwipeUI_Default=b()}(this,function(){"use strict";var a=function(a,b){var c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v=this,w=!1,x=!0,y=!0,z={barsSize:{top:44,bottom:"auto"},closeElClasses:["item","caption","zoom-wrap","ui","top-bar"],timeToIdle:4e3,timeToIdleOutside:1e3,loadingIndicatorDelay:1e3,addCaptionHTMLFn:function(a,b){return a.title?(b.children[0].innerHTML=a.title,!0):(b.children[0].innerHTML="",!1)},closeEl:!0,captionEl:!0,fullscreenEl:!0,zoomEl:!0,shareEl:!0,counterEl:!0,arrowEl:!0,preloaderEl:!0,tapToClose:!1,tapToToggleControls:!0,clickToCloseNonZoomable:!0,shareButtons:[{id:"facebook",label:"Share on Facebook",url:"https://www.facebook.com/sharer/sharer.php?u={{url}}"},{id:"twitter",label:"Tweet",url:"https://twitter.com/intent/tweet?text={{text}}&url={{url}}"},{id:"pinterest",label:"Pin it",url:"http://www.pinterest.com/pin/create/button/?url={{url}}&media={{image_url}}&description={{text}}"},{id:"download",label:"Download image",url:"{{raw_image_url}}",download:!0}],getImageURLForShare:function(){return a.currItem.src||""},getPageURLForShare:function(){return window.location.href},getTextForShare:function(){return a.currItem.title||""},indexIndicatorSep:" / "},A=function(a){if(r)return!0;a=a||window.event,q.timeToIdle&&q.mouseUsed&&!k&&K();for(var c,d,e=a.target||a.srcElement,f=e.className,g=0;g<S.length;g++)c=S[g],c.onTap&&f.indexOf("pswp__"+c.name)>-1&&(c.onTap(),d=!0);if(d){a.stopPropagation&&a.stopPropagation(),r=!0;var h=b.features.isOldAndroid?600:30;s=setTimeout(function(){r=!1},h)}},B=function(){return!a.likelyTouchDevice||q.mouseUsed||screen.width>1200},C=function(a,c,d){b[(d?"add":"remove")+"Class"](a,"pswp__"+c)},D=function(){var a=1===q.getNumItemsFn();a!==p&&(C(d,"ui--one-slide",a),p=a)},E=function(){C(i,"share-modal--hidden",y)},F=function(){return y=!y,y?(b.removeClass(i,"pswp__share-modal--fade-in"),setTimeout(function(){y&&E()},300)):(E(),setTimeout(function(){y||b.addClass(i,"pswp__share-modal--fade-in")},30)),y||H(),!1},G=function(b){b=b||window.event;var c=b.target||b.srcElement;return a.shout("shareLinkClick",b,c),c.href?c.hasAttribute("download")?!0:(window.open(c.href,"pswp_share","scrollbars=yes,resizable=yes,toolbar=no,location=yes,width=550,height=420,top=100,left="+(window.screen?Math.round(screen.width/2-275):100)),y||F(),!1):!1},H=function(){for(var a,b,c,d,e,f="",g=0;g<q.shareButtons.length;g++)a=q.shareButtons[g],c=q.getImageURLForShare(a),d=q.getPageURLForShare(a),e=q.getTextForShare(a),b=a.url.replace("{{url}}",encodeURIComponent(d)).replace("{{image_url}}",encodeURIComponent(c)).replace("{{raw_image_url}}",c).replace("{{text}}",encodeURIComponent(e)),f+='<a href="'+b+'" target="_blank" class="pswp__share--'+a.id+'"'+(a.download?"download":"")+">"+a.label+"</a>",q.parseShareButtonOut&&(f=q.parseShareButtonOut(a,f));i.children[0].innerHTML=f,i.children[0].onclick=G},I=function(a){for(var c=0;c<q.closeElClasses.length;c++)if(b.hasClass(a,"pswp__"+q.closeElClasses[c]))return!0},J=0,K=function(){clearTimeout(u),J=0,k&&v.setIdle(!1)},L=function(a){a=a?a:window.event;var b=a.relatedTarget||a.toElement;b&&"HTML"!==b.nodeName||(clearTimeout(u),u=setTimeout(function(){v.setIdle(!0)},q.timeToIdleOutside))},M=function(){q.fullscreenEl&&(c||(c=v.getFullscreenAPI()),c?(b.bind(document,c.eventK,v.updateFullscreen),v.updateFullscreen(),b.addClass(a.template,"pswp--supports-fs")):b.removeClass(a.template,"pswp--supports-fs"))},N=function(){q.preloaderEl&&(O(!0),l("beforeChange",function(){clearTimeout(o),o=setTimeout(function(){a.currItem&&a.currItem.loading?(!a.allowProgressiveImg()||a.currItem.img&&!a.currItem.img.naturalWidth)&&O(!1):O(!0)},q.loadingIndicatorDelay)}),l("imageLoadComplete",function(b,c){a.currItem===c&&O(!0)}))},O=function(a){n!==a&&(C(m,"preloader--active",!a),n=a)},P=function(a){var c=a.vGap;if(B()){var g=q.barsSize;if(q.captionEl&&"auto"===g.bottom)if(f||(f=b.createEl("pswp__caption pswp__caption--fake"),f.appendChild(b.createEl("pswp__caption__center")),d.insertBefore(f,e),b.addClass(d,"pswp__ui--fit")),q.addCaptionHTMLFn(a,f,!0)){var h=f.clientHeight;c.bottom=parseInt(h,10)||44}else c.bottom=g.top;else c.bottom="auto"===g.bottom?0:g.bottom;c.top=g.top}else c.top=c.bottom=0},Q=function(){q.timeToIdle&&l("mouseUsed",function(){b.bind(document,"mousemove",K),b.bind(document,"mouseout",L),t=setInterval(function(){J++,2===J&&v.setIdle(!0)},q.timeToIdle/2)})},R=function(){l("onVerticalDrag",function(a){x&&.95>a?v.hideControls():!x&&a>=.95&&v.showControls()});var a;l("onPinchClose",function(b){x&&.9>b?(v.hideControls(),a=!0):a&&!x&&b>.9&&v.showControls()}),l("zoomGestureEnded",function(){a=!1,a&&!x&&v.showControls()})},S=[{name:"caption",option:"captionEl",onInit:function(a){e=a}},{name:"share-modal",option:"shareEl",onInit:function(a){i=a},onTap:function(){F()}},{name:"button--share",option:"shareEl",onInit:function(a){h=a},onTap:function(){F()}},{name:"button--zoom",option:"zoomEl",onTap:a.toggleDesktopZoom},{name:"counter",option:"counterEl",onInit:function(a){g=a}},{name:"button--close",option:"closeEl",onTap:a.close},{name:"button--arrow--left",option:"arrowEl",onTap:a.prev},{name:"button--arrow--right",option:"arrowEl",onTap:a.next},{name:"button--fs",option:"fullscreenEl",onTap:function(){c.isFullscreen()?c.exit():c.enter()}},{name:"preloader",option:"preloaderEl",onInit:function(a){m=a}}],T=function(){var a,c,e,f=function(d){if(d)for(var f=d.length,g=0;f>g;g++){a=d[g],c=a.className;for(var h=0;h<S.length;h++)e=S[h],c.indexOf("pswp__"+e.name)>-1&&(q[e.option]?(b.removeClass(a,"pswp__element--disabled"),e.onInit&&e.onInit(a)):b.addClass(a,"pswp__element--disabled"))}};f(d.children);var g=b.getChildByClass(d,"pswp__top-bar");g&&f(g.children)};v.init=function(){b.extend(a.options,z,!0),q=a.options,d=b.getChildByClass(a.scrollWrap,"pswp__ui"),l=a.listen,R(),l("beforeChange",v.update),l("doubleTap",function(b){var c=a.currItem.initialZoomLevel;a.getZoomLevel()!==c?a.zoomTo(c,b,333):a.zoomTo(q.getDoubleTapZoom(!1,a.currItem),b,333)}),l("preventDragEvent",function(a,b,c){var d=a.target||a.srcElement;d&&d.className&&a.type.indexOf("mouse")>-1&&(d.className.indexOf("__caption")>0||/(SMALL|STRONG|EM)/i.test(d.tagName))&&(c.prevent=!1)}),l("bindEvents",function(){b.bind(d,"pswpTap click",A),b.bind(a.scrollWrap,"pswpTap",v.onGlobalTap),a.likelyTouchDevice||b.bind(a.scrollWrap,"mouseover",v.onMouseOver)}),l("unbindEvents",function(){y||F(),t&&clearInterval(t),b.unbind(document,"mouseout",L),b.unbind(document,"mousemove",K),b.unbind(d,"pswpTap click",A),b.unbind(a.scrollWrap,"pswpTap",v.onGlobalTap),b.unbind(a.scrollWrap,"mouseover",v.onMouseOver),c&&(b.unbind(document,c.eventK,v.updateFullscreen),c.isFullscreen()&&(q.hideAnimationDuration=0,c.exit()),c=null)}),l("destroy",function(){q.captionEl&&(f&&d.removeChild(f),b.removeClass(e,"pswp__caption--empty")),i&&(i.children[0].onclick=null),b.removeClass(d,"pswp__ui--over-close"),b.addClass(d,"pswp__ui--hidden"),v.setIdle(!1)}),q.showAnimationDuration||b.removeClass(d,"pswp__ui--hidden"),l("initialZoomIn",function(){q.showAnimationDuration&&b.removeClass(d,"pswp__ui--hidden")}),l("initialZoomOut",function(){b.addClass(d,"pswp__ui--hidden")}),l("parseVerticalMargin",P),T(),q.shareEl&&h&&i&&(y=!0),D(),Q(),M(),N()},v.setIdle=function(a){k=a,C(d,"ui--idle",a)},v.update=function(){x&&a.currItem?(v.updateIndexIndicator(),q.captionEl&&(q.addCaptionHTMLFn(a.currItem,e),C(e,"caption--empty",!a.currItem.title)),w=!0):w=!1,y||F(),D()},v.updateFullscreen=function(d){d&&setTimeout(function(){a.setScrollOffset(0,b.getScrollY())},50),b[(c.isFullscreen()?"add":"remove")+"Class"](a.template,"pswp--fs")},v.updateIndexIndicator=function(){q.counterEl&&(g.innerHTML=a.getCurrentIndex()+1+q.indexIndicatorSep+q.getNumItemsFn())},v.onGlobalTap=function(c){c=c||window.event;var d=c.target||c.srcElement;if(!r)if(c.detail&&"mouse"===c.detail.pointerType){if(I(d))return void a.close();b.hasClass(d,"pswp__img")&&(1===a.getZoomLevel()&&a.getZoomLevel()<=a.currItem.fitRatio?q.clickToCloseNonZoomable&&a.close():a.toggleDesktopZoom(c.detail.releasePoint))}else if(q.tapToToggleControls&&(x?v.hideControls():v.showControls()),q.tapToClose&&(b.hasClass(d,"pswp__img")||I(d)))return void a.close()},v.onMouseOver=function(a){a=a||window.event;var b=a.target||a.srcElement;C(d,"ui--over-close",I(b))},v.hideControls=function(){b.addClass(d,"pswp__ui--hidden"),x=!1},v.showControls=function(){x=!0,w||v.update(),b.removeClass(d,"pswp__ui--hidden")},v.supportsFullscreen=function(){var a=document;return!!(a.exitFullscreen||a.mozCancelFullScreen||a.webkitExitFullscreen||a.msExitFullscreen)},v.getFullscreenAPI=function(){var b,c=document.documentElement,d="fullscreenchange";return c.requestFullscreen?b={enterK:"requestFullscreen",exitK:"exitFullscreen",elementK:"fullscreenElement",eventK:d}:c.mozRequestFullScreen?b={enterK:"mozRequestFullScreen",exitK:"mozCancelFullScreen",elementK:"mozFullScreenElement",eventK:"moz"+d}:c.webkitRequestFullscreen?b={enterK:"webkitRequestFullscreen",exitK:"webkitExitFullscreen",elementK:"webkitFullscreenElement",eventK:"webkit"+d}:c.msRequestFullscreen&&(b={enterK:"msRequestFullscreen",exitK:"msExitFullscreen",elementK:"msFullscreenElement",eventK:"MSFullscreenChange"}),b&&(b.enter=function(){return j=q.closeOnScroll,q.closeOnScroll=!1,"webkitRequestFullscreen"!==this.enterK?a.template[this.enterK]():void a.template[this.enterK](Element.ALLOW_KEYBOARD_INPUT)},b.exit=function(){return q.closeOnScroll=j,document[this.exitK]()},b.isFullscreen=function(){return document[this.elementK]}),b}};return a});var m = m || false;
var imgs = [];
if (m && m.images && m.images.length > 0) imgs = m.images;

$(function(){

	var visible = 0, add = false;
	var pswpElement = document.querySelectorAll('.pswp')[0];
	
	var FixSize = (function(){
		var E = function() {
			// Меряем размер панельки заголовков
			var WW = $(window).width();
			var paddings = 20;
			
			if ($('#p').hasClass('mini')) {
				var pwidth = $('#p').data('W');
			} else {
				var pwidth = 0;
				$('#p .cascade .pane, #p .right').each(function(){ pwidth += ($(this).width() + paddings); });
				$('#p').data('W', pwidth)
			}
			if (WW >= pwidth + paddings) {
				console.log('Full Panel');
				$('.place').html('');
				$('#p').removeClass('mini');
			} else {
				console.log('Small Panel');
				var html = '';
				var g = $('.pgtitle').html();
				if (g) html += '<h2><a href="/">' +g+ '</a></h2>'; 
				var a = $('.pmtitle').html();
				if (a) html += '<h3>' +a+ '</h3>'; 
				$('.place').html(html);
				$('#p').addClass('mini');
			}
			FixWidth('.imgs.e', 'a', WW > 360 ? 200 : 120, 3);
		};
		E();
		$('.imgs.e').css({ height : 'auto' });
		return E;
	}());

	var ShowImages = (function(){
		if (imgs.length == 0) return;
		var adding = false;
		var visibleImages = 0;
		var margin = 6;
		var Show = function() {
			if (adding) return;
			var area = $('.imgs.e').width();
			var imageSize = $('.imgs.e a')[0].style.height;
			var size = Number(imageSize.replace('px','')) + margin;
			var height = $(window).height() + window.scrollY;
			var count = Math.round(height/size + 1) * Math.round(area/size);
			adding = setInterval(function(){
				console.log(visibleImages);
				if (visibleImages < imgs.length && visibleImages < count) {
					var src = hard + imgs[visibleImages].src_xthumb;
					var img = '<img src="'+src+'" onload="$(this).fadeIn(250)" />';
					$('[data-id="'+imgs[visibleImages].id+'"]').html(img);
					visibleImages++;
				} else {
					clearInterval(adding);
					adding = false;
				}
			}, 50);
		};
		Show();
		return Show;
	}());

	window.onresize = function(){ Stack(FixSize, 300); Stack(ShowImages, 50); };
	window.onscroll = function(){ Stack(ShowImages, 50); };
	
	// Просмотр изображений в альбома
	(function(){
		var items = [];
		for (var i in imgs) {
			var src = Picture.Src(imgs[i]);
			var size = Picture.Size(src);
			items.push({
				'src' : src,
				'w'   : size[0],
				'h'   : size[1],
				'pid' : imgs[i].id
			});
		}
		
		var gallery = false;
		var current = '';

		setInterval(function(){
			var id = GetID();
			if (current != id) {
				current = id;
				if (current != '') OpenSwipe(id);
				console.log('> Changed');
			}
		}, 100);

		$('.imgs.e a').click(function(e){
			e.preventDefault();
			OpenSwipe( $(this).data('id') )
		});

		function UpdateUrl(i) {
			var title = (i || i === 0) ? [imgs[i].title] : [];
			title.push(m.title, m.author, 'Мазепа');
			$('title').html(title.join(' ∞ '));

			var url = location.pathname.indexOf('/albums/') ? '/' : '/albums/';
			url += Number(m.id).toString(32) + '/';
			if (i || i === 0) url += imgs[i].id;
			history.pushState(false, title.join(' ∞ '), url);
		}

		function OpenSwipe(id) {
			var image = $('[data-id="'+id+'"]');
			if (image.length == 0) return UpdateUrl();

			var index = image.data('i');
			if (gallery) return gallery.goTo(index);

			var options = { index : index };
			gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
			gallery.listen('close', function() {
				UpdateUrl();
				gallery = false;
			});
			gallery.listen('afterChange', function(e) {
				var index = $('[data-id="'+gallery.currItem.pid+'"]').data('i');
				UpdateUrl(index);
			});
			gallery.init();
		}

		function GetID() {
			return location.pathname.split('/').slice(3)[0] || '';
		}

	}());
	
	// Bookmark
	(function() {
		var request = false;
		var e = $(".bookmark");
		if (e.length == 0) return;

		if (m.bookmark) e.addClass('saved')[0].dataset.tooltip = 'Убрать из закладок';

		e.click(function() {
			if (level == 0) return Login();
			if (request) return;
			request = true;
			if (e.hasClass('saved')) {
				var add = 0;
				e.removeClass('saved')[0].dataset.tooltip = 'Добавить в закладки';
			} else {
				var add = 1;
				e.addClass('saved')[0].dataset.tooltip = 'Убрать из закладок';
			}
			Library('Bookmark', {aid : m.id, add : add}, function(){
				request = false;
			});
		});
	}());
	
});
