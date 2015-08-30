var m = m || false;
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
