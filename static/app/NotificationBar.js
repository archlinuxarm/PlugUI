(function($) {
	window.NotificationBar = Backbone.View.extend({
		tagName: 'ul',
		className: 'gradient',
		
		initialize: function() {
			_.bindAll(this, 'render');
			this.template = _.template($('#notificationbar-template').html());
			dispatcher.on("didAuthenticate", function(msg) {
				window.App.notificationBar.render();
			});
			dispatcher.on("needsAuthentication", function(msg) {
				window.App.notificationBar.render();
			});
		},
		events: {
            "click #userbutton": "reveal"
        },
		reveal: function() {
			window.App.authView.toggle();
		}, 
		render: function() {
			console.log('rendering notification bar');
			var renderedContent = this.template();
			$(this.el).html(renderedContent);      
			return this;
		}
	});	
})(jQuery);