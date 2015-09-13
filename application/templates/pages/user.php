<?
	$owner = $data['owner'];
	$owner['image'] = '/cache/pict/1w.jpg';
?>
<div class="u">
	<div class="cover">
		<? if ($owner['cover']){ ?><img src="<?= MEDIA . $owner['cover']?>/cover_large.jpg" /><? } ?>
		<div class="name">
			<div class="pic" style="background-image:url('<?=$owner['image']?>')"></div>
			<h1><?=$owner['name']?></h1>
		</div>
	</div>
	<div class="e">
		<? if ($owner['text'] != ''){ ?><h2><?=Text::Simple($owner['text'])?></h2><? } ?>
      	<? foreach($data['albums'] as $album){ ?>
    	<a class="alb" href="/albums/<?=base_convert($album['id'], 10, 32) . "." . $album['secret']?>">
    		<div class="img"><img class="animatelond" src="<?=MEDIA . ($album['cover']['src_small'] ? $album['cover']['src_small'] : $album['cover']['src_main'])?>"></div>
    		<h3 class="animate"><?=$album['title']?> <p><?=$album['desc']?></p></h3>
    	</a>
      	<? } ?>
	</div>
</div>
