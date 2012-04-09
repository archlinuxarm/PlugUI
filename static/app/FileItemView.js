(function($) {

	window.FileItemView = Backbone.View.extend({
		tagName: 'tr',
		className: 'line',
    
		initialize: function() {
			_.bindAll(this, 'render');
		},
    
		render: function() {
			var item = this.model;
			
			var lthis = this;
			
			
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
				downloadlink.onclick = function() { 

					// this is a rather crude hack, appending a form just to download a file without 
					// switching pages, but it works and the alternatives don't
					var form = document.createElement("form");
					form.setAttribute("method", "post");
					form.setAttribute("action", "/api/files");
					document.body.appendChild(form);

					var hidden;

					// append cmd to form
					hidden = document.createElement('input');
					hidden.type = 'hidden';
					hidden.name = 'apicmd';
					hidden.value = 'download';
					form.appendChild(hidden);
	
					// append path to form
					hidden = document.createElement('input');
					hidden.type = 'hidden';
					hidden.name = 'filepath';
					hidden.value = item.get('fullpath');
					form.appendChild(hidden);

					// append filename to form
					hidden = document.createElement('input');
					hidden.type = 'hidden';
					hidden.name = 'filename';
					hidden.value = item.get('name');
					form.appendChild(hidden);
						
					form.submit();	
					return false;		
				};
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
				viewlink.onclick = function(){
					var form = document.createElement("form");
					form.setAttribute("method", "post");
					form.setAttribute("action", "/api/files");
					document.body.appendChild(form);

					var hidden;

					// append cmd to form
					hidden = document.createElement('input');
					hidden.type = 'hidden';
					hidden.name = 'apicmd';
					hidden.value = 'view';
					form.appendChild(hidden);
	
					// append path to form
					hidden = document.createElement('input');
					hidden.type = 'hidden';
					hidden.name = 'filepath';
					hidden.value = item.get('fullpath');
					form.appendChild(hidden);

					// append filename to form
					hidden = document.createElement('input');
					hidden.type = 'hidden';
					hidden.name = 'filename';
					hidden.value = item.get('name');
					form.appendChild(hidden);
						
					form.submit();	
					return false;
				};
				var text = document.createTextNode("V");
				viewlink.appendChild(text);
				tools.appendChild(viewlink);

			}
			fileline.appendChild(tools);
			return this;
		}
	});	
})(jQuery);