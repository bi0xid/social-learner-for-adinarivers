var _        = require('underscore'),
	helpers  = require('helpers');

module.exports = function(liItem, modal, data, markToDoAsDone) {
	var quizList     = modal.find('.quiz-questions'),
		sectionIntro = modal.find('.section.intro');

	var nonce  = undefined,
		quizId = undefined;

	// Start quiz Handler
	modal.find('.start-quiz').on('click', function() {
		helpers.animateCss(sectionIntro, 'fadeOutLeft', 0, function() {
			sectionIntro.addClass('out');

			// Display the questions block
			quizList.css('position', 'initial');
			helpers.animateCss(quizList, 'fadeIn', 1);

			// Enter the first question
			helpers.animateCss(quizList.find('li.quiz').first(), 'fadeIn', 1, function() {
				quizList.find('li.quiz').first().removeClass('out');
			});

			// Enter the Footer buttons and Progress list
			modal.find('button.next').removeClass('out');
			modal.find('.questions-progress').removeClass('out');
		});
	});

	// Go to Next/Prev Question
	modal.find('button.next, button.prev').on('click', function() {
		var item = $(this);
		var actualQuestion = quizList.find('li.quiz:not(.out)');

		var nextQuestion = item.hasClass('prev')
			? actualQuestion.prev()
			: actualQuestion.next();

		nextQuestion.length && helpers.animateCss(actualQuestion, 'fadeOutLeft', 0, function() {
			updateProgressBar(nextQuestion);

			actualQuestion.addClass('out');
			helpers.animateCss(nextQuestion, 'fadeInRight', 1, function() {
				nextQuestion.removeClass('out');
			});
		});
	});

	// End Quiz Handler
	modal.find('button.end-quiz').on('click', function() {
		$(this).addClass('out').next('.loading').addClass('in');
		endQuizHandler();
	});

	// First quiz start
	initQuiz();

	function initQuiz() {
		modal.find('.quiz-questions, .questions-progress').empty();

		// Get Quiz Data
		helpers.ajaxCall({
			'action'    : 'get_lesson_quiz_questions',
			'lesson_id' : data.lesson_id,
			'quiz_id'   : data.content.quiz
		}, function(e) {
			var parsedData = JSON.parse(e);

			nonce  = parsedData.nonce;
			quizId = parsedData.quiz_id;

			// Render all the questions
			_.each(parsedData.questions, function(question, key) {
				modal.find('.questions-progress').append('<li class="active"><span class="circle"></span></li>');
				modal.find('.quiz-questions').append(question);

				// Only the first question will be ready to display
				if(key != 0) {
					modal.find('.questions-progress li').last().removeClass('active');
				}
			});

			_.defer(function() {
				var questionsList = modal.find('.quiz-questions li.quiz');

				// Enable StarQuiz Button
				modal.find('.start-quiz').removeClass('out');

				// Pagination with Question Progress List
				modal.find('.questions-progress li').on('click', function() {
					var index = $(this).index();

					var actualQuestion = quizList.find('li.quiz:not(.out)'),
						nextQuestion   = quizList.find('li.quiz').eq(index);

					nextQuestion.length && helpers.animateCss(actualQuestion, 'fadeOutLeft', 0, function() {
						updateProgressBar(nextQuestion);

						actualQuestion.addClass('out');
						helpers.animateCss(nextQuestion, 'fadeInRight', 1, function() {
							nextQuestion.removeClass('out');
						});
					});
				});

				_.each(questionsList, function(qu) {
					// Pagination with Enter on Inputs
					$(qu).find('input[type="text"]').on('keyup', function(e) {
						e.keyCode === 13 && nextQuestionHandler($(this).parents('li.quiz'));
					});

					// Pagination on radio button change
					$(qu).find('input[type="radio"]').on('change', function(e) {
						nextQuestionHandler($(this).parents('li.quiz'));
					});
				});


				function nextQuestionHandler(actualQuestion) {
					var nextQuestion = actualQuestion.next();

					nextQuestion.length && helpers.animateCss(actualQuestion, 'fadeOutLeft', 0, function() {
						actualQuestion.addClass('out');
						helpers.animateCss(nextQuestion, 'fadeInRight', 1, function() {
							nextQuestion.removeClass('out');
						});
						updateProgressBar(nextQuestion);
					});
				}
			});
		});
	};

	function endQuizHandler() {
		var questionsList = modal.find('.quiz-questions li.quiz');

		// Lets save all answers and questions ID inside and array
		var results = new Array();
		_.each(questionsList, function(question, key) {
			var q = $(question);

			// Depends on the question type we need to store different values
			switch(q.data('type')) {
				case 'single-line':
					results.push({
						id     : q.find('input[type="hidden"]').val(),
						answer : q.find('.answer input').val()
					});
					break;

				case 'gap-fill':
					results.push({
						id     : q.find('input[type="hidden"]').val(),
						answer : q.find('.gapfill-answer-gap').val()
					});
					break;

				case 'boolean':
					results.push({
						id     : q.find('input[type="hidden"]').val(),
						answer : q.find('.answers input[type="radio"]:checked').val()
					});
					break;

				case 'boolean':
					results.push({
						id     : q.find('input[type="hidden"]').val(),
						answer : q.find('.answers input[type="radio"]:checked').val()
					});
					break;

				case 'multiple-choice':
					var answers = [];
					_.each(q.find('.answers li'), function(li) {
						if($(li).find('input').is(':checked')) {
							answers.push($(li).find('input').val());
						}
					});

					results.push({
						id     : q.find('input[type="hidden"]').val(),
						answer : answers
					});
					break;

				case 'multi-line':
					results.push({
						id     : q.find('input[type="hidden"]').val(),
						answer : q.find('.wp-editor-area').val()
					});
					break;
			}
		});

		// Prepare the AJAX Call
		helpers.ajaxCall({
			'security'     : nonce,
			'quiz_id'      : quizId,
			'quiz_results' : results,
			'todo_id'      : data.task_id,
			'lesson_id'    : data.lesson_id,
			'action'       : 'get_quiz_result'
		}, function(e) {
			var parsedData = JSON.parse(e);

			var notPassedPage = modal.find('.quiz-not-passed'),
				passedPage    = modal.find('.quiz-passed');

			// Remove and clear the Question List container
			helpers.animateCss(modal.find('.quiz-questions'), 'fadeOut', 0, function() {
				modal.find('.quiz-questions, .questions-progress').empty();
				modal.find('.quiz-questions').css('position', 'absolute');

				// Hide here all buttons at footer
				modal.find('button.prev, button.next, button.end-quiz, .questions-progress').addClass('out');
				modal.find('.modal-footer .loading').removeClass('in');

				// Let's show Quiz Passed message
				if(parsedData.quiz_passed) {
					markToDoAsDone(data, liItem);
					passedPage.removeClass('out')
					helpers.animateCss(passedPage, 'fadeInRight', 1);
				}
				// The user did not pass the quiz message
				else {
					notPassedPage.removeClass('out');
					modal.find('.start-quiz').addClass('out');
					helpers.animateCss(notPassedPage, 'fadeInRight', 1, function() {
						// Start quiz on button click
						notPassedPage.find('button').on('click', function() {
							helpers.animateCss(notPassedPage, 'fadeOutLeft', 0, function() {
								// Hide the actual page
								notPassedPage.addClass('out');

								// Show the Intro Section
								sectionIntro.removeClass('out');
								helpers.animateCss(sectionIntro, 'fadeInRight', 1, function() {
									// Init the Quiz
									initQuiz();
								});
							});
						});
					});
				}
			});
		});
	};

	function updateProgressBar(nextQuestion) {
		// If is the last question let's show the Get Result buttons
		var isLastQuestion = nextQuestion.index() == (quizList.find('li.quiz').length - 1);
		modal.find('button.next').toggleClass('out', isLastQuestion);
		modal.find('button.end-quiz').toggleClass('out', !isLastQuestion);

		modal.find('button.prev').toggleClass('out', nextQuestion.index() == 0);
		modal.find('.questions-progress li').removeClass('active');
		modal.find('.questions-progress li').eq(nextQuestion.index()).addClass('active');
	}
};
