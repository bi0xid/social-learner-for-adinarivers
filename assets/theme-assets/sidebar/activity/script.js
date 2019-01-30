var helpers = require('helpers');

module.exports = function(container) {
	helpers.initScrollBarPlugin(container.find('ul')[0]);
}