<? include "application/templates/include/photoswipe.php"; ?>
<? $base = "/albums/" . base_convert($M['id'], 10, 32) . "/"; ?>

<link href="/static/css/photoswipe/default-skin.css" rel="stylesheet" type="text/css">
<link href="/static/css/photoswipe.css" rel="stylesheet" type="text/css">

<div class="page">
	<div class="place"></div>
	<? if ($M['desc']){ ?><div class="desc"><?=$M['desc']?></div><? } ?>
	<div class="e imgs"><?
		if (count($M['images']) > 0){
			$images = '';
			foreach ($M['images'] as $i => $img){
				$images .= "<a data-id='{$img['id']}' data-i='{$i}' href='{$base}{$img['id']}' class='inset' style='background:#{$img['color']}'></a>";
			}
			echo $images;
		}
	?></div>
</div>

<script>var m = <?=json_encode($M)?>, api = '/api/';</script>
