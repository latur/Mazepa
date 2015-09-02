
var Stats = (function(){
	var sel = $('#logfile')
	var log = $('#filecontent');
	var Read = function() {
		log.html('Загрузка...');
		Library('Read', {'name' : sel.val()}, function(f){ log.html(f.data) });
	}

	sel.change(Read);

	Library('Overview', {}, function(e){
		// Считаем разброс посещений:
		var points = [];
		for (var i in e.dates) if (e.dates[i] > 1) points.push(e.dates[i]);
		
		var cal_m = new CalHeatMap();
		var time = new Date();
		time.setDate(time.getDate() - 14);
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

		var cal_y = new CalHeatMap();
		var time = new Date();
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

	})
}());


