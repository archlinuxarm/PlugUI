(function($) {
	window.MediaBar = Backbone.View.extend({
		tagName: 'div',
		idName: 'controls',
		className: 'inset',
		
		initialize: function() {
			_.bindAll(this, 'render');
			this.template = _.template($('#mediabar-template').html());
		},
    
		render: function() {
			var renderedContent = this.template();
			$(this.el).html(renderedContent);
      
			return this;
		}
	});	
})(jQuery);