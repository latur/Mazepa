
var Stats = (function(){
	Library('GetFile', {'name' : 1}, function(f){
		$('#filecontent').html(f.data);
	});
}());


