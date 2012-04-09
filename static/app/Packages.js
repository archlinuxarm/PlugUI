(function($) {
	window.Package = Backbone.Model.extend({
		defaults: {
			name: null,
			version: null,
			repo: null,
			installed: false
        },
		initialize: function(){

			
        }
	});
  
	window.Packages = Backbone.Collection.extend({
		initialize: function(){

			
        },
		model: Package,
		comparator: function(package) {
			return package.get("name");
		}
	});
})(jQuery);