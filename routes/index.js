// this file must be named index.js to allow automatic loading of modules from this directory
var fs = require('fs');

// dynamically add routes in directory 'routes'
module.exports = function(app) {
  fs.readdirSync(__dirname).forEach(function(file){
    if (file == 'index.js') return;
    var name = file.substr(0, file.indexOf('.'));
    require('./' + name)(app);
  });
}