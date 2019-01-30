var $ = jQuery,
	_ = require('underscore');

var helpers = require('helpers'),
	toastr  = require('toastr');

module.exports = images = {
	newItem: function(utils, listContainer, removeTaskHandler) {
		var template = require('./templates/base.hbs');
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
			newItem.find('.change-media').on('click', images.openWpMediaManager);

			// Append add new images handler
			var addNewImageItem = _.partial(images.addNewImageItemToDo, newItem, utils);
			newItem.find('.add_img').on('click', addNewImageItem);

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
				var data = images.getToDoArrayData(item);

				data['action'] = 'add_lesson_task';
				helpers.ajaxCall(data, onTaskAdded);

				function onTaskAdded(data) {
					var parsedData = JSON.parse(data);

					if(parsedData.status == 1) {
						toastr['success']('New task added', 'Nice!');

						item.attr('data-id', JSON.parse(data).task_id);
						item.find('.actions .save-task').unbind().html('Update')
							.removeClass('save-task').addClass('update-task')
							.on('click', images.updateTaskHandler);
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
		var images = [];
		_.each(item.find('.todo_images li'), function(li) {
			images.push({
				'image' : $(li).find('.selected_image').attr('src'),
				'audio' : $(li).find('.selected_audio source').attr('src'),
				'desc'  : $(li).find('.image_desc').val(),
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
			'content' : images,
			'outro' : {
				'image' : item.find('.outro img').attr('src'),
				'video' : item.find('.outro .outro_video').val(),
				'title' : item.find('.outro .outro_title').val(),
				'desc'  : item.find('.outro textarea').trumbowyg('html')
			}
		};

		return {
			'type'     : 1,
			'content'  : content,
			'lesson_id': item.parent().data('lesson'),
			'name'     : item.find('input[name="task_name"]').val(),
			'points'   : item.find('input[name="task_points"]').val()
		};
	},

	updateHandler: function (e) {
		e.preventDefault();

		var item = $(e.currentTarget).parents('li');
		var data = images.getToDoArrayData(item);

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

	addNewImageItemToDo: function(item, utils, e) {
		e.preventDefault();

		var template = require('./templates/images-item.hbs');
		var imagesContainer = item.find('.todo_images');

		imagesContainer.append(template({ order : imagesContainer.find('li').length }));

		_.defer(function() {
			var imageListItem = item.find('.todo_images li').last();

			utils.initSortable(imagesContainer);
			images.appendImageTodoEvents(imageListItem, imagesContainer);
		});
	},

	appendImageTodoEvents: function(item, imagesContainer) {
		// Add Image event
		var changeImageCallback = _.partial(images.openWpMediaManagerAudioImage, item, 'image');
		item.find('.image_item').on('click', changeImageCallback);

		// Add Audio Event
		var changeAudioCallback = _.partial(images.openWpMediaManagerAudioImage, item, 'audio');
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
}