$(function(){
	// События на главной странице сайта
	if (!events || events.length == 0) return;
	

	// Трансформация данных альбома (URL)
	var AlbumURL = function(e){
		e.url = '/albums/' + Number(e.id).toString(32) + '.' + e.secret;
		return e;
	};

	var loading = false;
	var last = 0;
	var AppendBlock = function(data) {
		if (!data.events) $('a.more').remove();
		
		var GetColors = function(aid, base) {
			var html = '', c = data.colors[aid];
			for (var i in c) {
				html += '<a href="' + base + c[i][0]+'" style="background:#'+c[i][1]+'"> </a>';
			}
			return html;
		}
		
		for (var i in data.events) {
			var e = data.events[i];
			last = e.id;
			e.url = '/albums/' + Number(e.aid).toString(32) + '.' + e.secret;
			e.img = '<img src="'+ hard + data.covers[e.aid] +'" />';
			e.pict = '<img src="/cache/'+e.uid+'x.jpg" />';
			e.points = GetColors(e.aid, e.url);
			$('#stream').append(Templates('albumElement', e));
		}
		
		loading = false;
	};
	
	$('a.more').click(function(){
		if (loading) return;
		loading = true;
		Library('PublicEvents', {last : last, count : 3}, AppendBlock);
	});
	
	// Верхняя панелька
	
	// Bookmarks List
	(function() {
		if (!bookmarks || bookmarks.length == 0) {
			$('.bookmarksArea').html(Templates('bookmarksEmpty'));
			return;
		}
		for (var i in bookmarks) {
			bookmarks[i].icon = 'bookmark';
			$('.bookmarks .list').append(Templates('bookmarkElement', AlbumURL(bookmarks[i])));
		}
		$('.bookmarks .delete').click(function(){
			var aid = $(this).data('aid');
			$(this).parent().parent().fadeOut(200, function(){ $(this).remove() });
			Library('Bookmark', {aid : aid, add : 0});
		});
		if (bookmarks.length == 1) return;
		$('.bookmarks .list.boxed').sortable({
			update : function(){
				var list = [];
				$('.list.boxed .bm').each(function(){ list.push( $(this).data('id') ); });
				Library('BookmarksSort', {list : list }, function(){
					console.log('Сортировочка завершена');
				});
			}
		});
	}());

	// Tags
	(function() {
		if (!tags || tags.length == 0) {
			$('.tagsArea').html(Templates('tagsEmpty'));
			return;
		}
		for (var i in tags) {
			tags[i].icon = 'camera';
			$('.tags .list').append(Templates('bookmarkElement', AlbumURL(tags[i])));
		}
		$('.tags .delete').click(function(){
			var aid = $(this).data('aid');
			$(this).parent().parent().fadeOut(200, function(){ $(this).remove() });
			Library('TagDelete', {aid : aid});
		});
	}());

	(function() {
		$('.switch a.s').click(function(e){
			e.preventDefault();
			$('.switch a.s').removeClass('current');
			$(this).addClass('current');
			$('.main')[$(this).data('act') + 'Class']('showbm');
			return false;
		})
	}());
	
	Waves.displayEffect();
	
	AppendBlock(events);

	$('.indexpage').css({display : 'block'});
});