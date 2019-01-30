var _      = require('underscore'),
	resize = require('helpers').resizeFunctionHandler;

module.exports = function() {
	var wistiaEmbed = undefined,
		videoBlock  = $('.video-iframe'),
		videoId     = videoBlock.data('id');

	initWistiaEvents();

	resize(function() {
		var height = $(window).height() - $('#masthead').height() - ($('#lessons-progress').height() + 30);

		if($('#fixed-footer').length) {
			height -= $('#fixed-footer').height() - 1;
		}

		videoBlock.css('height', height);
	});

	function initWistiaEvents() {
		wistiaEmbed = Wistia.embed(videoId);
	}
}