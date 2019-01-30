var helpers = require('helpers');

module.exports = function(block) {
	block.data('id') && initWistiaEvents();

	function initWistiaEvents() {
		var wistiaEmbed = Wistia.embed(block.data('id'));

		wistiaEmbed.bind('play', function(video) {
			$('#right-sidebar').hasClass('open') && helpers.toggleRightSidebar();
		})

		wistiaEmbed.bind('end', function(video) {
			!$('#right-sidebar').hasClass('open') && helpers.toggleRightSidebar();
		});
	}

	helpers.resizeFunctionHandler(function() {
		var height = $(window).height() - $('#masthead').height() - ($('#lessons-progress').height() + 30);

		if($('#fixed-footer').length) {
			height -= $('#fixed-footer').height() - 1;
		}

		block.css('height', height);
		block.find('.wistia_embed').css('height', height);
	});
}
