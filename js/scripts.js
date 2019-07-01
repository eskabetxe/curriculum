var callback = function(){
	$('.item-skills').each(function(){
		newWidth = $(this).parent().width() * $(this).data('percent');
		$(this).width(0);
    $(this).animate({
        width: newWidth,
    }, 1000);
	});
};
$(document).ready(callback);

var teter = function(){
	$('.legend').each(function(){
		newWidth = $(this).data('percent');
		$(this).width(newWidth+'%') ;
	});
};
$(document).ready(teter);

var resize;
window.onresize = function() {
	clearTimeout(resize);
	resize = setTimeout(function(){
		callback();
		teter();
	}, 100);
};