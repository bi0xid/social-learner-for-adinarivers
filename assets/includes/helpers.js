var $ = jQuery,
	_ = require('underscore');

var self = module.exports = {
	initHandleBarsHelpers: function() {
		var Handlebars = require('hbsfy/runtime');

		Handlebars.registerHelper('ifCondInt', function(v1, v2, options) {
			return parseInt(v1)===parseInt(v2) ? options.fn(this) : options.inverse(this);
		});

		Handlebars.registerHelper('ifIsType', function(element, type, options) {
			var elementType = typeof element;
			return elementType==type ? options.fn(this) : options.inverse(this);
		});

		Handlebars.registerHelper('notCondInt', function(v1, v2, options) {
			return parseInt(v1)!==parseInt(v2) ? options.fn(this) : options.inverse(this);
		});

		Handlebars.registerHelper('trim', function(str, length) {
			if(typeof str == 'undefined') return;
			var ret = str.replace(/(<([^>]+)>)/ig, '');

			return ret.length > length
				? ret.substring(0, length-3)+'...'
				: ret;
		});

		Handlebars.registerHelper('times', function(n, block) {
			var accum = '';
			for(var i = 0; i < n; ++i) {
				accum += block.fn(i);
			}
			return accum;
		});
	},

	toggleRightSidebar: function() {
		var sidebar        = $('#right-sidebar'),
			toggler        = $('#sidebar-toggle'),
			toggleSections = $('.header-course, .header-lesson');

		toggler.toggleClass('open');
		sidebar.toggleClass('open');
		toggleSections.toggleClass('sidebar-open');

		!$('#messages-header-content').hasClass('out') && $(window).width() <= 800 && self.toggleMessagesWidget();
	},

	toggleMessagesWidget: function() {
		var chat = $('#messages-header-content');
		chat.toggleClass('out');

		if($(window).width() >= 800) {
			$('#messages-header-toggler').toggleClass('open');

			chat.is(':visible') && chat.fadeOut(400, removeChatList);
			chat.is(':visible') || chat.fadeIn();
		}
		else if(!chat.hasClass('animated')) {
			$('#messages-header-toggler').toggleClass('open');
			$('html').toggleClass('no-scroll');

			if(chat.css('opacity') == 0) {
				self.animateCss(chat, 'fadeInUp', 1);
			}
			else {
				self.animateCss(chat, 'fadeOutDown', 0);
			}

			chat.css('opacity') == 0 || _.delay(removeChatList, 800);
		}

		function removeChatList() {
			$('#masthead').find('.chat-view, .chat-list').remove();
			require('../theme-assets/sections/messages-widget/script.js').initChatList();
		}

		return ('toggleMessagesWidget');
	},

	toggleZenDeskWidget: function(toggler) {
		if(typeof zE === 'function') {
			toggler == 'show'  && zE.show();
			toggler == 'hide' && zE.hide();
		}
	},

	toastrOptions: function() {
		return {
			'closeButton'      : false,
			'debug'            : false,
			'newestOnTop'      : false,
			'progressBar'      : false,
			'preventDuplicates': false,
			'onclick'          : null,
			'showDuration'     : '300',
			'hideDuration'     : '1000',
			'timeOut'          : '5000',
			'extendedTimeOut'  : '1000',
			'showEasing'       : 'swing',
			'hideEasing'       : 'linear',
			'showMethod'       : 'fadeIn',
			'hideMethod'       : 'fadeOut',
			'positionClass'    : 'toast-bottom-left'
		};
	},

	nl2br: function(str, is_xhtml) {
		var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
		if(str) {
			return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
		}
		else {
			return str;
		}
	},

	br2nl: function(string) {
		if(string) {
			return string.replace(/<br.*?>/g, '');
		}
		else {
			return string;
		}
	},

	getProfilePageInputPlaceholders: function(id) {
		var labels = {
			display_name         : 'What&#x27;s your name?',
			display_location     : 'Where do you live?',
			display_introduction : 'Write your introduction',
			display_question     : 'Why are you here?'
		};

		return labels[id];
	},

	/**
	 * Init Perfect Scrollbar plugin
	 * @param: jquery element
	 * @return: PS Instance
	*/
	initScrollBarPlugin: function(element) {
		var Ps = require('perfect-scrollbar');
		Ps.initialize(element);

		return Ps;
	},

	/**
	 * Add  and animation to an element
	 * @param: element - jQuery element
	 * @param: animation - string name of the animation
	 * @param: opacity - opacity value on animation end
	 * @param: callback - function on animation end
	*/
	animateCss: function(element, animation, opacity, callback) {
		var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';

		element.addClass('animated ' + animation).one(animationEnd, function(event) {
			event.stopPropagation();

			callback && callback();

			element.css('opacity', opacity);
			element.removeClass('animated ' + animation);
		});

		return ('animateCss');
	},

	/**
	 * Generate a Random ID of 5 chars
	 * @return: string
	*/
	generateRandomId: function() {
		var text     = '',
			possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

		for(var i = 0; i < 5; i++) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}

		return text;
	},

	/**
	 * Window Resize Function
	 * This function will be called on windows resize
	 * but in a proper way.
	 * @param: function
	*/
	resizeFunctionHandler: function(callback) {
		var onResize = _.debounce(callback, 300);
		callback();
		$(window).resize(onResize);
	},

	/**
	 * Window Scroll Function
	 * @param: function
	*/
	scrollFunctionHandler: function(callback) {
		var onResize = _.debounce(callback, 300);
		callback();
		$(window).scroll(onResize);
	},

	/**
	 * AJAX Call function
	 * @param: object
	 * @param: callback function
	 * @return: callback function with response data
	*/
	ajaxCall: function(params, callback) {
		jQuery.post(ajaxurl, params,
		function(response) {
			callback && callback(response);
		});
	}
}
