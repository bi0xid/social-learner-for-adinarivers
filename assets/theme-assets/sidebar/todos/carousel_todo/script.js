var $ = jQuery,
	_ = require('underscore');

var helpers = require('helpers'),
	toastr  = require('toastr');

toastr.options = {
	"closeButton"       : false,
	"debug"             : false,
	"newestOnTop"       : false,
	"progressBar"       : false,
	"positionClass"     : "toast-top-center",
	"preventDuplicates" : false,
	"onclick"           : null,
	"showDuration"      : "300",
	"hideDuration"      : "1000",
	"timeOut"           : "5000",
	"extendedTimeOut"   : "1000",
	"showEasing"        : "swing",
	"hideEasing"        : "linear",
	"showMethod"        : "fadeIn",
	"hideMethod"        : "fadeOut"
};

module.exports = function(modal, markAsDoneFunc) {
	var sections = {
		'intro'   : modal.find('.section.intro'),
		'content' : modal.find('.owl-carousel'),
		'outro'   : modal.find('.section.outro')
	};

	require('owlCarousel');

	modal.find('.owl-carousel').owlCarousel({
		items  : 1,
		dots   : false,
		margin : 10
	});

	_.defer(function() {
		// Audio Event
		modal.find('.image-item').on('click', function() {
			var item  = $(this);
			var audio = item.find('audio')[0];
			audio.play();

			audio.onended = function() {
				// Lets show the ToDo Completed Button on last audio
				if(modal.data('count') == (item.data('order') + 1)) {
					helpers.animateCss(modal.find('.mark-as-done'), 'fadeIn', 1);
				}
			}
		});
	});

	// Get started handler
	modal.find('.next-page').on('click', function() {
		sections['content'].removeClass('out');

		helpers.animateCss(sections['intro'], 'fadeOutLeft', 0, function() {
			sections['intro'].addClass('out');
			helpers.animateCss(sections['content'], 'fadeInRight', 1);
		});
	});

	// Mark as Done hanbler
	modal.find('.mark-as-done').on('click', function() {
		markAsDoneFunc(onMarkedAsDone);

		function onMarkedAsDone() {
			helpers.animateCss(modal.find('.mark-as-done'), 'fadeOut', 0);
			helpers.animateCss(sections['content'], 'fadeOutLeft', 0, function() {
				sections['outro'].removeClass('out');
				sections['content'].addClass('out');

				helpers.animateCss(sections['outro'], 'fadeInRight', 1);
			});
		}
	});

	// Help handler
	modal.find('.fa-question-circle').on('click', function() {
		toastr['info']('Click image to play the audio, swipe to change :)', 'How to');
	});
}
