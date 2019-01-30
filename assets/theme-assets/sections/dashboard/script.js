var $ = jQuery,
	_ = require('underscore');

var helpers = require('helpers');

module.exports = function() {
	helpers.resizeFunctionHandler(function() {
		var height = $(window).height() - $('.header').height();
		$('#top-header').css('height', height);
	});

	// Init course Count Down
	require('countdown');
	$('.course_counter_block .counter').countdown("2016/06/13 16:00:00", function(event) {
		$(this).text(
			event.strftime('%D : %H : %M : %S')
		);
	});
}
