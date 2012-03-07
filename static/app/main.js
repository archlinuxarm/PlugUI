/*
 * PlugUI client frontend
 * Copyright © 2012 Stephen Oliver <mrsteveman1@gmail.com>
 */
	window.authenticated = false;
	window.username = null;
	
	var dispatcher = _.clone(Backbone.Events);

(function($) {

	
	$(function() {
		console.log('creating app');

		window.App = new PlugUI;

		window.App.checkin();
		Backbone.history.start();
	});
	
})(jQuery);