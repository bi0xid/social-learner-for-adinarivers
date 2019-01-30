var $ = jQuery,
	_ = require('underscore');

var helpers = require('helpers'),
	toastr  = require('toastr');

require('trumbowyg');
helpers.initHandleBarsHelpers();

var quizToDo   = require('./sections/quiz_todo/script'),
	tasksToDo  = require('./sections/tasks_todo/script'),
	normalToDo = require('./sections/normal_todo/script'),
	imagesToDo = require('./sections/images_audio_todo/script');

$(document).ready(function() {
	var container = $('#lessons-task-form');

	$.trumbowyg.svgPath = 'https://dl.dropboxusercontent.com/u/37507878/MTS2/icons.svg';

	var utils = {
		initWysiwyg: function(element) {
			element.trumbowyg({
				fullscreenable: false,
				closable: true,
				semantic: true,
				removeformatPasted: true,
				autogrow: true,
				btns: ['bold', 'italic', '|', 'link']
			});
		},

		initSortable: function(element) {
			element.sortable({
				deactivate: function(e, ui) {
					// Update all orders here
					var index = 0;
					_.each(element.find('li'), function(li) {
						$(li).attr('data-order', index);
						index++;
					});
				}
			});
			element.disableSelection();
		},

		toggleListItemHandler: function(e) {
			var toggle = $(this).next('.toggle-indicator');
			toggle.toggleClass('open');
			toggle.hasClass('open') && $(this).parent().find('.content').slideDown();
			toggle.hasClass('open') || $(this).parent().find('.content').slideUp();
		}
	}

	if(container.length) {
		container.find('#add-task').on('click', addNewTaskHandler);

		_.each(container.find('.task-list li'), function(li) {
			var item = $(li);

			item.find('h3').on('click', function() {
				var toggle = $(this).next('.toggle-indicator');
				toggle.toggleClass('open');
				toggle.hasClass('open') && $(this).parent().find('.content').slideDown();
				toggle.hasClass('open') || $(this).parent().find('.content').slideUp();
			});

			utils.initWysiwyg(item.find('textarea'));

			if(item.hasClass('normal')) {
				item.find('.remove-task').on('click', removeTaskHandler);
				item.find('.update-task').on('click', normalToDo.updateHandler);
				item.find('.change-media').on('click', normalToDo.openWpMediaManager);
			}
			else if(item.hasClass('todo')) {
				item.find('.remove-task').on('click', removeTaskHandler);
				item.find('.update-task').on('click', quizToDo.updateHandler);
				item.find('.change-media').on('click', quizToDo.openWpMediaManager);
			}
			else if(item.hasClass('images')) {
				item.find('.remove-task').on('click', removeTaskHandler);
				item.find('.update-task').on('click', imagesToDo.updateHandler);
				item.find('.change-media').on('click', imagesToDo.openWpMediaManager);

				// Add new image handler
				var addNewImageItem = _.partial(imagesToDo.addNewImageItemToDo, $(li), utils);
				$(li).find('.add_img').on('click', addNewImageItem);

				// Sortable and Special events for each image
				utils.initSortable($(li).find('.todo_images'));
				_.each($(li).find('.todo_images li'), function(img) {
					imagesToDo.appendImageTodoEvents($(img), $(li).find('.todo_images'));
				});
			}
			else if(item.hasClass('tasks')) {
				item.find('.remove-task').on('click', removeTaskHandler);
				item.find('.update-task').on('click', tasksToDo.updateHandler);
				item.find('.change-media').on('click', tasksToDo.openWpMediaManager);

				// Add new image handler
				var addNewTaskItem = _.partial(tasksToDo.addNewTaskItem, $(li), utils);
				$(li).find('.add_item').on('click', addNewTaskItem);

				// Sortable and Special events for each image
				utils.initSortable($(li).find('.todo_tasks'));
				_.each($(li).find('.todo_tasks li'), function(img) {
					tasksToDo.appendTaskTodoEvents($(img), $(li).find('.todo_tasks'));
				});
			}
		});
	}

	// Add a New ToDo
	function addNewTaskHandler() {
		var todoType = parseInt($('#todo_type').val());

		var todoScripts = {
			0 : normalToDo.newItem,
			1 : imagesToDo.newItem,
			2 : quizToDo.newItem,
			3 : tasksToDo.newItem
		};

		todoScripts[todoType](utils, container.find('.task-list'), removeTaskHandler);
	}

	// Remove ToDo
	function removeTaskHandler(e) {
		e.preventDefault();

		helpers.ajaxCall({
			action      : 'remove_lesson_task',
			'task_id'   : $(e.currentTarget).parents('li').data('id'),
			'lesson_id' : $(e.currentTarget).parents('ul').data('lesson')
		}, onTaskRemoved);

		function onTaskRemoved(data) {
			if(JSON.parse(data).status == 1) {
				if($(e.currentTarget).parents('li').data('type') == 2) {
					$('#todo_type option[value="2"]').prop('disabled', false);
				}

				$(e.currentTarget).parents('li').remove();
				toastr['success']('Task removed', 'Nice!');
			}
			else {
				toastr['error']('Something happen: ' + JSON.parse(data).error, 'Ups');
			}
		}
	}
});
