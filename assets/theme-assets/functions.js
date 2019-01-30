var $ = jQuery,
	_ = require('underscore');

$(document).ready(function() {
	var views = [
		{
			selector : '#wistia-video-wrapper',
			script   : require('./sections/wistia-video/script.js')
		},
		{
			selector : '#right-sidebar',
			script   : require('./sidebar/script.js')
		},
		{
			selector : '#masthead',
			script   : require('./sections/header/script.js')
		},
		{
			selector : '#login-page',
			script   : require('./sections/login/script.js')
		},
		{
			selector : '#lessons-progress',
			script   : require('./sections/lessons-progress-bar/script.js')
		},
		{
			selector : '#messages-header-content',
			script   : require('./sections/messages-widget/script.js').init
		},
		{
			selector : '#dashboard_page',
			script   : require('./sections/dashboard/script.js')
		},
		{
			selector : '#profile-page',
			script   : require('./sections/profile-page/script.js')
		},
		{
			selector : '#ajax-comments',
			script   : require('./sections/post-comments/script.js')
		}
	];

	_.each(views, function(view) {
		if($(view.selector).length) {
			view.script($(view.selector));
		}
	});
});
