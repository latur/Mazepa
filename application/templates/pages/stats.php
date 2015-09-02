<link href="/static/css/stat.css" rel="stylesheet" type="text/css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.6/d3.min.js" charset="utf-8"></script>
<link rel="stylesheet" href="/static/css/cal-heatmap.css" />
<script type="text/javascript" src="/static/js/lib/cal-heatmap.min.js"></script>

<div class="stat-panel">
	<select id="logfile">
		<? foreach ($data['names'] as $display => $filename) { ?>
		<option value="<?=$display?>"><?=$display?></option>
		<? } ?>
	</select>
	<button>Экспорт</button>
</div>

<div class="page p1">
	<h3>Активность просмотров за последние две недели:</h3>
	<div id="Heatmap14Days"></div>

	<h3>Активность просмотров за прошедший год:</h3>
	<div id="HeatmapYear"></div>
</div>
<div class="p2">
	<div id="filecontent"></div>
</div>



<script> var api = '/stats/'; </script>
