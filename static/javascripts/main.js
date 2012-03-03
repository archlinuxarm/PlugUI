(function($) {
	
	
	

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
	
	window.LoginView = Backbone.View.extend({
		tagName: 'div',
		className: 'login',
    
		initialize: function() {
			_.bindAll(this, 'render');
			this.template = _.template($('#login-template').html());
		},
    
		render: function() {
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
			console.log('new file item view');
		},
    
		render: function() {
			console.log('render file item view');
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
				$('#filesize').text(item.get('size'));
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
			icon.setAttribute('class', 'icon ' + item.get('type'));
			fileline.appendChild(icon);




			//create an element to hold the name of the file and add it to the line
			var name = document.createElement("td");
			name.setAttribute('class', 'name');
			name.setAttribute('valign', 'middle');
			
			var link = document.createElement('span');
			var text = document.createTextNode(item.get('name'));

			link.onclick = function(){ 
				if (item.get('isFolder') == true) {
			
					var directory_array = window.App.filesView.directory.split("/");
					directory_array.push(item.get('name'));
					var newdir = directory_array.join("/");
					window.App.filesView.directory = newdir;
					window.App.filesView.getTree();
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
				downloadlink.onclick = function(){ downloadFile(item);return false };
				var text = document.createTextNode("D");
				downloadlink.appendChild(text);
				tools.appendChild(downloadlink);


				var sharelink = document.createElement("span");
				sharelink.onclick = function(){ shareFile(item);return false };
				var text = document.createTextNode("S");
				sharelink.appendChild(text);
				tools.appendChild(sharelink);

				var viewlink = document.createElement("span");
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
			
			console.log('Files: ' + this.collection);
			this.collection.bind('reset', this.render);
			this.getTree();
		},
		getTree: function() {
			console.log('getting tree');
			showloader();
			$.ajax({
				type: 'POST',
				cache: false,
				url : '/api/files',
				data: { apicmd: "directory_list", path: this.directory },
				dataType : 'json',
				success: function (json) { 
					var response = json;
					console.log("Response: " + response);
					if (response.success == true) {
						console.log(window.App.filesView.collection);
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
		   
			var icon = document.createElement("td");
			
			
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
			
				var directory_array = window.App.filesView.directory.split("/");
				directory_array.pop();
				var newdir = directory_array.join("/");
				window.App.filesView.directory = newdir;
				window.App.filesView.getTree();
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
		tagName: 'div',
		className: 'dashboard',
    
		initialize: function() {
			_.bindAll(this, 'render');
			this.template = _.template($('#dashboard-template').html());
		},
    
		render: function() {
			var renderedContent = this.template();
			$(this.el).html(renderedContent);
      
			return this;
		}
	});
	
	
	//create a backbone router to handle page changes
	window.PlugUI = Backbone.Router.extend({
		routes: {
			'': 'dashboard',
			'/dashboard': 'dashboard',
			'/files': 'files',
			'/settings': 'settings', 
			'/packages': 'packages',
			'/login': 'login'
		},
    
		initialize: function() {
			this.authenticated = false;
			this.dashboardView	= new DashboardView();
			this.loginView		= new LoginView();
			this.settingsView	= new SettingsView();
			this.packagesView	= new PackagesView();
			this.filesView		= new FilesView();
		},
		dashboard: function() {
			var $container = $('#content_area');
			$container.empty();
			$container.append(this.dashboardView.render().el);
		},
		settings: function() {
			var $container = $('#content_area');
			$container.empty();
			$container.append(this.settingsView.render().el);
		},
		packages: function() {
			var $container = $('#content_area');
			$container.empty();
			$container.append(this.packagesView.render().el);
		},
		login: function() {
			var $container = $('#content_area');
			$container.empty();
			$container.append(this.loginView.render().el);
		},
		files: function() {
			var $container = $('#content_area');
			$container.empty();
			$container.append(this.filesView.render().el);
		}
	});
  
	// fire everything off
	$(function() {
		console.log('creating app');

		window.App = new PlugUI;
		
		Backbone.history.start();
	});
	
})(jQuery);