(function($) {
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
})(jQuery);