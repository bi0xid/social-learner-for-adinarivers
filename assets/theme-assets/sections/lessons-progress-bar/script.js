var _      = require('underscore'),
	resize = require('helpers').resizeFunctionHandler;

module.exports = function(container) {
	container.find('.modules li').length && initProgressBarWidth();

	// Progress Bar Width
	function initProgressBarWidth() {
		var width = container.find('.modules .module.in-progress .lesson.in-progress').length
			? (container.find('.modules .module.in-progress .lesson.in-progress').last().offset().left * 100) / container.find('.line').width()
			: 100;

		container.find('.line span').css('width', width + '%');
	};

	// Lessons Menu Handler
	container.find('.modules ul.module').on('hover', function(e) {
		var menu = $(e.currentTarget).find('.lessons-menu');

		if(e.type === 'mouseenter') {
			menu.addClass('in');
		}
		else {
			if(!menu.is(':hover') && !container.is(':hover')) {
				menu.removeClass('in');
			}
		}
	});

	// Special Hover effects
	container.find('.modules ul.module li, .module li.lesson').on('hover', function(e) {
		if(e.type === 'mouseenter') {
			var lesson = $(e.currentTarget).data('menulesson')
				? $(e.currentTarget).data('menulesson')
				: $(e.currentTarget).data('lesson');

			if(lesson) {
				toggleLessonHoverClass(lesson);
			}
		}
		else {
			$('li[data-menulesson], li[data-lesson] > a').removeClass('hover-active');
		}
	});

	function toggleLessonHoverClass(lesson) {
		$('li[data-menulesson], li[data-lesson] > a').removeClass('hover-active');

		$('li[data-menulesson="' + lesson + '"], li[data-lesson="' + lesson + '"]:not(.bloqued) > a')
			.addClass('hover-active');
	};
};
