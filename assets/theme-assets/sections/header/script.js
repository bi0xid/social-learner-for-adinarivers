var _       = require('underscore'),
	helpers = require('helpers');

module.exports = function(header) {
	var animationTime = 300;

	var userMenu = header.find('#user-menu'),
		menu     = header.find('.menu-top_menu-container');

	// Resize functions for Progress bar menu
	if($('#lessons-progress .modules ul.module').length) {
		_.delay(function() {
			helpers.resizeFunctionHandler(function() {
				_.each($('#lessons-progress .modules ul.module'), function(module) {
					var item = $(module).find('.lessons-menu');
					var left = parseInt($(module).find('.module').css('margin-left')) - 10;

					item.css('left', left);
					item.css('bottom', - (item.height() + 15));
				});
			})
		}, 600);
	}

	var events = [
		{
			selector : '#sidebar-toggle',
			trigger  : 'click',
			action    : helpers.toggleRightSidebar
		},
		{
			selector : '#header-menu .menu-toggler',
			trigger  : 'click',
			action    : toggleMainMenu
		},
		{
			selector : '#user-avatar',
			trigger  : 'click',
			action    : toggleUserMenu
		},
		{
			selector : '#messages-header-toggler',
			trigger  : 'click',
			action    : toggleChatHandler
		}
	];

	_.each(events, function(event) {
		$(event.selector).length && $(event.selector).on(event.trigger, event.action);
	});

	function toggleMainMenu(e) {
		$(e.currentTarget).toggleClass('open');

		menu.is(':visible') && menu.fadeOut(animationTime);
		menu.is(':visible') || menu.fadeIn(animationTime);

		// Close user menu if is open
		if(userMenu.is(':visible')) {
			userMenu.fadeOut(animationTime);
			$('#user-avatar').removeClass('open');
		}
	}

	function toggleUserMenu(e) {
		$(e.currentTarget).toggleClass('open');

		userMenu.is(':visible') && userMenu.fadeOut(animationTime);
		userMenu.is(':visible') || userMenu.fadeIn(animationTime);

		// Close the normal menu if is open
		if(menu.is(':visible')) {
			menu.fadeOut(animationTime);
			$('#header-menu .menu-toggler').removeClass('open');
		}
	}

	function toggleChatHandler() {
		$(window).width() <= 800 && $('#right-sidebar').hasClass('open') &&  helpers.toggleRightSidebar();
		helpers.toggleMessagesWidget();

		// Close user menu if is open
		if(userMenu.is(':visible')) {
			userMenu.fadeOut(animationTime);
			$('#user-avatar').removeClass('open');
		}
	}

	// Let's close Menu and User menu on windows Click
	$(window).click(function(e) {
		if(!$(e.target).parents('.header-desktop').length) {
			menu.fadeOut(animationTime);
			userMenu.fadeOut(animationTime);
			$('#user-avatar, #header-menu .menu-toggler').removeClass('open');
		}
	});

	// Closing top menus on scroll event
	helpers.scrollFunctionHandler(function() {
		// Close user menu
		if(userMenu.is(':visible')) {
			userMenu.fadeOut(animationTime);
			$('#user-avatar').removeClass('open');
		}

		// Close Normal Menu
		if(menu.is(':visible')) {
			menu.fadeOut(animationTime);
			$('#header-menu .menu-toggler').removeClass('open');
		}
	});
}
