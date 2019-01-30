var helpers = require('helpers');

module.exports = function(utils, e) {
	var modalTemplate = require('./template.hbs');

	var item = $(e.currentTarget);

	// Add the ToDo name to Breadcrumb
	utils.addItemToBreadCrumb(item.data('name'));

	var data = {
		'id'    : item.data('id'),
		'desc'  : item.data('desc'),
		'video' : item.data('video'),
		'course': item.data('course')
	};

	// Append Modal and prepare classes
	$('html').addClass('no-scroll');
	helpers.toggleZenDeskWidget('hide');
	$('#masthead .header-desktop').addClass('modal-in');
	$('body').append(modalTemplate({ data : data })).find('.modal-overlay ').fadeIn(400);

	var modal = $('.modal-overlay');
	modal.find('.close-modal').on('click', utils.closeModalHandler);

	helpers.resizeFunctionHandler(function() {
		modal.find('.modal-content').css('height', $(window).height() / 1.7);
	});

	if(item.data('video')) {
		var wistiaEmbedModal = Wistia.embed(item.data('video'));
		wistiaEmbedModal.ready(function(video) {
			modal.find('.video-iframe').addClass('in');
			modal.find('.modal-content .loading').addClass('out');
		});
	}

	// Mark as done action
	modal.find('.mark-as-done').on('click', function(e) {
		var item = $(e.currentTarget);

		if(item.data('id') == 'walkthrough_todo') {
			helpers.ajaxCall({ action : 'wp_start_tour' }, function(e) {
				$('head').append(e);
			});
		}
		else if(item.data('id') == 'comment_todo') {
			$('html, body').animate({
				scrollTop: $('#post-comment-ajax').offset().top - 90
			}, 800);
		}
		else {
			window.location = $('#right-sidebar').data('profileurl');
		}

		utils.closeModalHandler();
	});
}
