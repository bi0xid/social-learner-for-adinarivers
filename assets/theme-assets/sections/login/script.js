var _      = require('underscore'),
	helper = require('helpers');

module.exports = function() {
	var recoverForm = $('.recover-form'),
		loginForm   = $('.login-form');

	setInputPlaceHolders();

	$('.view-login-form').on('click', function(e) {
		e.preventDefault();

		helper.animateCss(recoverForm.find('.animated-content'), 'fadeOutLeft', 0, function() {
			helper.animateCss(loginForm.find('.animated-content'), 'fadeInRight', 1);

			recoverForm.css('pointer-events', 'none');
			loginForm.css('pointer-events', 'all');
		});
	});

	$('.recover-pass').on('click', function(e) {
		e.preventDefault();

		helper.animateCss(loginForm.find('.animated-content'), 'fadeOutLeft', 0, function() {
			helper.animateCss(recoverForm.find('.animated-content'), 'fadeInRight', 1);

			recoverForm.css('pointer-events', 'all');
			loginForm.css('pointer-events', 'none');
		});
	});

	// Validación Login Form
	$('#loginform').on('submit', function(e) {
		if(!checkIfAllFieldsAreReady(['#user_login', '#user_pass'])) {
			e.preventDefault();
		}
	});

	// Validación de Recover Form
	$('.wp-user-form').on('submit', function(e) {
		if(!checkIfAllFieldsAreReady(['.user_login_recover'])) {
			e.preventDefault();
		}
	});

	$('#user_login, #user_pass, #user_login_recover').keydown(function() {
		validateInput($(this));
	});

	var validateInput = _.debounce(function(element) {
		element.toggleClass('error', element.val().length <= 0);
	}, 300);

	function checkIfAllFieldsAreReady(fields) {
		var result = true;
		_.each(fields, function(field) {
			if($(field).val().length == 0) {
				result = false;
				$(field).addClass('error');
			}
		});
		return result;
	}

	function setInputPlaceHolders() {
		_.each($('#loginform p'), function(input) {
			var label = $(input).find('label');
			if(label.length) {
				$(input).find('input').attr('placeholder', label.html());
			}
		})
	};
}