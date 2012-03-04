/*
 * PlugUI client frontend
 * Copyright © 2012 Stephen Oliver <mrsteveman1@gmail.com>
 */


(function($) {
	
	window.authenticated = false;
	window.username = null;
	
	var dispatcher = _.clone(Backbone.Events);

	/*
	
		Models and Collections for the file browser 
		
	*/
	
	window.File = Backbone.Model.extend({
		defaults: {
			fullpath: null,
			extension: null,
			directory: null,
			isFolder: false,
			name: null,
			size: null,
			type: null
        },
		initialize: function(){
            //
			console.log('creating new file');
			
        }
	});
  
	window.Files = Backbone.Collection.extend({
		initialize: function(){
            //
			console.log('creating new file collection');
			
        },
		model: File,
		comparator: function(file) {
			return file.get("name").toLowerCase();
		}
	});
	
	
	/* 
	
		Views 
		
	*/
	
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
	
	window.AuthView = Backbone.View.extend({
		tagName: 'div',
		className: 'authpanel',
    
		initialize: function() {
			_.bindAll(this, 'render');
			this.loginTemplate = _.template($('#login-template').html());
			this.authTemplate = _.template($('#auth-template').html());

			this.visible = false;
			
			dispatcher.on("didAuthenticate", function(msg) {
				window.App.authView.hideAuth();
			});
			dispatcher.on("needsAuthentication", function(msg) {
				window.App.authView.showAuth();
			});

    
		},
		events: {
            "click #loginbutton": "login",
			"click #logoutbutton": "logout",

			"click #cancelbutton": "toggle"
        },
		login: function() {
			window.App.authenticate();
		}, 
		logout: function() {
			console.log('logging out');
			window.App.logout();
		}, 
		hideAuth: function() {
			if (this.visible == true) {
				console.log("removing login popup");
				$('#userbutton').removeClass('selected'); 
				this.visible = false;
				$(this.el).remove();
			}
		},
		showAuth: function() {
			if (this.visible == false) {
				console.log("adding login popup");
				var $container = $('body');
				$container.append(this.render().el);
				$('#userbutton').addClass('selected');
				this.visible = true;
			}
		},
		toggle: function () {
			if (this.visible == true) {
				this.hideAuth();
			}
			else {
				this.showAuth();
			}
		
			
			
		
		},
		render: function() {

			
			if (window.authenticated == false) {
				var renderedContent = this.loginTemplate();
				$(this.el).html(renderedContent);
			}
			else {
				var renderedContent = this.authTemplate();
				$(this.el).html(renderedContent);
			}
			return this;
		}
	});	
	
	window.AdminBar = Backbone.View.extend({
		tagName: 'ul',
		className: 'gradient',
    
		initialize: function() {
			_.bindAll(this, 'render');
			this.template = _.template($('#adminbar-template').html());
		},
		events: {
            "click #controlbutton": "reveal",
			"click #dashboard-button": "dashboard",
			"click #files-button": "files",
			"click #packages-button": "packages",
			"click #settings-button": "settings"
        },
		dashboard: function() {
			if (!window.authenticated == true) return;
			$('.adminbutton').removeClass('selected'); 
			$('#dashboard-button').addClass('selected'); 
		},
		files: function() {
			if (!window.authenticated == true) return;
			$('.adminbutton').removeClass('selected'); 
			$('#files-button').addClass('selected');
		},
		packages: function() {
			if (!window.authenticated == true) return;
			$('.adminbutton').removeClass('selected'); 
			$('#packages-button').addClass('selected');
		},
		settings: function() {
			if (!window.authenticated == true) return;
			$('.adminbutton').removeClass('selected'); 
			$('#settings-button').addClass('selected');
		},
        reveal: function () {
			if ($("div.inset").is(":hidden")) {
				if (!window.authenticated == true) return;
				$('#controlbutton').addClass('selected');
				$("div.inset").slideDown({
					duration:500,
					easing:"swing",
					complete:function(){
					//alert("complete!");
					}
				});
			} else {
				$('#controlbutton').removeClass('selected');

				$("div.inset").slideUp({
					duration:500,
					easing:"swing",
					complete:function(){
					//alert("complete!");
					}
				});
			}            
			
			
			
        },
		render: function() {
			var renderedContent = this.template();
			$(this.el).html(renderedContent);
      
			return this;
		}
	});		
	
	
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
	
	window.FileItemView = Backbone.View.extend({
		tagName: 'tr',
		className: 'line',
    
		initialize: function() {
			_.bindAll(this, 'render');
		},
    
		render: function() {
			var item = this.model;
			
			
			
			var fileline = this.el;


			fileline.onclick = function(){ 
				$('#filename').text(item.get('name'));
				
				if (item.get('isFolder') == true ) {
					$('#filetype').text("Folder");
				}
				else {
					var filetype = window.fileMap[item.get('type')];
					if (!filetype) filetype = "Unknown";
					$('#filetype').text(filetype);
				}
				
				var bytes = item.get('size');
				
				$('#filesize').text(prettysize(bytes));

				
				
				
				$('#filedate').text(item.get('date'));

				if (item.get('isFolder') == true) {
	
				}
				else {

				}
				$('.line').removeClass('highlightRow'); 
				$(fileline).addClass('highlightRow'); 
			};
			
			
				
			
			//create an icon for the file listing and add it to the line
			var icon = document.createElement("td");
			icon.setAttribute('class', 'icon file ' + item.get('type'));
			fileline.appendChild(icon);




			//create an element to hold the name of the file and add it to the line
			var name = document.createElement("td");
			name.setAttribute('class', 'name');
			name.setAttribute('valign', 'middle');
			
			var link = document.createElement('span');
			var text = document.createTextNode(item.get('name'));

			link.onclick = function(){ 
				if (item.get('isFolder') == true) {
					window.App.filesView.getTree(item.get('name'),false);
				}
				else {
		
				}	
				return false 
			};
			
			
			link.appendChild(text);
			name.appendChild(link);


			
			
			fileline.appendChild(name);
						
			var tools = document.createElement("td");
				tools.setAttribute('class', 'file-toolbar');
				tools.setAttribute('valign', 'middle');
							
			// these are download, view, share links, not currently ported into the node backend yet
			if ( item.get('isFolder') == false ) {
			
				var downloadlink = document.createElement("span");
				downloadlink.setAttribute('class', 'file-toolbar-button');
				downloadlink.setAttribute('title', 'Download file');
				downloadlink.onclick = function(){ downloadFile(item);return false };
				var text = document.createTextNode("D");
				downloadlink.appendChild(text);
				tools.appendChild(downloadlink);


				var sharelink = document.createElement("span");
				sharelink.setAttribute('class', 'file-toolbar-button');
				sharelink.setAttribute('title', 'Share file');
				sharelink.onclick = function(){ shareFile(item);return false };
				var text = document.createTextNode("S");
				sharelink.appendChild(text);
				tools.appendChild(sharelink);

				var viewlink = document.createElement("span");
				viewlink.setAttribute('class', 'file-toolbar-button');
				viewlink.setAttribute('title', 'View file (if possible)');
				viewlink.onclick = function(){ viewFile(item);return false };
				var text = document.createTextNode("V");
				viewlink.appendChild(text);
				tools.appendChild(viewlink);

			}
			fileline.appendChild(tools);
			return this;
		}
	});	


  
	window.FilesView = Backbone.View.extend({
		tagName: 'div',
		idName: 'filelist',
    
		initialize: function() {
			console.log('new files view');
			_.bindAll(this, 'render');
			this.template = _.template($('#files-template').html());
			this.directory = '';

			this.collection = new Files();
			
			this.collection.bind('reset', this.render);
			
			dispatcher.on("didAuthenticate", function(msg) {
				console.log('authenticated, getting new file tree');
				window.App.filesView.getTree('',false);
			});
		},
		getTree: function(newdir,previous) {
			console.log('getting tree with: ' + newdir);
			var directory_array = this.directory.split("/");
			if (previous == true) {
				directory_array.pop();
			}
			else {
				directory_array.push(newdir);
			}
			var newpath = directory_array.join("/");
					
			showloader();
			$.ajax({
				type: 'POST',
				cache: false,
				url : '/api/files',
				data: { apicmd: "directory_list", path: newpath },
				dataType : 'json',
				success: function (json) { 
					var response = json;
					if (response.success == true) {
						window.App.filesView.directory = newpath;
						window.App.filesView.collection.reset(response.files);
						
					}
					hideloader();
				}
			});
		},		
		render: function() {
			console.log('rendering files view');
			var collection = this.collection;
			
			$(this.el).html(this.template({}));

			
			
			var $filelist = this.$('#filelist');
			
			
		
			
			var headerline = document.createElement("tr");
			headerline.setAttribute('class', 'line');
			headerline.setAttribute('id', 'fileheader');
		   
			var icon = document.createElement("td");
			icon.setAttribute('class', 'icon');
			
			var image = document.createElement('div');
			image.setAttribute('id', 'loader');

			icon.appendChild(image);
			headerline.appendChild(icon);
			
			
			
			var name = document.createElement("td");
			name.setAttribute('class', 'name');
			name.setAttribute('id', 'currentpath');
			name.setAttribute('valign', 'middle');
			$(name).text("/media" + this.directory);
			headerline.appendChild(name);
			
			
			var tools = document.createElement("td");
			tools.setAttribute('class', 'file-toolbar');
			tools.setAttribute('valign', 'middle');
							
			headerline.appendChild(tools);
			
			
			
			
			$filelist.append(headerline);
			
			
			
			
			var parentdirline = document.createElement("tr");
			parentdirline.setAttribute('class', 'line');
		   
			var icon = document.createElement("td");
			icon.setAttribute('class', 'icon parentdir');
			parentdirline.appendChild(icon);
			
			
			
					
			var name = document.createElement("td");
			name.setAttribute('class', 'name');
			name.setAttribute('valign', 'middle');
			
			
			var parentlink = document.createElement('span');
			var parenttext = document.createTextNode("Parent Directory");
			
			parentlink.onclick = function() { 
				window.App.filesView.getTree('',true);
				return false 
			};
			
			parentlink.appendChild(parenttext);
			name.appendChild(parentlink);

			parentdirline.appendChild(name);
					
					
					
			//append the parent directory link to the list		
			$filelist.append(parentdirline);
			
			collection.each(function(file) {
				var view = new FileItemView({
					model: file,
					collection: collection
				});

				$filelist.append($(view.render().el));
			});
			return this;
		}
	});
	
	

	
	

  
	
	
	
	window.PackagesView = Backbone.View.extend({
		tagName: 'div',
		className: 'packages',
    
		initialize: function() {
			_.bindAll(this, 'render');
			this.template = _.template($('#packages-template').html());
		},
    
		render: function() {
			var renderedContent = this.template();
			$(this.el).html(renderedContent);
      
			return this;
		}
	});	
	
		
	window.SettingsView = Backbone.View.extend({
		tagName: 'div',
		className: 'settings',
    
		initialize: function() {
			_.bindAll(this, 'render');
			this.template = _.template($('#settings-template').html());
		},
    
		render: function() {
			var renderedContent = this.template();
			$(this.el).html(renderedContent);
      
			return this;
		}
	});
	
	
	
	
	
	window.DashboardView = Backbone.View.extend({
		tagName:	'div',
		className:	'dashboard',
    
		initialize: function() {
			_.bindAll(this, 'render');
			this.template = _.template($('#dashboard-template').html());
			this.status = new StatusView({ });
		},
    
		render: function() {
			console.log('render dashboard');
			var renderedContent = this.template();
			$(this.el).html(renderedContent);
			$(this.el).append($(this.status.render().el));
			return this;
		}
	});
	
	
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
			
			this.notificationBar = new NotificationBar();
			
			var $notificationBarContainer = $('#notificationbar');
			$notificationBarContainer.append(this.notificationBar.render().el);
			
			
			this.adminBar		= new AdminBar();
			this.mediaBar		= new MediaBar();
			var $adminBarContainer = $('#adminbar');
			$adminBarContainer.append(this.adminBar.render().el);
			$adminBarContainer.append(this.mediaBar.render().el);
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
  
	// fire everything off
	$(function() {
		console.log('creating app');

		window.App = new PlugUI;

		window.App.checkin();
		Backbone.history.start();
	});
	
})(jQuery);