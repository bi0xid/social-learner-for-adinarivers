var $ = jQuery,
	_ = require('underscore');

var helpers = require('helpers'),
	toastr  = require('toastr');

module.exports = quiz = {
	newItem : function(utils, listContainer, removeTaskHandler) {
		var template = require('./template.hbs');
		listContainer.append(template());

		_.defer(function() {
			// Init WYSIWYG
			var newItem = listContainer.find('li:last-of-type');
			utils.initWysiwyg(newItem.find('textarea'));

			newItem.find('h3').on('click', function() {
				var toggle = $(this).next('.toggle-indicator');
				toggle.toggleClass('open');
				toggle.hasClass('open') && $(this).parent().find('.content').slideDown();
				toggle.hasClass('open') || $(this).parent().find('.content').slideUp();
			});

			// Init WordPress Media Manager
			newItem.find('.change-media').on('click', quiz.openWpMediaManager);

			// Remove Task Handler
			newItem.find('.remove-task').on('click', function(e) {
				e.preventDefault();

				if($(e.currentTarget).parents('li').data('id')) {
					removeTaskHandler(e);
				}
				else {
					$(e.currentTarget).parents('li').remove();
				}
			});

			// Save item handler
			newItem.find('.save-task').on('click', function(e) {
				e.preventDefault();

				var item = $(e.currentTarget).parents('li');
				var data = quiz.getToDoArrayData(item);

				data['action'] = 'add_lesson_task';
				helpers.ajaxCall(data, onTaskAdded);

				function onTaskAdded(data) {
					var parsedData = JSON.parse(data);
					if(parsedData.status == 1) {
						toastr['success']('New task added', 'Nice!');

						item.attr('data-id', JSON.parse(data).task_id);
						item.find('.actions .save-task').unbind().html('Update')
							.removeClass('save-task').addClass('update-task')
							.on('click', quiz.updateTaskHandler);
					}
					else {
						toastr['error']('Something happen: ' + parsedData.error, 'Ups');
					}
				}
			});

			$('#todo_type').val(0);
			$('#todo_type option[value="2"]').prop('disabled', true);
			newItem.find('input[name="quiz_id"]').val($('#quiz_id').val());
		});
	},

	getToDoArrayData : function(item) {
		var content = {
			'quiz'  : item.find('input[name="quiz_id"]').val(),
			'intro' : {
				'image' : item.find('.intro img').attr('src'),
				'video' : item.find('.intro .intro_video').val(),
				'title' : item.find('.intro .intro_title').val(),
				'desc'  : item.find('.intro textarea').trumbowyg('html')
			},
			'outro_pass' : {
				'image' : item.find('.outro_pass img').attr('src'),
				'video' : item.find('.outro_pass .outro_pass_video').val(),
				'title' : item.find('.outro_pass .outro_pass_title').val(),
				'desc'  : item.find('.outro_pass textarea').trumbowyg('html')
			},
			'outro_fail' : {
				'image' : item.find('.outro_fail img').attr('src'),
				'video' : item.find('.outro_fail .outro_fail_video').val(),
				'title' : item.find('.outro_fail .outro_fail_title').val(),
				'desc'  : item.find('.outro_fail textarea').trumbowyg('html')
			}
		};

		return {
			'type'     : 2,
			'content'  : content,
			'lesson_id': item.parent().data('lesson'),
			'name'     : item.find('input[name="task_name"]').val(),
			'points'   : item.find('input[name="task_points"]').val()
		};
	},

	updateHandler : function (e) {
		e.preventDefault();

		var item = $(e.currentTarget).parents('li');
		var data = quiz.getToDoArrayData(item);

		data['task_id'] = item.data('id');
		data['action']  = 'update_lesson_task';

		helpers.ajaxCall(data, onTaskUpdated);

		function onTaskUpdated(data) {
			var parsedData = JSON.parse(data);
			parsedData.status == 1 && toastr['success']('Task edited successfully!', 'Nice!');

			if(parsedData.error) {
				toastr['error']('Something happen: ' + parsedData.error, 'Ups');
			}
			else if(parsedData.status == 0) {
				toastr['info']('No changes to update', 'Ey');
			}
		}
	},

	openWpMediaManager: function(e) {
		e.preventDefault();

		var wpMediaManager = wp.media({
			title: 'Insert an image',
			library: { type: 'image' },
			multiple: false,
			button: {text: 'Insert'}
		}).open();

		wpMediaManager.on('select', function(){
			var item = wpMediaManager.state().get('selection').first().toJSON();
			$(e.currentTarget).next('img').attr('src', item.url);
		});
	}
}