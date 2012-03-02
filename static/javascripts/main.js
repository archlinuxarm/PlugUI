(function($) {
	
	
	


	
	
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
	
	
	
	
	

  
  
	window.FilesView = Backbone.View.extend({
		tagName: 'div',
		className: 'files',
    
		initialize: function() {
			_.bindAll(this, 'render');
			this.template = _.template($('#files-template').html());
			//this.collection.bind('reset', this.render);
		},
		
		render: function() {
			/*var $files;
			var collection = this.collection;
			$(this.el).html(this.template({}));
			$files = this.$('.files');
      
			collection.each(function(file) {
				var view = new FileItemView({
					model: file,
					collection: collection
				});
				$files.append(view.render().el);
			});*/
			
			
			
			/* comment out because not ported yet 
			
			$('#filelist').empty();


			$('#currentpath').html(currentpath);
			var filelist = document.getElementById('filelist');
			var parentdirline = document.createElement("div");
			parentdirline.setAttribute('class', 'line');
		   
			var icon = document.createElement("div");
			icon.setAttribute('class', 'icon parentdir');
			parentdirline.appendChild(icon);
					
			var name = document.createElement("div");
			name.setAttribute('class', 'name');
			var parentlink = document.createElement("a");
			parentlink.setAttribute('href','#');
			parentlink.onclick = function(){ selectParent();return false };
			var parenttext = document.createTextNode("Parent Directory");
			parentlink.appendChild(parenttext);
			name.appendChild(parentlink);
			parentdirline.appendChild(name);
					
			filelist.appendChild(parentdirline);
					
			var clear = document.createElement("div");
			clear.setAttribute('class', 'clear');
			filelist.appendChild(clear);

			$.each(returnlist.files, function(i,item){

				//new file line	
				var fileline = document.createElement("div");
				fileline.setAttribute('class', 'line');

				fileline.onclick = function(){ selectLine(item); $('.line').removeClass('highlightRow'); $(this).addClass('highlightRow'); };
				
				//create an icon for the file listing and add it to the line
				var icon;
				if (item.iconCls == 'file-mp3' || item.iconCls == 'file-m4a' || item.iconCls == 'file-oga') {
					icon = document.createElement("a");
					icon.setAttribute('href','#');
					icon.onclick = function(){ playMedia(item);return false };
				}
				else {
					icon = document.createElement("div");
				}
						   
				icon.setAttribute('class', 'icon ' + item.iconCls);
				fileline.appendChild(icon);

				//create an element to hold the name of the file and add it to the line
				var name = document.createElement("div");
				name.setAttribute('class', 'name');
				var namelink = document.createElement("a");
				namelink.setAttribute('href','#');
				namelink.onclick = function(){ selectLink(item);return false };
				var text = document.createTextNode(item.text);
				namelink.appendChild(text);
				name.appendChild(namelink);
				fileline.appendChild(name);
						
						
				// these are download, view, share links, not currently ported into the node backend yet
				if (item.iconCls != "directory") {
					var tools = document.createElement("ul");
					tools.setAttribute('class', 'file-toolbar');
					var downloadlink = document.createElement("li");
					downloadlink.onclick = function(){ downloadFile(item);return false };
					var text = document.createTextNode("D");
					downloadlink.appendChild(text);
					tools.appendChild(downloadlink);


					var sharelink = document.createElement("li");
					sharelink.onclick = function(){ shareFile(item);return false };
					var text = document.createTextNode("S");
					sharelink.appendChild(text);
					tools.appendChild(sharelink);

					var viewlink = document.createElement("li");
					viewlink.onclick = function(){ viewFile(item);return false };
					var text = document.createTextNode("V");
					viewlink.appendChild(text);
					tools.appendChild(viewlink);
							
							
					fileline.appendChild(tools);


				}
								
				//append our new line to the file list
				filelist.appendChild(fileline);
						
			});*/
			var renderedContent = this.template();
			$(this.el).html(renderedContent);
			return this;
		}
	});
	
	
	
	
	
	window.File = Backbone.Model.extend({
		defaults: {
			directory: null,
			filename: null,
			filesize: null,
			filetype: null,
        },
		initialize: function(){
            //

			
        }
	});
  
	window.Files = Backbone.Collection.extend({
		model: File
	});
  
	window.files = new Files();
	
	
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