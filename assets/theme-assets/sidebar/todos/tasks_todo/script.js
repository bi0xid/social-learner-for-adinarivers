var $ = jQuery,
	_ = require('underscore');

var helpers = require('helpers');

module.exports = function(modal, markAsDoneFunc, closeModal) {
	// Next page handler
	modal.find('.next-page, .fa-angle-right').on('click', nextPageHandler);

	// Prev page handler
	modal.find('.fa-angle-left').on('click', prevPageHandler);

	// Mark as Done handler
	modal.find('.mark-as-done').on('click', function() {
		markAsDoneFunc(closeModal);
	});

	function prevPageHandler() {
		var currentSection = modal.find('.section:not(.out)'),
			prevSection    = currentSection.prev();

		prevSection.length && helpers.animateCss(currentSection, 'fadeOutRight', 0, function() {
			prevSection.removeClass('out');
			currentSection.addClass('out');

			helpers.animateCss(prevSection, 'fadeInLeft', 1);
		});
	}

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
