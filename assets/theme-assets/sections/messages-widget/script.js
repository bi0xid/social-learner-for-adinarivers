var helpers = require('helpers'),
	_       = require('underscore');

require('../../../plugins/jquery.visible.js');

module.exports = self = {
	isNewThread  : false,
	threadId     : undefined,
	container    : $('#messages-header-content'),
	loading      : $('#messages-header-content').find('.center-icon'),
	headerHeight : $('#masthead').visible() ? $('#masthead').height() : 0,

	init: function() {
		helpers.initHandleBarsHelpers();
		helpers.scrollFunctionHandler(function() {
			self.container.toggleClass('no-header', !$('#masthead').visible());
			self.headerHeight = $('#masthead').visible() ? $('#masthead').height() : 0;
		});
		helpers.resizeFunctionHandler(function() {
			var height = $('#fixed-footer').length
				? $(window).height() - self.headerHeight - $('#fixed-footer').height()
				: $(window).height() - self.headerHeight;

			if($(window).width() <= 800) {
				self.container.css('height', height);
			}
		});

		self.initChatList();

		// Interval of 30 seconds to check for new messages
		setInterval(function() {
			self.checkForNewMessages();
		}, 30000);
	},

	initChatList: function() {
		self.container.find('.wrapper').append('<ul class="chat-list"></ul>');
		var chatList = self.container.find('.chat-list');

		self.checkForNewMessages();

		helpers.ajaxCall({'action' : 'get_chat_list'}, onAjaxDone);

		function onAjaxDone(data) {
			var noMoreMessages = true;
			_.each(JSON.parse(data), function(msg) {
				var template = require('./templates/chat-list-item.hbs');
				var msgHtml  = template({ data : msg });

				if(!msg.is_deleted) {
					noMoreMessages = false;
				}

				chatList.append(msgHtml);

				// Open chat handler
				chatList.find('li[data-id="' + msg.id + '"]').on('click', function(e) {
					self.loading.removeClass('out');
					helpers.animateCss(chatList, 'fadeOutLeft', 0, function() {
						self.initChatView(e, msg);
					});
				});
			});

			if(noMoreMessages) {
				chatList.append('<li class="no-more"><span>You do not have any conversations open</span></li>');
			}

			helpers.initScrollBarPlugin(chatList[0]);

			_.defer(function() {
				self.loading.addClass('out');
				helpers.animateCss(chatList, 'fadeInRight', 1);

				var messagesCount = 0;
				_.each(JSON.parse(data), function(item) {
					if(!item.is_deleted) { messagesCount++; };
				});

				if(noMoreMessages) { messagesCount = 1; };

				var height = $('#fixed-footer').length
					? $(window).height() - self.headerHeight - $('#fixed-footer').height()
					: $(window).height() - self.headerHeight;

				$(window).width() >= 800 && self.container.css('height', (80 * messagesCount));
				$(window).width() >= 800 || self.container.css('height', height);
			});
		}
	},

	initChatView: function(e, senderData, id) {
		self.removeChatList();
		self.checkForNewMessages();

		self.container.find('.wrapper').append('<div class="chat-view"></div>');
		var chatView = self.container.find('.chat-view');
		var id = e ? $(e.currentTarget).data('id') : id;

		helpers.ajaxCall({'action': 'get_chat_view', data: id}, onAjaxDone);

		function onAjaxDone(data) {
			self.checkForNewMessages();

			var parsedData = JSON.parse(data);
			var chatHeaderTemplate = require('./templates/chat-header.hbs');

			chatView.append(chatHeaderTemplate({ data : senderData })).append('<ul class="chat-body"></ul>');

			// Go back to the chat list
			self.appendGoBackHandler(chatView);
			self.appendRemoveChatHandler(chatView, id);

			_.each(parsedData.mensajes, function(msg) {
				var isLastMsgSameSender = chatView.find('.chat-body li:last-of-type').data('sender') == msg.sender_id;

				if(isLastMsgSameSender) {
					chatView.find('.chat-body li:last-of-type .content').append('<br>' + msg.message);
				}
				else {
					var msgTemplate = require('./templates/chat-msg-body.hbs');

					chatView.find('.chat-body').append(msgTemplate({
						response  : false,
						message   : msg.message,
						sender_id : msg.sender_id,
						avatar    : msg.sender_avatar,
						user_id   : parsedData.user_id
					}));
				}
			});

			helpers.initScrollBarPlugin($('.chat-body')[0]);

			var formTemplate = require('./templates/chat-form.hbs');
			chatView.append(formTemplate({ data : parsedData.form[0] }));

			_.defer(function() {
				self.loading.addClass('out');
				helpers.animateCss(chatView, 'fadeInRight', 1);

				helpers.resizeFunctionHandler(function() {
					if($(window).width() <= 800) {
						var aboveFold = $('#fixed-footer').length
							? $(window).height() - self.headerHeight - $('#fixed-footer').height()
							: $(window).height() - self.headerHeight;

						self.container.css('height', aboveFold);
						chatView.find('.chat-body').css('height', aboveFold - 30 - (chatView.find('.chat-header').height() + chatView.find('#send-reply').height()));
					}
					else {
						chatView.find('.chat-body').css('height', 270 - (chatView.find('.chat-header').height() + chatView.find('#send-reply').height()));
						self.container.css('height', '300px');
					}
				});

				self.scrollChatToBottom();
			})

			self.sendNewMessageHandler(chatView, false);
		}
	},

	createNewThread: function(userId, senderData) {
		self.removeChatList();
		self.checkForNewMessages();

		self.container.find('.wrapper').append('<div class="chat-view"></div>');
		var chatView = self.container.find('.chat-view');

		var chatHeaderTemplate = require('./templates/chat-header.hbs');
		chatView.append(chatHeaderTemplate({ data : senderData, new : true })).append('<ul class="chat-body"></ul>');

		_.defer(function() {
			// Go back to the chat list
			self.appendGoBackHandler(chatView);
			self.appendRemoveChatHandler(chatView);

			helpers.ajaxCall({
				action   : 'get_form_msg',
				new_chat : true
			}, function(e) {
				var response = JSON.parse(e);

				if(response.status == 200) {
					onFormAjaxCall(response.form);
				}
			})
		});

		function onFormAjaxCall(formData) {
			helpers.initScrollBarPlugin($('.chat-body')[0]);

			var formTemplate = require('./templates/chat-form.hbs');
			chatView.append(formTemplate({ data : formData }));

			_.defer(function() {
				helpers.animateCss(chatView, 'fadeInRight', 1);

				helpers.resizeFunctionHandler(function() {
					if($(window).width() <= 800) {
						var aboveFold = $('#fixed-footer').length
							? $(window).height() - self.headerHeight - $('#fixed-footer').height()
							: $(window).height() - self.headerHeight;

						self.container.css('height', aboveFold);
						chatView.find('.chat-body').css('height', aboveFold - 30 - (chatView.find('.chat-header').height() + chatView.find('#send-reply').height()));
					}
					else {
						chatView.find('.chat-body').css('height', 270 - (chatView.find('.chat-header').height() + chatView.find('#send-reply').height()));
						self.container.css('height', '300px');
					}
				});

				self.scrollChatToBottom();
				self.sendNewMessageHandler(chatView, true, userId);
			});
		}
	},

	sendNewMessageHandler: function(chatView, newThread, userId) {
		var sendMessageReplyOnce = _.debounce(sendMessageReply, 300);
		self.isNewThread = newThread;

		// Send message functions
		$('#message_content').keypress(function(e) {
			if(e.keyCode == 13) {
				sendMessageReplyOnce();
				e.preventDefault();
			}
		});

		$('#send-reply').on('submit', function(e) {
			e.preventDefault();
			sendMessageReplyOnce();
		});

		function sendMessageReply() {
			var form = $('#send-reply');

			var randomId = helpers.generateRandomId();

			var newMsg   = form.find('#message_content').val().replace(/\n/g, ' ');
			var msgSpan  = '<span data-id="' + randomId + '" class="sending">' + newMsg + '</span>';

			appendMessage(msgSpan);
			self.scrollChatToBottom();
			form.find('#message_content').val('');

			// First Ajax call to send the Message
			var onAjaxDoneFormPartial = _.partial(onAjaxDoneForm, randomId, newMsg);
			
			if(self.isNewThread) {
				helpers.ajaxCall({
					user     : userId,
					content  : newMsg,
					action   : 'new_msg_thread',
					_wpnonce : form.find('#send_message_nonce').val()
				}, onAjaxDoneFormPartial);
			}
			else {
				helpers.ajaxCall({
					'content'  : newMsg,
					'action'   : 'messages_send_reply',
					'_wpnonce' : form.find('#send_message_nonce').val(),
					'thread_id': self.threadId ? self.threadId : form.find('#thread_id').val()
				}, onAjaxDoneFormPartial);
			}

			function onAjaxDoneForm(messageId, newMsg, response) {
				if(self.isNewThread) {
					self.isNewThread = false;
					self.threadId = JSON.parse(response);
				}

				// If there is an error lets give the uset the chance to resend
				else if(response[0] + response[1] === '-1') {
					var msg = $('#messages-header-content .chat-body .sending[data-id="' + messageId + '"]');
					msg.append('<i class="fa fa-exclamation-triangle" aria-hidden="true"></i>');
					msg.removeClass('sending').addClass('error');

					msg.find('.fa').on('click', function(e) {
						helpers.ajaxCall({
							'content'  : newMsg,
							'action'   : 'messages_send_reply',
							'thread_id': form.find('#thread_id').val(),
							'_wpnonce' : form.find('#send_message_nonce').val()
						}, resendCallback);

						function resendCallback(response) {
							// If there is an error again nothing happens
							if(response[0] + response[1] === '-1') {
								return;
							}
							// The message gets send properly, lets remove the error msg
							else {
								msg.remove();
								chatView.find('.chat-body li:last-of-type .content br').last().remove();
								appendMessage(newMsg);
							}
						}
					});
				}
			}

			function appendMessage(msgSpan) {
				if(chatView.find('.chat-body li:last-of-type').hasClass('self')) {
					chatView.find('.chat-body li:last-of-type .content').append('<br>' + msgSpan);
				}
				else {
					var template = require('./templates/chat-msg-body.hbs');
					chatView.find('.chat-body').append(template({
						response  : true,
						message   : msgSpan,
						user_id   : $('#send-reply').data('currentuser'),
						sender_id : chatView.find('.chat-body li:last-of-type').data('sender')
					}));
				}
			}
		}
	},

	checkForNewMessages: function() {
		helpers.ajaxCall({'action' : 'check_new_msg'}, function(result) {
			if(result > 0) {
				$('#messages-header-toggler').append('<div class="circle"><span>' + result + '</span></div>');
			}
			else {
				$('#messages-header-toggler .circle').remove();
			}
		});
	},

	scrollChatToBottom: function() {
		var d = $('.chat-body');
		d.scrollTop(d.prop("scrollHeight"));
	},

	appendGoBackHandler: function(chatView) {
		chatView.find('.chat-header .go-back').on('click', function() {
			self.loading.removeClass('out');
			helpers.animateCss(chatView, 'fadeOutLeft', 0, function() {
				self.initChatList();
				self.removeChatView();
			});
		});
	},

	appendRemoveChatHandler: function(chatView, threadId) {
		chatView.find('.chat-header .remove-chat').on('click', function() {
			// Si no hay threadId solo quitamos la ventana del chat
			if(!threadId) {
				goBackHandler();
			}
			// De lo contrario hacemos la llamada AJAX
			else {
				helpers.ajaxCall({
					threadId : threadId,
					action   : 'remove_thread_ajax',
				}, function(status) {
					status && goBackHandler();
				});
			}
		});

		function goBackHandler() {
			self.loading.removeClass('out');
			helpers.animateCss(chatView, 'fadeOutLeft', 0, function() {
				self.initChatList();
				self.removeChatView();
			});
		}
	},

	removeChatView: function() {
		$('#masthead').find('.chat-view').remove();
	},

	removeChatList: function() {
		$('#masthead').find('.chat-list').remove();
	}
}
