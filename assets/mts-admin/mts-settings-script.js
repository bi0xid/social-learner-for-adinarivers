var $ = jQuery,
	_ = require('underscore');

$(document).ready(function() {
	var sections = [
		{
			'selector' : '#mts-settings-panel',
			'function' : require('./sections/mts-settings/script')
		},
		{
			'selector' : '#unlock_time',
			'function' : require('./sections/course-edit/script')
		}
	];

	_.each(sections, function(section) {
		$(section.selector).length && section.function();
	});
});
