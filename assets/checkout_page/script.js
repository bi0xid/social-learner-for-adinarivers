var $ = jQuery,
	_ = require('underscore');

$(document).ready(function() {
	// ID's of those products with Installments option
	var InstallmentsIds = [13, 7346];

	// We only want this script to run at the Checkout Page
	if($('body').hasClass('checkout-page')) {
		var productSelection = $('#opc-product-selection'),
			orderReview      = $('#order_review');

		// If we select the Installments option we need to hide some payment methods
		productSelection.find('input[type="radio"]').on('change', function() {
			var itemId = parseInt($(this).val());
			toggleInstallmentsClass(itemId);
		});

		// Let's check the first call if installments option is selected
		var selectedId = productSelection.find('.product-item.selected').find('input[type="radio"]').val();
		selectedId && toggleInstallmentsClass(parseInt(selectedId));

		function toggleInstallmentsClass(id) {
			var hidePayments = _.find(InstallmentsIds, function(installment) {  return installment === id; })
				? true
				: false;

			orderReview.toggleClass('installments', hidePayments);
		};

		$('body').on('updated_checkout', function() {
			// Let's trigger the One Time Payment option by default
			// if there is no selected option
			if(!productSelection.find('input:checked').length) {
				// Si hay mas de un producto seleccionamos el Normal
				if(productSelection.find('.product-item').length > 1) {
					productSelection.find('input[value="7345"]').trigger('click');
				}
				// Si solo hay uno tiramos del Installments
				else {
					productSelection.find('input[value="7346"]').trigger('click');
				}
			}
		});
	}
});
