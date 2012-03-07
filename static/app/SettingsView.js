(function($) {
	window.SettingsView = Backbone.View.extend({
		tagName: 'div',
		className: 'settings',
    
		initialize: function() {
			_.bindAll(this, 'render');
			this.template = _.template($('#settings-template').html());
			this.userView = new UsersView();
		},
    
		render: function() {
			var renderedContent = this.template();
			$(this.el).html(renderedContent);
			$(this.el).append($(this.userView.render().el));
			return this;
		}
	});
})(jQuery);