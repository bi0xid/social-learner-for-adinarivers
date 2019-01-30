var $ = jQuery,
	_ = require('underscore');

var helpers = require('helpers'),
	toastr  = require('toastr');

module.exports = tasks = {
	newItem: function(utils, listContainer, removeTaskHandler) {
		var template = require('./templates/template.hbs');
		listContainer.append(template());

		_.defer(function() {
			// Init WYSIWYG
			var newItem = listContainer.find('li:last-of-type');
			utils.initWysiwyg(newItem.find('textarea'));

			newItem.find('h3').on('click', utils.toggleListItemHandler);

			// Init WordPress Media Manager
			newItem.find('.change-media').on('click', tasks.openWpMediaManager);

			// Append add new items handler
			var addNewItem = _.partial(tasks.addNewTaskItem, newItem, utils);
			newItem.find('.add_item').on('click', addNewItem);

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

				var item = $(e.currentTarget).parents('li.tasks');
				var data = tasks.getToDoArrayData(item);

				data['action'] = 'add_lesson_task';

				helpers.ajaxCall(data, onTaskAdded);

				function onTaskAdded(data) {
					var parsedData = JSON.parse(data);
					if(parsedData.status == 1) {
						toastr['success']('New task added', 'Nice!');

						item.attr('data-id', JSON.parse(data).task_id);
						item.find('.actions .save-task').unbind().html('Update')
							.removeClass('save-task').addClass('update-task')
							.on('click', tasks.updateTaskHandler);
					}
					else {
						toastr['error']('Something happen: ' + parsedData.error, 'Ups');
					}
				}
			});
		});
	},

	getToDoArrayData: function(item) {
		// Let's get the images
		var tasks = [];
		_.each(item.find('.todo_tasks li'), function(li) {
			tasks.push({
				'image' : $(li).find('.selected_image').attr('src'),
				'video' : $(li).find('.task_video').val(),
				'audio' : $(li).find('.selected_audio source').attr('src'),
				'desc'  : $(li).find('.task_desc').val(),
				'title' : $(li).find('.task_title').val(),
				'order' : $(li).attr('data-order')
			});
		});

		// Prepare the content
		var content = {
			'intro' : {
				'image' : item.find('.intro img').attr('src'),
				'title' : item.find('.intro .intro_title').val(),
				'video' : item.find('.intro .intro_video').val(),
				'desc'  : item.find('.intro textarea').trumbowyg('html')
			},
			'content' : tasks,
			'outro' : {
				'image' : item.find('.outro img').attr('src'),
				'video' : item.find('.outro .outro_video').val(),
				'title' : item.find('.outro .outro_title').val(),
				'desc'  : item.find('.outro textarea').trumbowyg('html')
			}
		};

		return {
			'type'     : 3,
			'content'  : content,
			'lesson_id': item.parent().data('lesson'),
			'name'     : item.find('input[name="task_name"]').val(),
			'points'   : item.find('input[name="task_points"]').val()
		};
	},

	updateHandler: function (e) {
		e.preventDefault();

		var item = $(e.currentTarget).parents('li');
		var data = tasks.getToDoArrayData(item);

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

	addNewTaskItem: function(item, utils, e) {
		e.preventDefault();

		var template = require('./templates/item.hbs');
		var tasksContainer = item.find('.todo_tasks');

		tasksContainer.append(template({ order : tasksContainer.find('li').length }));

		_.defer(function() {
			var imageListItem = item.find('.todo_tasks li').last();

			utils.initSortable(tasksContainer);
			tasks.appendTaskTodoEvents(imageListItem, tasksContainer);
		});
	},

	appendTaskTodoEvents: function(item, imagesContainer) {
		// Add Image event
		var changeImageCallback = _.partial(tasks.openWpMediaManagerAudioImage, item, 'image');
		item.find('.image_item').on('click', changeImageCallback);

		// Add Audio Event
		var changeAudioCallback = _.partial(tasks.openWpMediaManagerAudioImage, item, 'audio');
		item.find('.add_audio').on('click', changeAudioCallback);

		// Remove Item Event
		item.find('.remove').on('click', function(e) {
			e.preventDefault();
			item.remove();

			// We need to update all items order
			var index = 0;
			_.each(imagesContainer.find('li'), function(li) {
				$(li).attr('data-order', index);
				index++;
			});
		});
	},

	openWpMediaManagerAudioImage: function(container, type, e) {
		e.preventDefault();

		var wpMediaManager = wp.media({
			title: type == 'image' ? 'Insert an image' : 'Insert an Audio',
			library: {type: type},
			multiple: false,
			button: {text: 'Insert'}
		}).open();

		wpMediaManager.on('select', function(){
			var item = wpMediaManager.state().get('selection').first().toJSON();

			if(type == 'image') {
				container.find('.selected_image').attr('src', item.url);
				container.find('.selected_image').data('id', item.id);
				container.find('.image_item').html('Change Image');

				// Use this for the CSS
				container.find('.selected_image').css('background-image', 'url(' + item.url + ')');
			}
			else {
				var audio = container.find('.selected_audio');
				audio.find('source').attr('src', item.url);
				audio.load();

				container.find('.add_audio').html('Change Audio');
			}
		});
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
};
