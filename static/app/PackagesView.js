(function($) {
	window.PackagesView = Backbone.View.extend({
		tagName: 'div',
		className: 'one-third column statusbox',
    
		initialize: function() {
			_.bindAll(this, 'render');
			this.template = _.template($('#packages-template').html());
			this.collection	= new Packages();
			this.collection.bind('reset', this.render);
			
			var lthis = this;
			dispatcher.on("didAuthenticate", function(msg) {
				console.log('Packages view firing authenticated event');
				lthis.fetch();
			});
			dispatcher.on("needsAuthentication", function(msg) {
				console.log('Packages view firing deauthenticated event');
				lthis.collection.reset();
			});
		},
    
		render: function() {
			var renderedContent = this.template();
			$(this.el).html(renderedContent);
      
			var lthis = this;
			console.log('Packages view rendering');

			this.collection.each(function(package) {

				var li = document.createElement('li');
				li.setAttribute('class','package-item');
				var text = document.createTextNode(package.get('name'));
				li.appendChild(text);
				
				lthis.$('#installed-packages').append(li);
			});

			return this;
		},
		fetch: function() {
			console.log('getting packages from server');
			var lthis = this;
			$.ajax({
				type: 'POST',
				cache: false,
				url : '/api/pacman',
				data: { apicmd: "list_installed_packages" },
				dataType : 'json',
				success: function (json) { 
					var response = json;
					if (response.success == true) {
						lthis.collection.reset(response.installedpackages);
					}
				}
			});
		}
	});	
})(jQuery);