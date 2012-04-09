(function($) {
	//create a backbone router to handle page changes
	window.PlugUI = Backbone.Router.extend({
		routes: {
			'/dashboard': 'dashboard',
			'/files': 'files',
			'/settings': 'settings', 
			'/packages': 'packages'
		},
    
		initialize: function() {
			this.dashboardView	= new DashboardView();
			this.authView		= new AuthView();
			this.settingsView	= new SettingsView();
			this.packagesView	= new PackagesView();
			this.filesView		= new FilesView();
			
			
			this.adminBar		= new AdminBar();
			this.mediaBar		= new MediaBar();
			var $adminBarContainer = $('#adminbar');
			$adminBarContainer.append(this.adminBar.render().el);
			$adminBarContainer.append(this.mediaBar.render().el);
			
			
			dispatcher.on("needsAuthentication", function(msg) {
				var $container = $('#content_area');
				$container.empty();
			});
		},
		dashboard: function() {
			if (!window.authenticated == true) return;
			var $container = $('#content_area');
			$container.empty();
			$container.append(this.dashboardView.render().el);
			this.adminBar.dashboard();
		},
		settings: function() {
			if (!window.authenticated == true) return;
			var $container = $('#content_area');
			$container.empty();
			$container.append(this.settingsView.render().el);
			this.adminBar.settings();
		},
		packages: function() {
			if (!window.authenticated == true) return;
			var $container = $('#content_area');
			$container.empty();
			$container.append(this.packagesView.render().el);
			this.adminBar.packages();
		},
		files: function() {
			if (!window.authenticated == true) return;
			var $container = $('#content_area');
			$container.empty();
			$container.append(this.filesView.render().el);
			this.adminBar.files();
		},
		authenticate: function login() {
			console.log("Login");
			var username    = $('#usernamefield').attr('value');
			var password	= $('#passwordfield').attr('value');

			if (username == "") {  
				console.log("No username");        
				$("#usernamefield").focus();  
				return false;  
			} 	
			if (password == "") {  
				console.log("No password");        
				$("#passwordfield").focus();  
				return false;  
			} 
	
	
			$.ajax({
				type: "POST",
				url: "/api/auth",
				dataType : 'json',
				data: { apicmd: "login", "username": username, "password": password },
				success: function(json){
					console.log("Login request succeeded");
					if (json.authenticated == true) {
						window.username = json.username;
						window.authenticated = true;
						console.log("Login request succeeded");
						window.App.navigate("/#/dashboard", {trigger: true});
						dispatcher.trigger("didAuthenticate", null);
					}
					else {
						console.log("Login failed");
						$('#login_error').text("Login failed");
						//dispatcher.trigger("needsAuthentication", null);

					}


				
				}
			});
		},
		logout: function() {
			console.log("Destroying session");
			$.ajax({
				type: "POST",
				url: "/api/auth",
				dataType : 'json',
				data: { apicmd: "logout" },
				success: function(json){
					if (json.success == true) {
						window.username = null;
						window.authenticated = false;
						window.App.navigate("", {trigger: true});
						dispatcher.trigger("needsAuthentication", null);
					}
				}
			});
		},
		checkin: function() {
			console.log("Getting auth status from server");
			$.ajax({
				type: "POST",
				url: "/api/auth",
				dataType : 'json',
				data: { apicmd: "check" },
				success: function(json){
					if (json.authenticated == true) {
						window.username = json.username;
						window.authenticated = true;
						console.log("Already authenticated");
						window.App.navigate("/#/dashboard", {trigger: true});
						dispatcher.trigger("didAuthenticate", null);
					}
					else {
						dispatcher.trigger("needsAuthentication", null);
					}
					console.log('firing event after auth check');
					
				
				}
			});
		}
		
	});
})(jQuery);