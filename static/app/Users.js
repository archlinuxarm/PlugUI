(function($) {
	window.User = Backbone.Model.extend({
		defaults: {
			username: null,
			uid: null,
			gid: null,
			homedir: null,
			shell: null
        },
		initialize: function(){
            //
			//console.log('creating new user model');
			
        }
	});
  
	window.Users = Backbone.Collection.extend({
		initialize: function(){
            //
			//console.log('creating new user collection');
			
        },
		model: User,
		comparator: function(user) {
			return user.get("username").toLowerCase();
		}
	});
})(jQuery);