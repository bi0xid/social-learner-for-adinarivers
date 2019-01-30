var _      = require('underscore'),
	$      = jQuery;

var toastr   = require('toastr'),
	helpers  = require('helpers'),
	openChat = require('../messages-widget/script.js').initChatView,
	newChat  = require('../messages-widget/script.js').createNewThread;

toastr.options = require('helpers').toastrOptions();

var scrollBars = undefined;

var inputLengthLimit = 15,
	textLenghtLimit  = 150,
	maxTextHeight    = 175;

module.exports = function() {
	helpers.resizeFunctionHandler(function() {
		$('.wrapper').css('height', $(window).height() -  $('#masthead').height());
		$('#profile-wrapper').css('height', $(window).height() -  $('#masthead').height() - 30);
	});

	// Para cada textarea le asignamos un scroll bar
	$('p[data-editvalue]').each(function() {
		scrollBars = helpers.initScrollBarPlugin($(this)[0]);
	});

	var events = [
		{
			handler  : 'change',
			selector : '#avatar_file',
			action   : upload_avatar
		},
		{
			handler  : 'click',
			selector : '#file-toggler',
			action   : toggle_upload_avatar
		},
		{
			handler  : 'click',
			selector : '#display_name h3, #display_location h4, #display_introduction p, #display_question strong, #display_question p',
			action   : toggle_edit_field
		},
		{
			handler  : 'click',
			selector : '.social-network-edit',
			action   : toggle_social_edit_field
		},
		{
			handler  : 'click',
			selector : window,
			action   : close_open_fields
		},
		{
			handler  : 'click',
			selector : '#write_message',
			action   : open_message_handler
		}
	];

	_.each(events, function(event) {
		$(event.selector).length && $(event.selector).on(event.handler, event.action);
	});

	function open_message_handler(e) {
		var userId = $(e.currentTarget).data('user');

		// Comprobamos si la conversación existe
		var thread = $('#messages-header-content .chat-list li[data-user="' + userId + '"]');

		// Si existe la abrimos
		if(thread.length) {
			var threadId = thread.data('id'),
				userName = thread.find('.name').html();

			openChat(false, {sender: userName}, threadId);
		}
		// Si no existe iniciamos nueva conversación
		else {
			newChat(userId, {sender : '<a href="#">' + $('#display_name span').html() + '</a>'});
		}

		$('#messages-header-content').hasClass('out') && helpers.toggleMessagesWidget();
	}

	function upload_avatar() {
		var formData = new FormData();

		formData.append('security', $('#nonce').val());
		formData.append('action', 'update_profile_image');
		formData.append('avatar_file', $('#avatar_file')[0].files[0]);

		$.ajax({
			url: ajaxurl,
			type: 'POST',
			cache: false,
			data: formData,
			contentType: false,
			processData: false,
			beforeSend: function() {
				toggleImageFormLoading();
			},
			success: function(d, t, e) {
				var response = JSON.parse(e.responseText);
				var imageWrapper = $('#image-wrapper .image');

				helpers.animateCss(imageWrapper, 'fadeOut', 0, function() {
					imageWrapper.remove();

					_.defer(function() {
						$('#image-wrapper').append($('<div>', {
							class: 'image',
							style: 'opacity:0;background-image:url(' + response.route + ')'
						}));

						$('#upload-avatar').removeClass('black');

						helpers.animateCss($('#image-wrapper .image'), 'fadeIn', 1, function() {
							toggleImageFormLoading();
							toastr["success"]("Profile picture updated successfully", "Nice!");

							// Actualizamos el avatar del header
							$('#user-avatar img').attr('src', response.route);
						});
					});
				});
			}
		});
	}

	function toggle_social_edit_field(e) {
		if($('#display_social').hasClass('edit')) {

			// Reiniciamos todos los socials inputs
			$('.social-network-edit').addClass('out');

			var socialInput = $(e.currentTarget);

			// Enseñamos el input
			socialInput.removeClass('out');
			socialInput.find('input').focus();

			socialInput.find('input').on('keydown', function(e) {
				e.stopImmediatePropagation();

				if(e.keyCode == 13) {
					save_social_networks();
					return false;
				}
			});
		}
	}

	function save_social_networks() {
		var data = [];

		_.each($('#display_social ul li'), function(li) {
			var item = $(li);

			data.push({
				id  : item.find('input').attr('id'),
				val : item.find('input').val()
			});
		});

		helpers.ajaxCall({
			action : 'update_user_social',
			data   :  data,
		}, onAjaxDone);

		function onAjaxDone(e) {

			// Socials guardados
			$('.social-network-edit').addClass('out');

			_.each($('.social-network-edit'), function(social) {
				$(social).toggleClass('filled', $(social).find('input').val().length > 0);
			});

			toastr["success"]("Social networks updated successfully!", "Nice!");
		}
	}

	function toggle_edit_field(e) {
		var item = $(e.currentTarget);
		var formTemplate = require('./templates/field_form.hbs');

		if((!$('.field-form').length && !$('.text-form').length) && item.data('canedit')) {
			// Obtenemos los valores del campo a modificar.

			var form = undefined,
				isTextarea = item.data('textarea'),
				id = item.data('editvalue'),
				oldField = $('[data-editvalue="' + id + '"]');

			var value = isTextarea
				? oldField.find('span').hasClass('filled')
					? helpers.br2nl(oldField.find('span').html())
					: null
				: oldField.find('span').hasClass('filled')
					? oldField.find('span').html()
					: null;

			// Adjuntamos el formulario si no existe ya
			if(!$('#' + id + '_field').length) {

				// Preparamos el fomulario para el elemento
				$('#' + id).append(formTemplate({
					value         : value,
					textarea      : isTextarea,
					id            : id + '_field',
					totalLength   : textLenghtLimit,
					placeholder   : item.data('placeholder'),
					currentLength : oldField.find('span').hasClass('filled')
						? getTextAreaLenght(helpers.br2nl(oldField.find('span').html()))
						: 0
				}));

				form = $('#' + id + '_field').parents('.field-form').length
					? $('#' + id + '_field').parents('.field-form')
					: $('#' + id + '_field').parents('.text-form');

				_.defer(function() {
					// Evento para cerrar y borrar el formulario
					$('#' + id).find('.close-field').on('click', _.partial(closeFormHandler, form));

					// Animación de entrada
					helpers.animateCss(oldField, 'fadeOut', 0, function() {
						var newFieldWrapper = isTextarea ? $('.text-form[data-id="' + id + '_field"]') : $('.field-form[data-id="' + id + '_field"]');
						helpers.animateCss(newFieldWrapper, 'fadeIn', 1);
					});
					
					// Preparamos la acción para guardar los cambios.
					var newField = $('#' + id + '_field');
					newField.attr('type') == 'text' && newField.on('keydown', function(e) {
						e.keyCode === 13 && saveNewValueHandler();
					});

					// Si es un textarea enseñamos el limite de caracteres
					newField.attr('type') == 'text' || newField.on('keydown', function(e) {
						var target = $(e.currentTarget);
						var chars = getTextAreaLenght(target.val());

						target.siblings('.charcounter').find('.c').html(chars);
						target.siblings('.charcounter').toggleClass('error', chars > textLenghtLimit);
					});

					$('#' + id).find('.save-field').on('click', saveNewValueHandler);

					function saveNewValueHandler() {
						// Comprobamos que el length sea correcto
						var lengthIsGood = isTextarea
							? getTextAreaLenght(newField.val()) <= textLenghtLimit
							: newField.val().length <= inputLengthLimit;

						lengthIsGood || toastr["error"]("Please check your field length", "Ups!");

						lengthIsGood && helpers.ajaxCall({
							action: 'update_profile_display_data',
							field : id,
							value : newField.val()
						}, function(e) {
							var response = JSON.parse(e);

							// El cambio es correcto, a limpiar.
							if(response.status === 200) {
								var temp = isTextarea ? helpers.nl2br(newField.val()) : newField.val();
								var field = $('[data-editvalue="' + id + '"]');

								closeFormHandler(form);

								// If there is no new value lets add the placeholder again
								if(temp.length == 0) {
									field.find('span').html(helpers.getProfilePageInputPlaceholders(id)).removeClass('filled');
								}
								else {
									field.find('span').html(temp).addClass('filled');
								}

								toastr["success"]("Field updated successfully!", "Nice!");
							}
						});
					}
				});
			}

			function closeFormHandler(form) {
				// Refrescamos el scroll bar en los textareas
				if(id == 'display_introduction' || id == 'display_question') {
					scrollBars.update($('p[data-editvalue="' + id + '"]')[0]);
				}

				if(form.length) {
					helpers.animateCss(form, 'fadeOut', 0, function() {
						helpers.animateCss(oldField, 'fadeIn', 1, function() {
							form.remove();
						});
					});
				}
			}
		}
	}

	function getTextAreaLenght(value) {
		var lineBreaks = (value.match(/\n/g)||[]).length;
		return (value.length + (lineBreaks * 4));
	}

	function toggle_upload_avatar() {
		$('#avatar_file').click();
	}

	function toggleImageFormLoading() {
		$('#file-toggler').toggleClass('out');
		$('#file-loading').toggleClass('out');
	}

	function close_open_fields(e) {
		if($('#display_social').hasClass('edit')) {
			$(event.target).hasClass('social-icon') || $('.social-network-edit').addClass('out');
		}
	}
}
