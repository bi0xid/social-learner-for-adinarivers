var $       = jQuery,
	Pikaday = require('pikaday'),
	moment  = require('moment');

module.exports = function() {
	var input = $('#unlock_time');

	var picker = new Pikaday({
		field           : input[0],
		showTime        : true,
		use24hour       : true,
		incrementHourBy : 1,
		format          : 'D MMM YYYY',
		onSelect: function() {
			$('#unlock_time_hidden').attr('value', this.getDate());
			input.val(moment(new Date(this.getDate())).format('D MMMM YYYY - HH:mm'));
		}
	});

	$('#unlock_time_feature').on('change', function() {
		input.prop('disabled', !$(this).is(':checked'));
	});

	if($('#unlock_time_hidden').val().length) {
		var parsedDate = moment(new Date($('#unlock_time_hidden').val())).format('D MMMM YYYY - HH:mm');
		input.val(parsedDate);
	}
}