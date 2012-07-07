(function($) {
	window.StatusView = Backbone.View.extend({
		tagName: 'div',
		className: 'one-third column statusbox',
		
		
		initialize: function() {
			_.bindAll(this, 'render');
			this.template = _.template($('#status-template').html());
			this.loadavg = null;
			this.totalmem = null;
			this.usedmem = null;			
			this.freemem = null;
			this.uptime = null;
			this.version = null;

			this.release = null;
			this.platform = null;
			this.hostname = null;
			this.arch = null;
			this.type = null;
			this.updateTimer = setInterval(this.update, 1000);
		},
    
		render: function() {

			var context = { loadavg: this.loadavg, totalmem: this.totalmem, usedmem: this.usedmem, freemem: this.freemem, 
											uptime: this.uptime, version: this.version, release: this.release, platform: this.platform,
											hostname: this.hostname, arch: this.arch, type: this.type };

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

						window.App.dashboardView.status.loadavg  = result.loadavg[0].toFixed(2);
						window.App.dashboardView.status.totalmem = prettysize(result.totalmem);
						window.App.dashboardView.status.usedmem  = prettysize(result.usedmem);
						window.App.dashboardView.status.freemem  = prettysize(result.freemem);
						window.App.dashboardView.status.uptime   = prettytime(result.uptime);
						window.App.dashboardView.status.version  = result.version;

						window.App.dashboardView.status.release  = result.release;
						window.App.dashboardView.status.platform = result.platform;
						window.App.dashboardView.status.hostname = result.hostname;
						window.App.dashboardView.status.arch     = result.arch;
						window.App.dashboardView.status.type     = result.type;
						window.App.dashboardView.status.render();
					}
				}
			});
		}
	});
})(jQuery);