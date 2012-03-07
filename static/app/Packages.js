(function($) {
	window.Package = Backbone.Model.extend({
		defaults: {
			name: null,
			version: null,
			repo: null
        },
		initialize: function(){
			console.log('creating new package model');
			
        }
	});
  
	window.Packages = Backbone.Collection.extend({
		initialize: function(){
            console.log('New package collection');
			
        },
		model: Package,
		comparator: function(package) {
			return package.get("name").toLowerCase();
		}
	});
})(jQuery);