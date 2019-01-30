var _        = require('underscore'),
	ajaxCall = require('helpers').ajaxCall,
	resize   = require('helpers').resizeFunctionHandler;

module.exports = function() {
	var wistiaEmbed  = undefined,
		coursesList  = $('#courses-loop'),
		videoBlock   = $('#welcome-video'),
		viewAgainBtn = $('#view-video-again');

	initWistiaEvents();
	initCoursesBackcount()

	viewAgainBtn.on('click', function() {
		$(this).addClass('out');

		videoBlock.removeClass('out');
		coursesList.addClass('out');

		_.delay(function() {
			wistiaEmbed.play();
		}, 1000);
	});

	function initCoursesBackcount() {
		_.each($('article.course-item'), function(course) {
			var item = $(course),
				counterHtml = item.find('.counter strong');
			
			if(item.data('unlock')) {
				var end = new Date(item.data('unlock'));
				var timer;

				var _second = 1000,
					_minute = _second * 60,
					_hour   = _minute * 60,
					_day    = _hour * 24;

				function showRemaining() {
					var now = new Date();
					var distance = end - now;

					if (distance < 0) {
						clearInterval(timer);
						return;
					}

					var days    = Math.floor(distance / _day),
						hours   = Math.floor((distance % _day) / _hour),
						minutes = Math.floor((distance % _hour) / _minute),
						seconds = Math.floor((distance % _minute) / _second);

					counterHtml.find('.d').html(days);
					counterHtml.find('.h').html(hours);
					counterHtml.find('.m').html(minutes);
				}

				timer = setInterval(showRemaining, 1000);
			}
		});
	}

	function initWistiaEvents() {
		wistiaEmbed = Wistia.embed(videoBlock.data('id'));

		wistiaEmbed.ready(function(video) {
			if(!videoBlock.data('userviewed')) {
				$('#welcome-video .video-overlay').addClass('out');

				_.delay(function() {
					wistiaEmbed.play();
				}, 1000);
			}
		});

		wistiaEmbed.bind('end', function(video) {
			videoBlock.addClass('out');
			coursesList.removeClass('out');
			viewAgainBtn.removeClass('out');

			if(videoBlock.data('userviewed')) {
				ajaxCall({action : 'set_welcome_video_viewed', 'video_viewed' : true}, function(data) {
					console.log(data);
				});
			}
		});
	}

	resize(function() {
		var height = $(window).height() - $('#masthead').height();
		$('#welcome-video, #courses-loop').css('height', height);
	});
}