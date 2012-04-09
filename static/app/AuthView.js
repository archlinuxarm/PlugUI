(function($) {

	window.AuthView = Backbone.View.extend({
		tagName: 'div',
		className: 'authpanel greybox',
    
		initialize: function() {
			_.bindAll(this, 'render');

			this.visible = false;
			
			var lthis = this;
			dispatcher.on("didAuthenticate", function(msg) {
				lthis.hideAuth();
			});
			dispatcher.on("needsAuthentication", function(msg) {
				lthis.showAuth();
			});

    
		},
		hideAuth: function() {
			if (this.visible == true) {
				$('#userbutton').removeClass('selected'); 
				console.log("removing login popup");
				
				this.visible = false;
				$(this.el).remove();
			}
		},
		showAuth: function() {
			if (this.visible == false) {
				$('#userbutton').addClass('selected');
				console.log("adding login popup");
				var $container = $('body');
				$container.append(this.render().el);
				
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
			var lthis = this;
			
			if (window.authenticated == false) {
				var title = document.createElement('div');
				var text = document.createTextNode('Login');
				title.appendChild(text);
				
				
				// username field container and field
				var userbox = document.createElement('div');
				userbox.setAttribute('class','whitebox');
				
				var userfield = document.createElement('input');
				userfield.setAttribute('class','selectable');

				userfield.setAttribute('placeholder','Username');
				userfield.setAttribute('type','text');
				userfield.setAttribute('name','username');
				userfield.setAttribute('id','usernamefield');
				
				userbox.appendChild(userfield);
				
				
				//password field container and field
				var passbox = document.createElement('div');
				passbox.setAttribute('class','whitebox');
				
				var passfield = document.createElement('input');
				passfield.setAttribute('class','selectable');
				passfield.setAttribute('placeholder','Password');
				passfield.setAttribute('type','password');
				passfield.setAttribute('name','password');
				passfield.setAttribute('id','passwordfield');
				
				passbox.appendChild(passfield);
				

				var loginbutton = document.createElement('button');
				loginbutton.setAttribute('type','button');
				loginbutton.setAttribute('id','loginbutton');
				loginbutton.setAttribute('name','login');
				loginbutton.onclick = function() {
					console.log('logging in');
					window.App.authenticate();
				};
				
				var login_text = document.createTextNode('Login');
				loginbutton.appendChild(login_text);

				var error = document.createElement('div');
				error.setAttribute('id','login_error');
				
				$(this.el).empty();
				
				$(this.el).append(title);
				$(this.el).append(userbox);
				$(this.el).append(passbox);
				$(this.el).append(loginbutton);
				$(this.el).append(error);
				
				
			}
			else {
			
				var title = document.createElement('div');
				var username = document.createTextNode(window.username);
				title.appendChild(username);
				
				var logoutbutton = document.createElement('button');
				logoutbutton.setAttribute('type','button');
				logoutbutton.setAttribute('id','logoutbutton');
				logoutbutton.setAttribute('name','logout');
				logoutbutton.onclick = function() {
					console.log('logging out');
					window.App.logout();
					lthis.render();
				};
				
				var logout_text = document.createTextNode('Logout');
				logoutbutton.appendChild(logout_text);

				var error = document.createElement('div');
				error.setAttribute('id','logout_error');
				
				
				$(this.el).empty();
				
				$(this.el).append(title);
				$(this.el).append(logoutbutton);
				$(this.el).append(error);
			}
			return this;
		}
	});	
})(jQuery);