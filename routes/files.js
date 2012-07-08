var fs   = require('fs');
var path = require('path');
var each = require('each');

module.exports = function(app) {
  app.post('/api/files', function(req, res){
    console.log("Getting directory list");
    basepath = app.settings.config.app.basepath;
    response = {};
    response.success = false

    apicmd = req.body.apicmd

    if (apicmd == 'directory_list') {
      dirs = [];
      rawpath = req.body.path;
      directory = path.join(basepath + "/", rawpath);
      if ( directory.match("^" + basepath) ) {
        response.requestpath = directory;
        response.validpath = true;
        each( fs.readdirSync(directory) )
          .on('item', function(next, element, index) {
            var file = element;
            //skip hidden files
            if ( file.match("^\\.") ) next();
            currentfile = {};
            fullpath = path.join(directory,file);
            if ( fs.statSync(fullpath).isDirectory() ) {


              /* frontend model 
              
                  fullpath: null,
                  directory: null,
                  isFolder: false,
                  name: null,
                  size: null,
                  type: null
              */
              currentfile.type = 'folder';
              currentfile.fullpath = fullpath;
              currentfile.directory = directory;
              currentfile.name = file;
              currentfile.isFolder = true;
              
              currentfile.size = fs.statSync(fullpath).size;
              //currentfile.date = str(datetime.datetime.fromtimestamp(os.path.getmtime(fullpath)))
            }
            else {

              currentfile.type = path.extname(fullpath).substring(1);
              currentfile.fullpath = fullpath;
              currentfile.directory = directory;
              currentfile.name = file;
              currentfile.isFolder = false;

              currentfile.size = fs.statSync(fullpath).size;
              //currentfile.date = str(datetime.datetime.fromtimestamp(os.path.getmtime(fullpath)))
            }
            dirs.push(currentfile);

            next();
          })
          .on('error', function(err) {
            console.log(err.message);
          })
          .on('end', function() {

            dirs.sort(function sortfunction(a, b) {
              if (a.text < b.text) {
                return -1;
              }
              if (a.text > b.text) {
                return 1;
              }
              return 0;
            });
            response.success = true;
            response.files = dirs;
            res.json(response);
          });
      }
      else {
        response.success = false;
        response.validpath = false;
        res.json(response);
      }
    }
    else if (apicmd == 'download') {
        
      filename = req.body.filename;
      filepath = req.body.filepath;
      
      // this may not be secure yet depending on how easily the filesystem APIs can be abused. 
      // the old python version explicitly normalized the path and did some other checks, but
      // it may be that doing just a regex type sandbox works so long as nobody can ../ or symlink (need to check this)
      if ( filepath.match("^/media") ) {    
        var mimetype = mime.lookup(filepath);
        res.writeHead(200, {
          "Content-Type": mimetype,
          "Content-disposition": "attachment; filename=" + filename,
        });
            
        var filestream = fs.createReadStream(filepath);
        filestream.on('data', function(chunk) {
          res.write(chunk);
        });
        filestream.on('end', function() {
          res.end();
        });
      }
    }
  });
}