
var Media = (function(){
	// !- Список альбомов и галерей
	var albums = [], gallery = [];
	// Статус клавиши Shift
	var shiftKey = false;
	// Мышь:
	var mouse = [0,0];

	// !- Альбом : Поиск по id
	var FindAlbum = function(aid){
		// Специальный альбом: Импорт «0»
		if (aid ===  0) return { 'title' : 'Загруженные фотографии', 'option' : '' };
		// Специальный альбом: Корзина «0»
		if (aid === -1) return { 'aid' : -1, 'title' : 'Корзина', 'option' : '<a class="waves-button waves-float mini option">Очистить корзину</a>' };
		// Поиск по альбомам
		var a = {};
		for (var i in albums){
			if (albums[i].id == aid) {
				albums[i].url = location.origin + '/albums/' + parseInt(albums[i].id).toString(32);
				albums[i]['option'] = '';
				return albums[i];
			}
		}
		// Не найдено:
		return false;
	};
	
	// !- Чтение данных из всех input'ов
	var InputsData = function(e){
		var data = [];
		e.find('input, textarea, select').each(function(){
			data.push($(this).val());
		});
		return data;
	};

	// !- Галерея : Поиск по id
	var FindGallery = function(gid){
		for (var i in gallery) if (gallery[i].id == gid) return gallery[i];
		// Не найдено:
		return false;
	};

	// !- Открыть/закрыть загрузчик
	var Uploader = {
		'Open' : function(){
			$('#media').removeClass('HideInfo');
			$('#info .upload').addClass('open');
		},
		'Close' : function(){
			$('#info .upload').removeClass('open');
		}
	};

	// !- Альбом
	var Album = (function(){
		var images = [], current = false;

		var FindImage = function(mid, getIndex){
			for (var i in images) {
				if (images[i].id == mid) {
					return (getIndex || false) ? i : images[i];
				}
			}
			return false;
		};
		
		var Img = (function(){
			var col   = $('#colors'), 
				data  = $('#data'), 
				mono  = $('#one'), 
				meta  = $('#meta'), 
				thumb = $('#thumb'), 
				iname = $('#name'),
				multi = $('#multi');
			
			// Очистка правой панели
			function Clear(){
				col.html(''), meta.html(''), thumb.html(''), iname.html('');
				multi.html('');
				mono.fadeOut(0);
				if (current.id > 0) $('#ainfo').fadeIn(0);
			}
			// Перемещение в альбом:
			function ImagesToAlbum(aid){
				if (current.id == aid) return ;
				if (!FindAlbum(aid)) return ;
				var selected = [];
				$('.image.i').each(function(e, h){
					var id = $(h).data('id');
					selected.push( id );
					var imagesR = [];
					for (var i in images) if (images[i]['id'] != id) imagesR.push(images[i])
					images = imagesR;
				}).remove();
				Library('ImagesToAlbum', {aid : aid, data : selected}, function(e){});
				Clear();
			}
			// Когда выделено несколько фотографий:
			function ImageActions(one){
				Uploader.Close();
				if (!one) Clear();
				
				var data = {
					'count'   : $('.image.i').length,
					'images'  : '',
					'achange' : '<option value="stop" selected>Переместить в альбом…</option>'
				};
				$(albums).each(function(){
					if (this.id != current.id){
						data['achange'] += '<option value="' + this.id + '">' + this.title + '</option>';
					} 
				});
				$('.image.i').each(function(e, h){
					var imgdata = FindImage( $(h).data('id') );
					if (imgdata) data['images'] = '<img class="mini" src="' + hard + imgdata.src_thumb +'" />' + data['images'];
				});
				data.sclass = '';
				if ($('.image.i').length > 40) { data.sclass = 'p40'; }
				multi.html( Templates('imageMultiSelect', data) );
				$('#ainfo').fadeOut(0);
				// Отправка в альбом:
				$('.mis .place').change(function(){
					var toalb = $(this).val();
					$(this).val('stop');
					return ImagesToAlbum(toalb);
				});
				$('.mis .c a.Q').click(DSelect);
				$('.mis .c a.F').click(Select);
				$('.mis .c a.D').click(function(){ ImagesToAlbum(-1); });
				$('.mis .c a.L').click(function(){ Album.RotateImages('left'); });
				$('.mis .c a.R').click(function(){ Album.RotateImages('left'); });
				if (one) $('.mis .selcount, .mis .th').remove(), mono.fadeIn(0);
				
			}
			// Вставка информации из localStorage
			function InsertInfo(e){
				Clear();
				var mid = typeof(e) == "object" ? e.id : e;
				var key = 'EXIF:' + mid;
				if (localStorage.getItem(key) == null) return Get(key);
				var data = JSON.parse( localStorage.getItem(key) );
				if (!data || !data.exif) return Get(key);
				// Exif (meta) данные изображения
				ExifData(data.exif);
				// Палитра фотогарфии
				Colors(data.colors);
				// Миниатюрка фотографии
				Thumbnail(FindImage(mid));
				$('#ainfo').fadeOut(0);
				ImageActions(true);
				
			}
			// Миниатюрка фотографии
			function Thumbnail(e){
				// Имя картинки
				iname.html('<input type="text" class="form-c" value="' + e.title + '" />');
				// Миниатюрка
				thumb.html('<img src="'+ hard + (e.src_small ? e.src_small : e.src_main) +'" />');
				var mid = e.id;
				iname.find('input').keyup(function(e){
					var title = $(this).val();
					Stack(function(){
						Library('ImageRename', {mid : mid, title : title}, function(r){
							for(var i in images) if (images[i].id == mid) images[i].title = r.title;
						});
					}, 700);
				});
			}
			// Exif фотографии
			function ExifData(exif){
				meta.html('');
				for (var par in exif){
					if (exif[par] && exif[par] != ''){
						meta.append('<p><b>' + par + '</b><span>' + exif[par] + '</span></p>');
					}
				}
			}
			// Палитра фотогарфии
			function Colors(colors){
				var html = '', sum = 0, full = 250;
				for (var i in colors){
					sum += parseInt(colors[i].val);
				}
				for (var i in colors){
					colors[i].W = Math.round(100 * colors[i].val * full / sum) / 100;
					colors[i].T = 'RGB: #' + colors[i].color + ' [' + colors[i].val + ']';
					html += Templates('imageColors', colors[i]);
				}
				col.html('<div class="palette">' + html + '</div>');
				// События клика в цвет
				col.find('a').click(function(e){
					e.preventDefault();
					var color = $(this).attr('href');
					console.log(color);
					//insert_album_html('Поиск по цвету: 
					// <span class="color"><i style="background:#' + color + ';"> </i> #' + color + '</span>', 'color');
					//api('color_search', { color : color}, function(ret){ picts = ret.images; insert_images(); });
				});
			}
			// Получение информации с сервера
			function Get(key){
				var mid = key.split(':')[1] || key;
				Library('ImageInfo', {mid : mid}, function(ret){
					localStorage.setItem(key, JSON.stringify({'exif' : ret.exif, 'colors' : ret.colors}));
					InsertInfo(mid);
				});
			}
			// Конь в пальто
			function Click(obj, e){
				Uploader.Close();
				if (!shiftKey) {
					if (e && e.button == 2 && obj.hasClass('i')) {
						// Правый клик в выбранные фотографии
					} else {
						$('.image.i').removeClass('i');
						$(obj).addClass('i');
						InsertInfo(obj.data('id'));
					}
				} else {
					if (obj.hasClass('i')){ 
						$(obj).removeClass('i');
					} else {
						$(obj).addClass('i');
					}
					if ($('.image.i').length == 1){
						return InsertInfo($('.image.i').data('id'));
					}
					if ($('.image.i').length > 1){
						return ImageActions();
					}
					Clear();
				}
			}
			// Выбор фотографий
			function Select(){
				$('#right .image').addClass('i');
				ImageActions();
			}
			// Отмена выбора фотографий
			function DSelect(){
				$('#right .image').removeClass('i');
				Clear();
			}
			// Export
			function Export(e) {
				// Одна
				if ($('.image.i').length == 1){
					var t = FindImage( $('.image.i').data('id') );
					var inputs = '';
					for (var key in t) if (key[0] == 's' && t[key]) {
						var size = Picture.Size( t[key] );
						inputs += Templates('exportImageInput', {'w' : size[0], 'h' : size[1], 'src' : location.protocol + hard + t[key]});
					}
					Modal.Open( Templates('exportImage', {'inputs' : inputs}), function(e){
						e.find('.cancel').click(Modal.Close);
					}, 600);
				}
				// Несколько
				if ($('.image.i').length > 1){
					var fM = [], fG = [];
					$('.image.i').each(function(k){
						var t = FindImage($(this).data('id'));
						if (t.src_medium == '') t.src_medium = t.src_large;
						if (t.src_medium == '') t.src_medium = t.src_main;
						fM.push(location.protocol + hard + t.src_main);
						fG.push(location.protocol + hard + t.src_medium);
					});
					Modal.Open( Templates('exportImages', {'main' : fM.join('\n'), 'gall' : fG.join('\n') }), function(e){
						e.find('.cancel').click(Modal.Close);
					}, 600);
				}
			}

			return {
				'Click'         : Click,
				'InsertInfo'    : InsertInfo,
				'Export'        : Export,
				'Clear'         : Clear,
				'ImagesToAlbum' : ImagesToAlbum,
				'Select'        : Select,
				'DSelect'       : DSelect
			};
		}());

		var View = (function(){
			var opened = false;
			var GetSelected = function(getLast, getIndex){
				var all = $('#right .image'), 
					sel = $('#right .image.i');
				if (sel.length > 0) {
					var ID = (getLast ? sel.slice(-1) : $(sel[0])).data('id');
					var pict = FindImage( ID, getIndex || false );
				}
				if (!pict) {
					var pict = FindImage( $(all[0]).data('id'), getIndex || false );
				}
				return pict;
			};
			var Open = function(){
				$('.view').remove();
				var data = GetSelected();
				$('.image.i').removeClass('i');
				$('[data-id="'+data.id+'"]').addClass('i');
				$(Templates('openImage', data)).appendTo('#main');
				$('.view .cnt').css( Picture.CSS(data) );
				$('.view .cnt img')[0].src = Picture.Src(data);
				$('.view .cnt img')[0].onload = function(){
					$('.view *').fadeIn(130);
				};
				opened = data;
				$('.view .edit a.D').mousedown(function(){ ImagesToAlbum(-1); if (Album) Album.View.Close(); });
				$('.view .edit a.L').mousedown(function(){ Album.RotateImages('left'); });
				$('.view .edit a.R').mousedown(function(){ Album.RotateImages('right'); });
				$('.view .edit a.X').mousedown(Album.View.Close);
			};
			var Close = function(e){
				if (!opened) return;
				if (FindImage(opened.id)) Img.InsertInfo(opened.id);
				opened = false;
				$('.view').remove();
			};
			var Space = function(ID){
				// Переключение?
				if (ID !== undefined){
					$('#right .image').removeClass('i');
					$('[data-id="' + images[ID].id + '"]').addClass('i');
					if (opened) return Open();
					return Img.InsertInfo(images[ID].id);
				}
				// Открыта фотогарфия? 
				if (opened) return Close();
				Open();
			};
			var Resize = function(){
				if (!opened) return ;
				$('.view .cnt').css( Picture.CSS(opened) );
				var newsize = function(){
					$('.view .cnt img')[0].src = Picture.Src(opened);
					console.log(Picture.Src(opened));
				};
				Stack(newsize, 300);
			};
			var Next = function(){
				var index = parseInt(GetSelected(true, true));
				var i = (index == images.length - 1) ? 0 : (index + 1); 
				Space(i);
			};
			var Prev = function(){
				var index = parseInt(GetSelected(false, true));
				var i = (index == 0) ? (images.length - 1) : (index - 1); 
				Space(i);
			};
			var Up = function(){
				var i = parseInt(GetSelected(true, true)) - Inline();
				Space(i < 0 ? 0 : i);
			};
			var Down = function(){
				var i = parseInt(GetSelected(false, true)) + Inline();
				Space(i > images.length - 1 ? images.length - 1 : i);
			};
			var Inline = function(){
				var imageMargin = 8, 
					imgW = $('#images .i').width() + imageMargin,
					areaW = $('#images').width() - 14;
				var inline = 1;
				while (areaW > imgW) {
					areaW -= imgW;
					inline++;
				}
				return inline - 1;
			};
			var IOpened = function(){
				return opened;
			};
			return { 
				'IOpened': IOpened,
				'Space'  : Space,
				'Close'  : Close,
				'Resize' : Resize,
				'Up'     : Up,
				'Down'   : Down,
				'Next'   : Next,
				'Prev'   : Prev
			}
		}());

		var Delete = function(aid){
			var aid = aid || current.id;
			console.log('Удаление альбома: ' + aid);
			Library('AlbumDelete', {aid : aid}, function(e){
				Update(e);
				if (current) Main();
			});
		};

		var Go = function(){
			window.open(current.url);
		};

		var DisplayImages = function(e){
			var tags = e.tags, dropped;
			images = e.images;
			// $('.isort').removeClass('isort');
			$('.e.ui-draggable').draggable("disable");
			for (var i in images) {
				var imageFade = 'style="display:none" onload="$(this).fadeIn(300)"';
				images[i].thumb = '<img src="' + hard + images[i].src_thumb + '" '+imageFade+' />';
				$('#images').append( Templates('eImage', images[i]) );
			}
			$('#images .image').mousedown(function(e){ 
				Img.Click( $(this), e );
			});
			$(".album").droppable({
				hoverClass : 'image-to-album',
				drop : function(e, h){
					dropped = true;
					console.log('IMG: ' + h.draggable.context.dataset.id + ' to album: ' + e.target.dataset.id);
					Img.ImagesToAlbum( e.target.dataset.id );
				}
			});

			$('#images').sortable({
				connectWith: ".album",
				helper: "clone",
				scroll: false,
				appendTo: $('#main'),
				start : function(){
					dropped = false;
				},
				update : function(){
					Stack(function(){
						if (dropped) return;
						var list = [];
						$('#images .image').each(function(){ list.push( $(this).data('id') ); });
						Library('ImagesSort', {aid : current.id, list : list }, function(){
							console.log('Сортировочка завершена');
						});
					}, 15);
				}
			});
			
			if (Context) {
				if (current.aid == -1) {
					Context.Init('#images .image', ['IP']);
				} else {
					Context.Init('#images .image', ['IP', 'ID', 'EX', '--', 'IR','IL', '--', 'ISN','ISD','ISI', '--', 'IF','IQ']);
				}
			}
			
			// Метки альбома
			(function(){
				var friends = false; 
				var v = $('.tagsinput input');
				
				var Added = function(){
					var added = [];
					$('.tags .list .f').each(function(){ added.push( $(this).data('sid') ) });
					return added;
				};
				var AddTag = function(info) {
					$('.tags .list').append( Templates('myFriend', info) );
					$('.tags .list .f a').click(function(){
						var sid = $(this).data('sid');
						Library('AlbumTag', { aid : current.id, act : 'remove', sid : sid });
						$('.list [data-sid="'+sid+'"]').fadeOut(200, function(){ $(this).remove() });
					});
				};

				var TagSearch = function(){
					var str = v.val().toUpperCase();
					if (str == '') return $('.friendsbox').fadeOut();
					if (!friends ) return;

					var html = '';
					for (var i in friends) {
						if (friends[i].name.toUpperCase().indexOf(str) != -1 && Added().indexOf(friends[i].sid) == -1) {
							friends[i].i = i;
							html += Templates('myFriend', friends[i]);
						}
					}
					html = html == '' ? '<div class="l">Не найдено</div>' : html;
					$('.friendsbox').html(html).fadeIn();
					$('.friendsbox .f').click(function(){
						var info = friends[$(this).data('i')];
						Library('AlbumTag', { aid : current.id, act: 'add', sid : info.sid });
						AddTag( info );
						v.val('');
					});
				};

				for (var i in tags) AddTag(tags[i]);

				v.focus(function(){
					if (friends) return TagSearch();
					Library('MyFriends', {}, function(ret){ friends = ret.friends; });
				});
				v.focusout(function(){
					$('.friendsbox').fadeOut();
				});
				v.keyup(TagSearch);
			}());
			
			//Sortable(  );
		};
		
		var LoadContent = function(aid){
			current = FindAlbum(aid);
			if (!current) return false;
			Uploader.Close();
			$('#media').removeClass('HideInfo');
			$('#right').html( Templates('albumContent', current) );
			$('#ainfo').html( Templates('editAlbumInfo', current) );
			$('[name="privacy"]').val(current.privacy);
			$('.e').removeClass('sel exist');
			$('.e[data-id="'+aid+'"]').addClass('sel');
			Img.Clear();
			$('#DeleteAlbum').click(Delete);
			$('#ViewAlbum').click(Go);
			$('#ainfo select').change(SaveAlbumData);
			$('#ainfo .sent input, #ainfo .sent textarea').keyup(function(){
				Stack(SaveAlbumData, 1000);
			});

			if (aid <= 0) Uploader.Open();
			if (aid == -1) { 
				$('.h .option').click(function(){
					Library('ClearTrash', {}, function(){
						console.log('Корзина очищена');
						$('#images > *').fadeOut(100, function(){ $(this).remove() });
					});
				});
			}
			setTimeout(function(){
				Library('Images', {aid : aid}, DisplayImages)
			}, 300);
		};

		var Create = function(){
			setTimeout(function(){
				Modal.Open( Templates('createAlbum'), function(e){
					e.find('.save').click(function(){
						SaveAlbumData(InputsData( $('.msg') ), true);
					});
					e.find('.cancel').click(Modal.Close);
				});
			}, 250);
		};

		function SaveAlbumData(data, newalbum){
			var data = (data && data.length) ? data : InputsData( $('#ainfo .sent') );
			var id = newalbum ? 0 : (current.id || 0);
			Modal.Close();
			Library('AlbumEdit', {aid : id, data : data}, function(e){
				Update(e);
				// Название + описание альбома обновить в панели слева и сверху
				$('.alb .h h3').html(data[0]);
				$('.e[data-id="' + id + '"]').addClass('sel');
			});
		}
		
		function SortImages(by){
			if (!current || !current.id) return;
			Library('ImagesSort', {aid : current.id, by : by}, function(e){
				LoadContent(current.id);
			});
		}
		
		function RotateImages(angle){
			if (current.aid == -1) return ;
			console.log('Поворот изображений: ' + angle);
			
			// Если процесс поворота предыдущих не окончен, не поворачивать
			if ($('.background').length > 0 && $('#cmenu').length == 0) return;
			$('<div class="background"></div>').appendTo('body');
			
			// Если в главном окне, повернуть все выбранные
			if (!View.IOpened()){
				var list = [];
				$('.image.i').each(function(){
					var id = $(this).addClass('animate blur ' + angle).data('id');
					list.push( id );
				});
			// Если в просмотре фотографий, повернуть только текущую.
			} else {
				var id = View.IOpened().id;
				var list = [id];
				$('[data-id="'+id+'"], .cnt').addClass('animate blur ' + angle);
			}
			Library('ImagesRotate', {list : list, angle : angle, aid : current.id}, function(e){
				images = e.images;
				for (var i in images) {
					$('[data-id="'+images[i].id+'"]')
						.removeClass('left right animate blur')
						.find('img').attr('src', hard + images[i].src_thumb);
				}
				if (id) {
					$('.view .cnt img').css({display : 'none'});
					$('.view .cnt img')[0].onload = function(){
						$('.view *').fadeIn(130);
					};
					$('.view .cnt img')[0].src = Picture.Src(FindImage(id));
					$('.view .cnt')
						.css( Picture.CSS(FindImage(id)) )
						.removeClass('left right animate blur');
				}
				$('.background').remove();
			});
		}

		return {
			'LoadContent' : LoadContent,
			'SortImages'  : SortImages,
			'RotateImages': RotateImages,
			'View'        : View,
			'Img'         : Img,
			'Create'      : Create,
			'Delete'      : Delete
		};
	}());

	// !- Галерея
	var Gallery = (function(){
		var ID = false, albums = [];
		var GalleryTemplate = function(gid){
			var gallery = FindGallery(gid);
			if (!gallery) return false;
			$('#right').html( Templates('galleryContent', gallery) );
			$('#media').addClass('HideInfo');
			$('.e').removeClass('exist');
			$('.e.ui-draggable').draggable("enable");
			// Красивость субдомена
			$('.domain').html('.' + host);
			var url = $('.subdomain input').css({ paddingRight : $('.subdomain .domain').width() + 7 });
			url.val( url.val().replace('//', '').replace( $('.domain').html(), ''))
			$('.settings select').val(gallery.privacy);
			// Внесение изменений в настройки альбома
			$('.settings select').change(SaveGalleryData);
			$('.settings input, .settings textarea').keyup(function(){
				Stack(SaveGalleryData, 1000);
			});
			// Удаление галереи
			$('.gallery .delgal').click(function(){
				$('.gallery').animate({ marginTop: '100%', opacity : 0 })
			});
			$('.e').removeClass('sel exist');
			$('.e[data-id="'+ID+'"]').addClass('sel');
			return true;
		};
		var AlbumsCounter = function(){
			var box = $('.g-albums .a-cover');
			$('.g-albums-empty').css({ display : (box.length > 0 ? 'none' : 'block') });
		};
		var DisplayAlbums = function(e){
			var AlbumInsert = function(id){
				var a = FindAlbum( id );
				a.img = '';
				a.color = 'eee';
				for (var i in e.covers) {
					if (e.covers[i].album == a.id) {
						var imageFade = 'style="display:none" onload="$(this).fadeIn(300)"';
						a.img = e.covers[i].src_small;
						if (!a.img) a.img = e.covers[i].src_main;
						a.img = '<img src="' + hard + a.img + '" ' + imageFade + '/>';
						a.color = e.covers[i].color;
					}
				}
				$('#right .g-albums').append( Templates('galleryElement', a) );
				// Элементы в панели слева пометить, если они есть в галерее:
				var H = $('.e.ui-draggable[data-id="' + a.id + '"]').draggable("disable").addClass('exist');
				var E = $('.a-cover[data-id="' + a.id + '"]');
				E.find('.del').click(function(){
					Library('AlbumsInGallery', { gid : ID, aid : a.id, remove : true }, function(e){
						E.remove();
						H.draggable("enable").removeClass('exist');
						AlbumsCounter();
					});
				});
				return a;
			};

			$('#right .g-albums').html('');
			for(var i in e.albums) {
				var a = AlbumInsert(e.albums[i].id);
				$('.g-albums .drag-helper').css({ padding : '8px' });
			}
			
			AlbumsCounter();
			
			// События
			$('.g-albums').sortable({ 
				cancel: ".drag-helper",
				stop : function(){
					var ordered = {};
					$('.g-albums .a-cover').each(function(i, e){ ordered[i] = $(this).data('id'); });
					Library('AlbumsInGalleryOrder', { gid : ID, ordered : ordered });
				}
			});

			$('#right .g-albums-dp').droppable({
				hoverClass : 'hover',
				drop : function(h, t){
					if (!t.draggable.hasClass('e')) return;
					var aid = t.draggable.data('id');
					Library('AlbumsInGallery', { gid : ID, aid : aid }, function(ret){
						if (ret.covers[0]) e.covers.push(ret.covers[0]);
						AlbumInsert(aid);
						AlbumsCounter();
					});
				}
			});
		};
		var LoadContent = function(gid){
			ID = gid;
			console.log('Загрузка альбомов галереи: ' + gid);
			if (GalleryTemplate(gid)) {
				setTimeout(function(){
					Library('Albums', {gid : gid}, DisplayAlbums);
				}, 300);
			}
		};
		var Create = function(){
			setTimeout(function(){
				Modal.Open( Templates('createGallery'), function(e){
					function GalleryGetID(url){
						Library('GalleryGetID', {url : url}, function(r){
							if (r.result === 0) {
								e.find('.previewGURL').html([url,location.host].join('.'));
								e.find('.save').fadeIn(200);
								return ;
							}
							var error = r.result ? 'URL уже используется' : 'URL не корректен'
							e.find('.previewGURL').html('<i>' + error + '</i>');
							e.find('.save').fadeOut();
						});
					};
					// Проверка URL на существование:
					e.find('.url').keyup(function(){
						var v = $(this).val();
						Stack(function(){ GalleryGetID(v); }, 700);
					})
					e.find('.save').click(function(){
						SaveGalleryData(InputsData( $('.msg') ));
						Modal.Close();
					});
					e.find('.cancel').click(Modal.Close);
				});
			}, 250);
		};
		var Delete = function(gid){
			var gid = gid || ID;
			Library('GalleryDelete', {gid : gid}, function(e){
				Update();
				if(ID) Main();
			});
		};

		function SaveGalleryData(data){
			var data = (data && data.length) ? data : InputsData( $('.settings') );
			Library('GalleryInfo', {gid : ID, data : data}, function(e){
				if (!e.error){
					$('.e[data-id="' + ID + '"]').addClass('sel');
					$('.e[data-id="' + ID + '"] h4 b').html(data[0]);
					$('.e[data-id="' + ID + '"] p').html(data[2]);
					//$('.e[data-id="' + ID + '"] .url').html(data[1]);
				}
				if (!ID) Update();
			});
		}
		
		return {
			'LoadContent' : LoadContent,
			'Create' : Create,
			'Delete' : Delete
		}
	}());
	
	// !- Настройки профиля
	var Profile = (function(){
		var SaveProfileData = function(){
			var data = [];
			$('.pfl input, .pfl textarea').each(function(){
				data.push($(this).val());
			});
			Library('ProfileInfo', {data : data});
		};
		var DisplayProfile = function(data){
			// Внешние профили
			data.insocial = '';
			var sUrl = {
				'vk' : function(e){ return 'https://vk.com/id' + e; },
				'fb' : function(e){ return 'https://facebook.com/profile.php?id=' + e; },
				'gp' : function(e){ return 'https://plus.google.com/u/0/' + e; }
			};
			for (var p in data.social){
				var s = data.social[p].sid;
				data.social[p].url = sUrl[s.substr(0, 2)](s.substr(2))
				data.social[p].picture = data.social[p].picture ? '<img src="'+data.social[p].picture+'">' : '';
				data.insocial += Templates('eSocial', data.social[p]);
			}
			if (data.cover) data.cover = '<img width="100%" src="' + hard + data.cover + 'cover_large.jpg">';
			else { data.cover = ''; }
			// Вставка шаблона
			$('#right').html( Templates('profileContent', data) );
			$('#media').addClass('HideInfo');
			$('.e').removeClass('exist');
			$('.e.ui-draggable').draggable("disable");
			// Красивость домена
			$('.pfl .url span').html(location.origin + '/');
			var url = $('.pfl .url input').css({ paddingLeft : $('.pfl .url span').width() + 8 });
			// Привязка соц-сетей
			$('.pfl .ss a').click(OAuth);
			// Загрузка  обложки
			$('.pfl .c').click(function(){
			    $('#cover-upload').find('input').click();
			});
			var ul = $('.status'), info = false;
			$('#cover-upload').fileupload({
				dropZone: $('.pfl .c'),
			    add: function (e, data) {
			        var tpl = $('<div/>');
			        tpl.find('p').text(data.files[0].name).append('<i>' + data.files[0].size + '</i>');
			        data.context = tpl.appendTo(ul);
			        tpl.find('input').knob();
			        tpl.find('span').click(function(){
			            if(tpl.hasClass('working')) jqXHR.abort();
			            tpl.fadeOut(tpl.remove);
			        });
			        // Automatically upload the file once it is added to the queue
			        var jqXHR = data.submit();
			    },
				progress: function(e, data){ 
					var progress = parseInt(data.loaded / data.total * 100, 10);
					$('.pfl .status i').css({ width: progress + '%' });
					info = data; 
				},
			    stop : function(e){
			        var src = hard + info.result + 'cover_large.jpg';
					$('.pfl .c img').attr('src', src + '?' + Math.random());
					$('.pfl .status i').css({ width: 0 });
				}
			});
			// Prevent the default action when a file is dropped on the window
			$(document).on('drop dragover', function (e) {
			    e.preventDefault();
			});
			// Вставка альбомов и галерей профиля
			console.log(albums);
			console.log(gallery);
			console.log(data);
			// Внесение изменений
			$('.pfl input, .pfl textarea').keyup(function(){
				Stack(SaveProfileData, 1000);
			});
			Waves.displayEffect();
		};
		var LoadContent = function(){
			console.log('Загрузка информации профиля');
			Library('Profile', {}, DisplayProfile);
		};
		return LoadContent;
	}());

	// !- Контекстное меню
	var Context = (function(){
		var container = $('#main');
		var E = false;
		var Acts = {
			'--' : ['', false],
			'AS' : ['Подробнее', function(){
				Album.LoadContent(E.currentTarget.dataset.id);
			}],
			'AW' : ['Просмотр альбома (в новом окне)', function(){
				window.open(FindAlbum(E.currentTarget.dataset.id).url);
			}],
			'AD' : ['Удалить альбом', function(){
				Album.Delete(E.currentTarget.dataset.id);
			}],
			'AC' : ['Создать новый альбом', Album.Create],

			'GS' : ['Подробнее', function(){
				Gallery.LoadContent(E.currentTarget.dataset.id);
			}],
			'GW' : ['Просмотр галереи (в новом окне)', function(){
				window.open('http://' + FindGallery(E.currentTarget.dataset.id).url + '.' + location.host);
			}],
			'GD' : ['Удалить галерею', function(){
				Gallery.Delete(E.currentTarget.dataset.id);
			}],
			'EX'  : ['Экспорт', Album.Img.Export],
			'GC'  : ['Создать новую галерею', Gallery.Create],
			'IP'  : ['Просмотр', Album.View.Space],
			'IF'  : ['Выделить все фотографии', Album.Img.Select],
			'IQ'  : ['Отменить выбор фотографий', Album.Img.DSelect],
			'ID'  : ['Удалить выделенные фотографии', function(){ Album.Img.ImagesToAlbum(-1); }],
			'IR'  : ['Повернуть направо',     function(){ Album.RotateImages('right'); }],
			'IL'  : ['Повернуть налево',      function(){ Album.RotateImages('left');  }],
			'ISD' : ['Сортировать по дате',   function(){ Album.SortImages('date');    }],
			'ISN' : ['Сортировать по инмеи',  function(){ Album.SortImages('name');    }],
			'ISI' : ['Инвертировать порядок', function(){ Album.SortImages('invert');  }],
		};

		function Init(object, ids, action){
			$(object).map(function(){
				//console.log('Вешаю обработчик контекстного меню:');
				//console.log($(this));
				$(this).bind(action ? action : "contextmenu", function(e){
					e.preventDefault();
					E = e;
					Open(ids);
			    	return false;
				});
			});
		}
		function Open(ids){
			container.append( Templates('contextMenu') );
			$('#cMenuBG').click(Close);
			var menu = $('#cmenu');
			for (var i in ids) {
				var htm = '<a onclick="Media.Context.Acts(\''+ids[i]+'\')">' + Acts[ids[i]][0] + '</a>';
				if (!Acts[ids[i]][1]) htm = '<a class="t"></a>';
				$('<li>' + htm + '</li>').appendTo(menu);
			}

			var x = E.clientX, y = E.clientY;
			if (y + $('#cmenu').height() > document.height) y = y - $('#cmenu').height() - 10; 
			menu.css({ left : x, top : y });
			console.log([$('#cmenu').height(), document.height, 1]);
			
		}
		function Close(){
			$('#cmenu, #cMenuBG').fadeOut(200);
			setTimeout(function(){ $('#cmenu, #cMenuBG').remove() }, 201)
		}

		return {
			'Close' : Close,
			'Init' : Init,
			'Open' : Open,
			'Acts' : function(act){
				Close();
				return Acts[act][1]();
			}
		};
	}());

	// Регистронезависимый поиск
	function Find(haystack, needle){
		return ( haystack.toLowerCase() ).indexOf( needle.toLowerCase() );
	}
	// Подсветка строки
	function BackLight(haystack, string){
		var position = Find(haystack, string), words = string.length;
		if (position !== -1) {
			return (haystack.substr(0, position)
				 + ('<span class="find">' + haystack.substr(position, words) + '</span>')
				 + haystack.substr(position + words));
		}
		return haystack;
	}
	// Фильтрация альбомов/галерей по строке
	function Search(string){
		var string = ivEncodeEntities(string) || '';
		var list = [];
		for (var i in albums){
			if (Find(albums[i].title, string) !== -1 || Find(albums[i].desc , string) !== -1){
				list.push(albums[i]);
			}
		}
		for (var i in gallery){
			if (Find(gallery[i].title, string) !== -1 || Find(gallery[i].desc , string) !== -1 || Find(gallery[i].url , string) !== -1){
				list.push(gallery[i]);
			}
		}
		var html = $.map(list, function(media, i){
			var info = {};
			for (var e in media){
				info[e] = media[e];
				if ('title' == e || 'desc' == e) info[e] = BackLight(media[e], string || '');
			}
			media.title = media.title || 'Без имени';
			return Templates('leftBlock', string ? info : media);
		});

		$('#list').html( html.join('') );
		$('#list .album').click(function(){ 
			Album.LoadContent($(this).data('id')); 
		}).each(function(){
			var e = $(this);
			e.draggable({ 
				appendTo : '#main', 
				start: function( event, ui ) {
					$('#main').addClass('albumDrag');
				},
				stop: function( event, ui ) {
					$('#main').removeClass('albumDrag');
				},
				helper : function(){  
					return '<div class="a-helper">' + e.find('h4').html() + '</div>'; 
				}
			});
		});
		$('#list .gall').click(function(){ 
			Gallery.LoadContent($(this).data('id')); 
		});

		Context.Init('#list .album .cog', ['AS', 'AW', 'AD', '--', 'AC', 'GC'], 'click');
		Context.Init('#list .gall .cog', ['GS', 'GW', 'GD', '--', 'AC', 'GC'], 'click');
		
		Context.Init('#list .album', ['AS', 'AW', 'AD', '--', 'AC', 'GC']);
		Context.Init('#list .gall', ['GS', 'GW', 'GD', '--', 'AC', 'GC']);
		
		var draggable = $('.gallery.frame').length > 0 ? true : false;
		if (!draggable) $('.e.ui-draggable').draggable("disable");
	}
	// Обновление панели с запросом к серверу
	function Update(e){
		var List = function(e){
			albums = e.albums, gallery = e.gallery;
			Search('');
		};
		return e ? List(e) : Library('Media', {}, List);
	}

	// Добропожаловать!
	function Main(){
		$('#right').html( Templates('default') );
		$('#media').addClass('HideInfo');
		$('.new .U').click(Uploader.Open);
		$('.new .A').click(Album.Create);
		$('.new .G').click(Gallery.Create);
		Context.Init('#list', ['AC', 'GC']);
	}

	Update();
	Main();
	
	$('#search input').keyup(function(){ Search( $(this).val() ); });
	$('#left .ctrls span.k').mousedown(function(){ Album.LoadContent(-1); });
	$('#left .ctrls span.i').mousedown(function(){ Album.LoadContent( 0); });
	$('#left .ctrls span.p').mousedown(Profile);
	$('#info .ctrls .down').mousedown(Uploader.Open);
	$('#info .upload .close').mousedown(Uploader.Close);
	
	
	$(document).keydown(function(e){ if (([17,16,91]).indexOf(e.keyCode) != -1) shiftKey = true;  });
	$(document).keyup(  function(e){ if (([17,16,91]).indexOf(e.keyCode) != -1) shiftKey = false; });
	$(document).keydown(function(e){
		Context.Close();
	    if ($('input:focus, textarea:focus').length > 0) return;
	    e.preventDefault();
	    if ($('.background').length > 0) return;
	    
	    // ESC
	    if (e.keyCode == 27){
		    Album.View.Close();
	    }

	    if (e.keyCode == 32) Album.View.Space(); // Пробел
	    if (e.keyCode == 38) Album.View.Up();    // ^
	    if (e.keyCode == 37) Album.View.Prev();  // <
	    if (e.keyCode == 39) Album.View.Next();  // >
	    if (e.keyCode == 40) Album.View.Down();  // .
		if (e.keyCode == 70) Album.Img.Select();  // F - выьрать всё
		if (e.keyCode == 81) Album.Img.DSelect(); // Q - выбрать ничего
	    if (e.keyCode == 219) Album.RotateImages('left');  // [
	    if (e.keyCode == 221) Album.RotateImages('right'); // ]

		if (([46,68,8]).indexOf(e.keyCode) != -1){ Album.Img.ImagesToAlbum(-1); Album.View.Close(); } // Удалить: del, back, D

	    console.log(e.keyCode);

	});
	$(window).resize(function(){
		Album.View.Resize();
	});
	Waves.displayEffect();

	document.onmousemove = function(e){ mouse = [e.pageX, e.pageY] };
	
	return {
		'Context' : Context
	};
}());

/*
	// ! QR
	function openQR(string){
		var src = QRCode.generatePNG(string, {'modulesize' : 15});
		$('<div class="fqr"><img src="'+src+'" /></div>').appendTo('#main');
		$('.fqr').click(closeQR).fadeIn(200);
	}
	function closeQR(){
		var e = $('.fqr').fadeOut(200);
		setTimeout(function(){ e.remove(); }, 200);
	}
*/