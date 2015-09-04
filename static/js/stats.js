
$(function(){
	var sel = $('#logfile')
	var log = $('#filecontent');
	var src = $('#logsearch');

	var Read = function() {
		if (sel.val() == '0') return;
		$('.display.p2').show();
		$('.display.p1').hide();
		log.html('Загрузка...');
		Library('Read', {'name' : sel.val()}, function(f){
			$('.display.p2 h3').html(f.desc);
			log.html(f.data);
		});
	};

	Library('Full', {}, function(e){
		var time = new Date();
		var cal_y = new CalHeatMap();
		cal_y.init({
			itemSelector: "#HeatmapYear",
			domain: "month",
			subDomainTextFormat: "%d",
			subDomain: "day",
			data: e.dates,
			start: new Date(time.getFullYear() - 1, time.getMonth() + 1 ),
			cellSize: 15,
			range: 12,
			displayLegend: false,
			legend: [1, 10, 40, 300],
			legendColors: ["#f5e7d8", "#761d15"]
		});

		time.setDate(time.getDate() - 14);
		var cal_m = new CalHeatMap();
		cal_m.init({
			itemSelector: "#Heatmap14Days",
			domain: "day",
			subDomain: "hour",
			data: e.dates,
			start: time,
			cellSize: 14,
			cellPadding: 2,
			range: 15,
			displayLegend: false,
			legend: [1, 10, 40, 300],
			legendColors: ["#f5e7d8", "#761d15"]
		});
		$('.display.p1 .m').html('Активность просмотров за последние две недели:');
		$('.display.p1 .Y').html('Активность просмотров за последний год:');
		
		if (e.refs.length > 0) {
			$('.display.p1 .Ref').html('Внешние источники просмотров:');
			for (var i in e.refs.slice(0,10)) $('#Ref').append('<b>' + e.refs[i][0] + '</b> <span>' + e.refs[i][1] + '</span><br/>');
		}
		if (e.local.length > 0) {
			$('.display.p1 .Loc').html('Внутренние источники:');
			for (var i in e.local.slice(0,10)) $('#Loc').append('<b>' + e.local[i][0] + '</b> <span>' + e.local[i][1] + '</span><br/>');
		}
		if (e.ip.length > 0) {
			$('.display.p1 .IP').html('Активные IP адреса:');
			for (var i in e.ip.slice(0,15)) $('#IP').append('<b>' + e.ip[i][0] + '</b> <span>' + e.ip[i][1] + '</span><br/>');
		}
		
	});
	
	$('.display.p1').show();
	$('#export').click(function(){
		Library('ExportCode', {}, function(e){
			window.open('/stats/export/' + e.code, '.log');
		});
	})
	sel.change(Read);

});

