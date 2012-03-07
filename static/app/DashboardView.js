(function($) {

	window.DashboardView = Backbone.View.extend({
		tagName:	'div',
		className:	'dashboard',
    
		initialize: function() {
			_.bindAll(this, 'render');
			this.status = new StatusView({ });
			//this.packageView = new PackagesView({});
		},
    
		render: function() {
			console.log('Render dashboard');
			if (window.authenticated == false) {
				$(this.el).html('');
			}
			else {

				//$(this.el).append($(this.packageView.render().el));
				$(this.el).append($(this.status.render().el));
			}
			return this;
		}
	});
})(jQuery);