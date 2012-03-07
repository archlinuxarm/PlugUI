(function($) {
	window.FilesView = Backbone.View.extend({
		tagName: 'div',
		idName: 'filelist',
    
		initialize: function() {
			console.log('new files view');
			_.bindAll(this, 'render');
			this.template = _.template($('#files-template').html());
			this.directory = '';

			//this.uploadView = UploadView({ el: this.$('#dropbox') });
			this.collection = new Files();
			
			this.collection.bind('reset', this.render);
			
			this.dropbox = new UploadView({ });
			
				
						
			dispatcher.on("didAuthenticate", function(msg) {
				console.log('authenticated, getting new file tree');
				window.App.filesView.getTree('',false);
			});
		},
		getTree: function(newdir,previous) {
			var lthis = this;
			console.log('getting tree with: ' + newdir);
			var directory_array = this.directory.split("/");
			if (previous == true) {
				directory_array.pop();
			}
			else {
				directory_array.push(newdir);
			}
			
			this.directory = directory_array.join("/");
			if (this.directory == '/') this.directory = '';		
			showloader();
			$.ajax({
				type: 'POST',
				cache: false,
				url : '/api/files',
				data: { apicmd: "directory_list", path: this.directory },
				dataType : 'json',
				success: function (json) { 
					var response = json;
					if (response.success == true) {
						window.App.filesView.directory = lthis.directory;
						window.App.filesView.collection.reset(response.files);
						
					}
					hideloader();
				},
				error: function(jqXHR, textStatus, errorThrown) {
					hideloader();
				} 
			});
		},		
		render: function() {
			console.log('rendering files view');
			var collection = this.collection;
			
			$(this.el).html(this.template({}));

			
			var $rightpanel = this.$('#rightpanel');
			
			$rightpanel.html(this.dropbox.render().el);
			
			var $filelist = this.$('#filelist');
			
			
		
			
			var headerline = document.createElement("tr");
			headerline.setAttribute('class', 'line');
			headerline.setAttribute('id', 'fileheader');
		   
			var icon = document.createElement("td");
			icon.setAttribute('class', 'icon');
			
			var image = document.createElement('div');
			image.setAttribute('id', 'loader');
			image.setAttribute('style','display:none;');
			
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
})(jQuery);