(function($) {
	window.UsersView = Backbone.View.extend({
		tagName: 'div',
		className: 'one-third column statusbox',
		
		
		initialize: function() {
			_.bindAll(this, 'render');
			this.template = _.template($('#user-template').html());
			this.addusertemplate = _.template($('#adduser-template').html());
			this.collection = new Users();
			
			this.collection.bind('reset', this.render);
			
			var lthis = this;
			dispatcher.on("didAuthenticate", function(msg) {
				console.log('User view firing authenticated event');
				lthis.fetch();
			});
			dispatcher.on("needsAuthentication", function(msg) {
				console.log('User view firing deauthenticated event');
				lthis.collection.reset();
			});
		},
		saveuser: function() {
			console.log('saveuser');
			var lthis = this;
			var username, password, password2;
    
			if (this.$('#usernamefield').attr('value') !== undefined) {  
				var username	= this.$('#usernamefield').attr('value');

			} 
			else {
				this.$('#usernamefield').focus(); 
				this.$('#adduser-error').html("<strong>Username blank");
				return false;  
			}
			if (this.$('#passwordfield').attr('value') !== undefined) {  
				var password	= this.$('#passwordfield').attr('value');    
			} 	
			else {
				this.$('#passwordfield').focus();  
				this.$('#adduser-error').html("<strong>No password</strong>");
				return false;  
			}
			if (this.$('#password2field').attr('value') !== undefined) {  
				var password2	= this.$('#password2field').attr('value');    
			} 	
			else {
				this.$("#password2field").focus();  
				this.$('#adduser-error').html("<strong>Repeat password</strong>");
				return false;  
			}
	
			if (password != password2) {
				this.$("#password2field").focus(); 
				this.$('#adduser-error').html("<strong>Passwords don't match</strong>");
				return false; 	
			}
			this.$('#adduser-error').html("<strong>Creating user...</strong>");
			$.ajax({
				type: "POST",
				url: "/api/users",
				dataType : 'json',
				data: { "apicmd": "create",  "username": username, "password": password },
					success: function(json){
					var result = json;
					if (result.success == true) {
				
						lthis.$('#adduser-error').html("<strong>User created</strong>");
						lthis.$('#adduser-error').fadeIn('slow');
						$(lthis.popupel).remove();
					}
					else {
						lthis.$('#adduser-error').html("<strong>Create user failed</strong>");
						lthis.$('#adduser-error').fadeIn('slow');
					}  
					setTimeout('$("#adduser-error").fadeOut("slow");$("#adduser-error").html("");', 3000);
					lthis.fetch();
				}
			});
			
		},
		deleteuser: function(username) {
			console.log('deleteuser');
			var lthis = this;
			$.ajax({
				type: 'POST',
				cache: false,
				url : '/api/users',
				data: { apicmd: "delete", username: username },
				dataType : 'json',
				success: function (json) { 
					var response = json;
					if (response.success == true) {
						lthis.fetch();
					}
				}
			});	
		},
		popup: function() {
			console.log('User popup');
			this.popupel = this.addusertemplate();
			var lthis = this;
			
			
			$(this.el).append(this.popupel);
			this.$('#saveuser-button').onclick = function() { 
				console.log('saveuser from bind');
				lthis.saveuser(); 
			};
			
			
		},
		render: function() {
			var lthis = this;
			console.log('User view rendering');
			var renderedContent = this.template();
			$(this.el).html(renderedContent);
			this.collection.each(function(user) {
				if (user.get('shell') != '/bin/false' && user.get('username').length >= 1) {				
					var li = document.createElement('li');
					li.setAttribute('class','user-item');
					
					var textspan = document.createElement('span');
					var text = document.createTextNode(user.get('username'));
					textspan.appendChild(text);
					li.appendChild(textspan);
					
					var deletebutton = document.createElement('button');
					deletebutton.setAttribute('class','userdelete-button');
					var text = document.createTextNode('Delete');
					deletebutton.appendChild(text);
					deletebutton.onclick = function() {
						lthis.deleteuser(user.get('username'));
						lthis.fetch();
					};
					li.appendChild(deletebutton);
					
					lthis.$('#userlist').append(li);
				}; 
			});
			
			var button = document.createElement('button');
			button.onclick = function() {
				console.log('User popup click');
				lthis.popup();
			};
			var text = document.createTextNode('Add user');
			
			button.appendChild(text);
			$(this.el).append(button);
			return this;
		},
		
		fetch: function() {
			console.log('getting users from server');
			var lthis = this;
			$.ajax({
				type: 'POST',
				cache: false,
				url : '/api/users',
				data: { apicmd: "list" },
				dataType : 'json',
				success: function (json) { 
					var response = json;
					if (response.success == true) {
						lthis.collection.reset(response.userlist);
					}
				}
			});
		}
	});
})(jQuery);