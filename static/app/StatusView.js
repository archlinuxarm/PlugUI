(function($) {
	window.StatusView = Backbone.View.extend({
		tagName: 'div',
		className: 'one-third column statusbox',
		
		
		initialize: function() {
			_.bindAll(this, 'render');
			this.template = _.template($('#status-template').html());
			this.loadavg = null;
			this.memused = null;
			this.updateTimer = setInterval(this.update, 1000);
		},
    
		render: function() {

			var context = { loadavg: this.loadavg, memused: this.memused   };

			var renderedContent = this.template(context);
			$(this.el).html(renderedContent);
      
			return this;
		},
	
		update: function() {
			if (!window.authenticated == true) return;
			$.ajax({
				type: "POST",
				url: "/api/status",
				dataType : 'json',
				success: function(json){
					var result = json;
					if (result.success == true) {

						window.App.dashboardView.status.loadavg = result.loadavg[0].toFixed(1);
						window.App.dashboardView.status.memused = prettysize(result.memused);
						window.App.dashboardView.status.render();
					}
				}
			});
		}
	});
})(jQuery);