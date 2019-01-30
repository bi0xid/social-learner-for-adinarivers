var $       = jQuery,
	toastr  = require('toastr'),
	helpers = require('helpers'),
	_       = require('underscore');

var activityUpdate = require('../../sidebar/activity/script').updateCurrentActivities;

toastr.options = require('helpers').toastrOptions();

module.exports = function (container) {
	var postId = container.data('post'),
		form   = $('#post-comment-ajax');

	var formLoading = $('#form-loading')

	var paginationLoading  = $('#pagination-loading'),
		newCommentsHandler = $('#new_comments_handler');

	prepareReplyForm();

	var events = [
		{
			handler  : 'click',
			selector : container.find('.pagination li'),
			action   : paginationHandler
		},
		{
			handler  : 'submit',
			selector : '#post-comment-ajax',
			action   : submitComment
		},
		{
			handler  : 'click',
			selector : '#new_comments_handler',
			action   : refreshCommentList
		}
	];

	_.each(events, function(event) {
		$(event.selector).length && $(event.selector).on(event.handler, event.action);
	});

	var utils = {
		scrollToInput : function() {
			$('html, body').animate({
				scrollTop: $('#post-comment-ajax').offset().top - 90
			}, 800);
		},

		resetCommentForm: function() {
			$('#comment_text').val('');
			$('#parent_reply').remove();
			form.find('.form-footer').css('display', 'none');
		},

		onLessonDoneHandler: function() {
			var nextLesson = $('#lessons-progress').find('.modules .lesson.bloqued').first();

			$('#lessons-progress').find('.modules .lesson.in-progress').last().removeClass('in-progress').addClass('done');
			nextLesson.removeClass('bloqued').addClass('in-progress');

			var width = nextLesson.length
				? (nextLesson.offset().left * 100) / $('#lessons-progress').find('.line').width()
				: 100;

			$('#lessons-progress').find('.line span').css('width', width + '%');
		},

		updateProgressBar: function(parsedData) {
			var todoCount = $('#right-sidebar .todo-count');
			todoCount.find('.d').html(parsedData.lesson_progress.done);
			todoCount.find('.p').html(parsedData.lesson_progress.total);
		}
	};

	// Each 30 seconds we check for new comments
	newCommentsHandler.length && setInterval(function() {
		helpers.ajaxCall({
			action  : 'get_total_comments',
			post_id : postId,
		}, function(e) {
			var actualCount = container.find('ul.comment').data('count');

			// If there is new comments lets show the option
			if(actualCount != parseInt(e)) {
				newCommentsHandler.removeClass('out');
			}
		});
	}, 30000);

	// This function send a comment to the actual post via AJAX
	function submitComment(e) {
		e.preventDefault();

		if($('#comment_text').val().length > 0) {
			formLoading.removeClass('out');
			newCommentsHandler.addClass('out');

			var isNormalPage = $('#is_not_sensei_page').val();

			helpers.ajaxCall({
				'is_normal_page' : isNormalPage,
				'security'       : $('#nonce').val(),
				action           : 'send_comment_ajax',
				'text'           : $('#comment_text').val(),
				'course_id'      : $('body').data('courseid'),
				'post_id'        : $(e.currentTarget).data('post'),
				'parent_reply'   : $('#parent_reply').length ? $('#parent_reply').val() : null
			}, function(response) {
				var parsedData = JSON.parse(response);
				// Is sent was correct lets remove things 
				if(parsedData.status !== false) {
					utils.resetCommentForm();

					var actualPage = container.find('.pagination li.active').data('page');
					paginationAction(actualPage, false);

					if(!isNormalPage) {
						// Lets mark the special todo as done
						$('#right-sidebar .todos-container a[data-id="comment_todo"]').addClass('done');

						// Events if the lesson is done and ToDo Progress Update
						parsedData.lesson_done !== false && utils.onLessonDoneHandler();
						utils.updateProgressBar(parsedData);

						// Update activity
						activityUpdate();
					}
				}
				// Otherwise send error alert
				else {
					toastr['error']('There was an error, please try again', 'Ups!');
				}

				formLoading.addClass('out');
				newCommentsHandler.addClass('out');
			});
		}
	}

	// Using this function to refresh the comments area after comment sent
	function refreshCommentList() {
		getCommentsData(1, onAjaxDone);

		function onAjaxDone(data) {
			var parsedData = JSON.parse(data);

			renderComments(parsedData);
			newCommentsHandler.addClass('out');
		}
	}

	// Pagination hanlder for the item
	function paginationHandler(e) {
		var item = $(e.currentTarget);

		if(!item.hasClass('active')) {
			paginationLoading.removeClass('out');
			paginationAction(item.data('page'), true);
		}
	}

	// This function gets the comments for the given page and render
	function paginationAction(page, moveToTop) {
		getCommentsData(page, onAjaxDone);

		function onAjaxDone(data) {
			var parsedData = JSON.parse(data);

			renderComments(parsedData);
			renderPagination(parsedData.pages);

			paginationLoading.addClass('out');
			moveToTop && utils.scrollToInput();
		}
	}

	function renderPagination(data) {
		var pagContainer = container.find('.pagination').empty();

		if(data.current >= 6 && data.limit <= 4) {
			pagContainer.append('<li data-page="1"><span>1</span></li>');
		}

		for (var i = data.init; i <= data.max; i++) {
			if(i <= data.limit && i > 0) {
				var isActive = i == data.current ? 'active' : '';
				pagContainer.append('<li data-page="' + i + '" class="' + isActive + '"><span>' + i + '</span></li>');
			}
		}

		pagContainer.find('li').on('click', paginationHandler);
	}

	// Get all comments with page param
	function getCommentsData(page, callback) {
		helpers.ajaxCall({
			action      : 'get_post_comments_pagination',
			post_id     : postId,
			page_number : page
		}, callback);
	}

	// Render comments
	function renderComments(data) {
		renderPagination(data.pages);

		helpers.animateCss(container.find('.comment-list ul.comment'), 'fadeOutLeft', 0, function() {
			container.find('.comment-list').empty();

			var template   = require('./templates/list.hbs');
			container.find('.comment-list').append(template(data));

			_.defer(function() {
				helpers.animateCss(container.find('.comment-list ul.comment'), 'fadeInRight', 1);

				// Set buttons events
				prepareReplyForm();
			});
		});
	}

	// Reply form needs some more love than the original
	function prepareReplyForm() {
		container.find('.comment-list li .reply').on('click', function(e) {
			e.preventDefault();

			// Remove any old parent input
			$('#parent_reply').remove();

			// Put a new hidden input at the form
			form.append($('<input>', {
				id   : 'parent_reply',
				name : 'parent_reply',
				type : 'hidden',
				val  : $(e.currentTarget).data('id'),
			}));

			// Show some information at the Form
			form.find('.form-footer').css('display', 'inline-block');
			form.find('.form-footer .reply-to strong').html($(e.currentTarget).data('user') + '&apos;s');

			// Prepare Cancel Reply button
			form.find('.form-footer .cancel-reply').on('click', function(e) {
				e.preventDefault();

				$('#parent_reply').remove();
				form.find('.form-footer').css('display', 'none');
			});

			utils.scrollToInput();
		});
	}
}
