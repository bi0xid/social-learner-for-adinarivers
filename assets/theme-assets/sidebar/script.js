var _       = require('underscore'),
	helpers = require('helpers');

module.exports = function(rightSidebar) {
	var sidebarViews = [
		{
			selector: '#right-sidebar .todos-container',
			script  : require('./todos/script.js')
		},
		{
			selector: '#right-sidebar #sidebar-activity',
			script  : require('./activity/script.js')
		}
	];

	$('#sidebar-close').on('click', helpers.toggleRightSidebar);

	_.each(sidebarViews, function(view) {
		if($(view.selector).length) {
			view.script($(view.selector));
		}
	});

	helpers.resizeFunctionHandler(function() {
		rightSidebar.css('height', $(window).height());
	});
}
