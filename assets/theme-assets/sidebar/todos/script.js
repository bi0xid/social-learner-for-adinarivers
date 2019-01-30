var _        = require('underscore'),
	helpers  = require('helpers'),
	conffeti = require('../../../plugins/confettis/script');

var quizToDoHandler    = require('./quiz_todo/script'),
	tasksToDo          = require('./tasks_todo/script'),
	normalToDo         = require('./normal_todo/script'),
	specialToDoHandler = require('./special_todo/script'),
	carouselModal      = require('./carousel_todo/script');

module.exports = function(container) {
	var utils = {
		resetPopUpResponsiveName: function() {
			$('#todo-name').find('p').empty();
		},

		addItemToBreadCrumb: function(string) {
			var breadcrumb = $('#breadcrumb');

			var lastTitle = breadcrumb.find('strong').html(),
				element   = '<span><a href="#">' + lastTitle + '</a></span>';

			breadcrumb.find('strong').replaceWith(element);
			breadcrumb.append($('<span>', { class : 'separation', html : '/' }));
			breadcrumb.append($('<strong>', { html : string }));

			$('#todo-name').find('p').html(name);
		},

		removeLastBreadCrumbItem: function() {
			var breadcrumb = $('#breadcrumb'),
				lessonName = breadcrumb.find('span:not(.separation)').last().find('a').html(),
				element    = $('<strong>', { html : lessonName });

			breadcrumb.find('strong').remove();
			breadcrumb.find('.separation').last().remove();
			breadcrumb.find('span:not(.separation)').last().replaceWith(element);
		},

		closeModalHandler: function() {
			helpers.toggleZenDeskWidget('show');
			utils.resetPopUpResponsiveName();

			$('#masthead .header-desktop').removeClass('modal-in');
			$('.modal-overlay').fadeOut(400, function() {
				$(this).remove();
				$('#modal-congrat').length || $('html').removeClass('no-scroll');
			});

			utils.removeLastBreadCrumbItem();
		},

		prepareBodyHtmlOnModalOpen: function() {
			$('html').addClass('no-scroll');
			helpers.toggleZenDeskWidget('hide');
			$('#masthead .header-desktop').addClass('modal-in');
		}
	};

	helpers.initScrollBarPlugin(container.find('.list')[0]);

	// Event for the Special Course ToDos
	container.find('.task-item.special-todo').on('click', _.partial(specialToDoHandler, utils));

	// Event for the normal ToDos
	container.find('.task-item:not(.special-todo)').on('click', function(e) {
		var item = $(e.currentTarget);

		helpers.ajaxCall({
			action    : 'get_todo_modal_data',
			'task_id' : item.data('id')
		}, checkIfTodoCanBeDone);

		function checkIfTodoCanBeDone(data) {
			var parsedData = JSON.parse(data);

			if(parsedData['can_be_done']) {
				todoModal(parsedData.task_data);
			}
			else {
				youTubeModal(parsedData['youtube_video']);
			}

			// Let's close the Sidebar
			$('#right-sidebar').hasClass('open') && $(window).width() <= 800 && helpers.toggleRightSidebar();
		}

		function youTubeModal(videoId) {
			var template = require('./youtube_modal/template.hbs');

			utils.prepareBodyHtmlOnModalOpen();
			utils.addItemToBreadCrumb('Break time!');

			$('body').append(template()).find('.modal-overlay ').fadeIn(400);
			
			var modal = $('.modal-overlay');
			modal.find('.close-modal').on('click', utils.closeModalHandler);

			helpers.resizeFunctionHandler(function() {
				modal.find('.modal-content').css('height', $(window).height() / 1.7);
			});

			modal.find('.mark-as-done').on('click', utils.closeModalHandler);

			_.defer(function() {
				var player = new YT.Player('youtube-video', {
					height  : '100%',
					width   : '100%',
					videoId : videoId,
					events  : {
						'onReady' : function(video) {
							modal.find('.video-iframe').addClass('in');
							modal.find('.modal-content .loading').addClass('out');
						},
						'onStateChange' : function(state) {
							state.data == 1 && modal.find('.video-description').addClass('out');
						}
					},
					playerVars : {
						'controls' : 0
					}
				});
			});
		}

		function todoModal(data) {
			var templates = {
				0 : require('./normal_todo/template.hbs'),
				1 : require('./carousel_todo/template.hbs'),
				2 : require('./quiz_todo/template.hbs'),
				3 : require('./tasks_todo/template.hbs')
			};

			// Append all necesary buttons for the Normal ToDo
			if(data.type == 0) {
				data.content.intro.button   = '<button class="next-page">Get Started</button>';
				data.content.content.button = '<button class="mask-as-done">Finish</button>';
				data.content.outro.button   = '<button class="close-modal">Close</button>';
			}
			// At the Quiz ToDo we need additional data
			else if(data.type == 2) {
				data.content.intro.class      = 'intro';
				data.content.outro_pass.class = 'quiz-passed out';
				data.content.outro_fail.class = 'quiz-not-passed out';

				data.content.outro_fail.style = 'opacity:0;';
				data.content.outro_pass.style = 'opacity:0;';

				data.content.outro_fail.button = '<button>Start Quiz Again</button>';
				data.content.intro.button      = '<button class="start-quiz out"><span>Get Started</span><div class="loading"><i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw loading"></i></div></button>';
			}

			// Append the Modal to the Body
			utils.prepareBodyHtmlOnModalOpen();
			utils.addItemToBreadCrumb(item.text());
			$('body').append(templates[data.type](data)).find('.modal-overlay ').fadeIn(400);

			var modal = $('.modal-overlay');
			modal.find('.close-modal').on('click', utils.closeModalHandler);

			_.defer(function() {
				// Init modal handlers
				if(data.type == '0') {
					normalToDo(modal, _.partial(markToDoAsDone, data, item));
				}
				else if(data.type == '1') {
					carouselModal(modal, _.partial(markToDoAsDone, data, item));
				}
				else if(data.type == '2') {
					data['lesson_id'] = item.data('lessonid');
					quizToDoHandler(item, modal, data, markToDoAsDone);
				}
				else if(data.type == '3') {
					tasksToDo(modal, _.partial(markToDoAsDone, data, item), utils.closeModalHandler);
				}

				// Init all Wistia Videos
				modal.find('.video_iframe').each(function(key) {
				var videoItem = $(this);

				var wistiaEmbedModal = Wistia.embed(videoItem.data('id'));
					wistiaEmbedModal.ready(function(video) {
						videoItem.removeClass('out');
						videoItem.next('.loading').addClass('out');
					});
				});
			});

			helpers.resizeFunctionHandler(function() {
				modal.find('.modal-content').css('height', $(window).height() / 1.7);
			});

			function markToDoAsDone(data, item, callback) {
				item.data('done') !== 1 && helpers.ajaxCall({
					'task_id'  : data.task_id,
					action     : 'mark_task_as_done',
					'lesson_id': item.data('lessonid')
				}, onMarkedAsDone);

				function onMarkedAsDone(data) {
					var parsedData = JSON.parse(data);

					item.data('confetti') && !item.data('done') && todoCongratModal();

					item.addClass('done');
					item.data('done', 1);

					if(parsedData.course_done) {
						window.location = parsedData.course_finished_page;

						$('#lessons-progress').find('.line span').css('width', '100%');
						$('#lessons-progress').find('.modules .finished').removeClass('out');
					}
					else if(parsedData.module_done && parsedData.status !== 'already_done') {
						moduleDoneHandler();
					}
					else if(parsedData.lesson_done && parsedData.status !== 'already_done') {
						lessonDoneHandler();
					}

					$('#right-sidebar .todo-count .d').html(parsedData['lesson_todo_progress']['done']);

					function lessonDoneHandler() {
						var previusLesson = $('#lessons-progress').find('.modules .lesson.in-progress').last(),
							nextLesson    = $('#lessons-progress').find('.modules .lesson.bloqued').first();

						previusLesson.removeClass('in-progress').addClass('done');
						nextLesson.removeClass('bloqued').addClass('in-progress');

						$('li[data-menulesson="' + item.data('lessonid') + '"]').next()
							.removeClass('bloqued');

						updateProgress(nextLesson);
					}

					function moduleDoneHandler() {
						$('#lessons-progress').find('.modules .lesson.in-progress').last()
							.removeClass('in-progress').addClass('done');

						var nextModule = $('#lessons-progress').find('.modules ul.bloqued').first(),
							nextLesson = nextModule.find('.lesson.bloqued');

						nextModule.removeClass('bloqued').addClass('in-progress');
						nextLesson.removeClass('bloqued').addClass('in-progress');

						$('li[data-menulesson="' + nextLesson.data('lesson') + '"]').removeClass('bloqued');

						updateProgress(nextLesson);
					}

					function updateProgress(nextLesson) {
						var width = nextLesson.length
							? (nextLesson.offset().left * 100) / $('#lessons-progress').find('.line').width()
							: 100;

						$('#lessons-progress').find('.line span').css('width', width + '%');
					}
				}

				callback && callback();
			}
		}
	});

	function todoCongratModal() {
		var template = require('./congrat_modal/template.hbs');
		$('body').append(template());

		var modal = $('#modal-congrat');

		_.defer(function() {
			$('html').addClass('no-scroll');
			conffeti('canvas', 100, 2, 0.3, 0.5);

			modal.removeClass('out');
			modal.find('button').on('click', function() {
				modal.addClass('out');
				$('html').removeClass('no-scroll');

				_.delay(function() {
					$('#modal-congrat').remove();
				}, 400);
			});
		});
	};
}
