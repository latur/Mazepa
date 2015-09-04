<div class="stat-panel">
	<select id="logfile">
		<option value="0">Просмотр .log файла...</option>
		<? foreach ($data['names'] as $display => $filename) { ?>
		<option value="<?=$display?>"><?=$display?></option>
		<? } ?>
	</select>
	<button id="export">Экспорт</button>
</div>

<div class="display p1">
	<h3 class="m">Загрузка...</h3>
	<div id="Heatmap14Days"></div>
	<h3 class="Y"></h3>
	<div id="HeatmapYear"></div>
	<h3 class="Ref"></h3>
	<div class="uselect" id="Ref"></div>
	<h3 class="Loc"></h3>
	<div class="uselect" id="Loc"></div>
	<h3 class="IP"></h3>
	<div class="uselect" id="IP"></div>
</div>
<div class="display p2">
	<h3></h3>
	<div class="uselect" id="filecontent"></div>
</div>

<link href="/cache/@stats.css" rel="stylesheet" type="text/css">
<script> var api = '/stats/'; </script>
