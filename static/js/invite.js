$(function(){
    $('#drop a.select').click(function(){
        $(this).parent().find('input').click();
    });
    $('#upload').fileupload({
    	limitConcurrentUploads : 1,
        dropZone: $('#drop'),
        add: function (e, data) {
            var jqXHR = data.submit();
        },
        fail:function(e, data){
        	location.reload();
        },
        done: function (e, data) {
        	if(data.result == '0') location.href = '/root';
        	else $("#drop").css( { borderColor : '#a00' } ).find('p').html('Это не приглашение. Вы что-то попутали #' + (Math.random() + '').substr(2,5));
        }
    });
    $(document).on('drop dragover', function (e) {
        e.preventDefault();
    });
});