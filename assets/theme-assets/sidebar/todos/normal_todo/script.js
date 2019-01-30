var $ = jQuery,
	_ = require('underscore');

var helpers = require('helpers');

module.exports = function(modal, markAsDoneFunc) {
	// Next page handler
	modal.find('.next-page').on('click', nextPageHandler);

	// Mark as Done handler
	modal.find('.mask-as-done').on('click', function() {
		markAsDoneFunc(nextPageHandler);
	});

	function nextPageHandler() {
		var currentSection = modal.find('.section:not(.out)'),
			nextSection    = currentSection.next();

		nextSection.length && helpers.animateCss(currentSection, 'fadeOutLeft', 0, function() {
			nextSection.removeClass('out');
			currentSection.addClass('out');

			helpers.animateCss(nextSection, 'fadeInRight', 1);
		});
	};
}
