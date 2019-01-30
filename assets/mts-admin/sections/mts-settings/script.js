var $ = jQuery,
	_ = require('underscore');

var toastr  = require('toastr'),
	helpers = require('helpers');

toastr.options = require('helpers').toastrOptions();

module.exports = function() {
	var spinner = $('#mts-settings-footer .spinner-css');

	// Save handler
	$('#mts-settings-footer button[type="submit"]').on('click', function(e) {
		var videoId       = $('#welcome_video_id').val(),
			youtube_id    = $('#youtube_video').val(),
			wait_time     = $('#todo_wait_time').val(),
			welcomeText   = $('#welcome_text').val(),
			allUsersToDo  = $('#users_todos_reset'),
			userResetTodo = $('#user').val();

		var canSave = allUsersToDo.is(':checked')
			? confirm('Reset ALL USERS ToDo stats?')
			: true;

		if(canSave) {
			spinner.removeClass('out');

			// Según el número de inputs el número de llamadas AJAX puede variar
			var callbacksNumber = 3;
			if(userResetTodo !== '-1' || allUsersToDo.is(':checked')) {
				callbacksNumber += 1;
			}
			var callback = _.after(callbacksNumber, onAjaxDone);

			helpers.ajaxCall({ action : 'change_welcome_video_id', 'video_id' : videoId }, callback);
			helpers.ajaxCall({ action : 'todos_settings', 'youtube_id' : youtube_id, 'wait_time' : wait_time }, callback);
			helpers.ajaxCall({ action : 'set_welcome_text', 'welcome_text' : welcomeText }, callback);

			// Si All Users ToDo está marcado no tiene sentido quitarle los ToDos a un usuario individual
			if(allUsersToDo.is(':checked')) {
				helpers.ajaxCall({ action : 'remove_user_todo_stats', 'all_users' : true }, callback);
			}
			else if(userResetTodo !== '-1') {
				helpers.ajaxCall({ action : 'remove_user_todo_stats', 'user_id' : userResetTodo }, callback);
			}

			function onAjaxDone(data) {
				spinner.addClass('out');
				toastr["success"]('All settings saved', 'Good');

				$('#user').val(-1).trigger("chosen:updated");
				$('#users_todos_reset').prop('checked', false);
			}
		}
	});

	$('#user').chosen({width: '100%'});

	// Si marcamos el checkbox quitamos la selección de #user
	$('#users_todos_reset').on('change', function(e) {
		if($(this).is(':checked')) {
			$('#user').val(-1).trigger("chosen:updated");
		}
	});

	// Si seleccionamos un usuario quitamos el checkbox de todos los usuarios
	$('#user').on('change', function(evt, params) {
		if($(this).val() !== -1) {
			$('#users_todos_reset').prop('checked', false);
		}
	});
}
