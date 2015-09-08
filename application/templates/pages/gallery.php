<? $base = @$I ? "http://{$I['url']}." . HOST . "/" : ""; ?>
<div class="page">
	<div class="place"></div>
	<? if (@$I['desc']){ ?><div class="desc"><?=$I['desc']?></div><? } ?>
	<? if (count(@$M) == 0){ ?>
	<div class="desc" style="color:#900">[В этой галерее нет ни одного альбома]</div>
		<? } else { ?>
	<div class="e">
		<? foreach($M as $album){ ?>
		<a class="alb" href="<?=$base . base_convert($album['id'], 10, 32) . "." . $album['secret']?>">
			<div class="img"><img class="animatelond" src="//<?=MEDIA . $album['cover']['src_small']?>"></div>
			<h3 class="animate"><?=$album['title']?> <p><?=$album['desc']?></p></h3>
		</a>
		<? } ?>
	</div>
	<? } ?>
</div>
