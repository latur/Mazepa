<link href="/static/css/stat.css" rel="stylesheet" type="text/css">

<div class="stat-panel">
<select id="logfile"><? 
	foreach ($data['files'] as $fn) {
		$name = end(explode("/", $fn));
		$display = $name;
		if (stristr($display, '_')) {
			$tmp = explode('_', $name);
			$display = 'Archive ' . date("Y-m-d", substr($tmp[1], 0, 10)) . ' ' . substr($tmp[1], 10);
		}
		echo "<option value='$name'>$display</option>";
	}
?></select>
</div>
<div id="filecontent"></div>

<script> var api = '/stats/'; </script>
