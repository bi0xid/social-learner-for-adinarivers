var $ = jQuery;

/**
 * Filters: newest-friends , recently-active-friends , popular-friends
 **/

module.exports = function() {
	var container = $('#secondary .nav-tabs .tab[data-target="friends"] .friends-container'),
		filters   = $('#secondary .nav-tabs .tab[data-target="friends"] .filters ul li'),
		menuItem  = $('#secondary .nav-menu a[data-target="friends"]');

	initFriendsTab('recently-active-friends', 5);

	filters.find('a').on('click', function(e) {
		e.preventDefault();

		filters.find('a').removeClass('in');
		$(e.currentTarget).addClass('in');

		var filter = $(e.currentTarget).data('filter');
		initFriendsTab(filter, 5);
	});

	function initFriendsTab(filter, max) {
		container.empty();

		ajaxCall(filter, max, onAjaxCall);

		function onAjaxCall(data) {
			if (data[0] !== '-1') {
				container.html(data[1]);
			}
			else {
				// @TODO: No friends to show alert. 
			}
		}
	}

	function ajaxCall(filter, max, callback) {
		jQuery.post(ajaxurl, {
			action       : 'widget_friends_custom',
			'cookie'     : encodeURIComponent(document.cookie),
			'max-friends': max,
			'filter'     : filter,
			beforeSend   : function() {
				menuItem.addClass('loading');
			}
		},
		function(response) {
			menuItem.removeClass('loading');

			response = response.substr(0, response.length-1);
			response = response.split('[[SPLIT]]');

			callback(response);
		});
	}
}