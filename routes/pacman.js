var spawn = require('child_process').spawn;

module.exports = function(app) {
  app.post('/api/pacman', function(req, res) {
    response = {};
    response.success = false;
    apicmd = req.body.apicmd;
    if (apicmd == "list_packages") {
    
      packages = [];
      var packagelist = spawn('pacman', ["-Sl"]);
      
      packagelist.stdout.on('data', function (data) {
        var packagelines = data.toString().split("\n");
        for(i in packagelines) {  
          if ( packagelines[i].match("^\ ") ) return;
          if ( packagelines[i].match("^\:") ) return;
          var packagesplit = packagelines[i].split(" ");
          var isInstalled;
          if (packagesplit[4] == "[installed]") { 
            isInstalled = true;
          }
          else {
            isInstalled = false;
          }
          var package = { repo: packagesplit[0], name: packagesplit[1], version: packagesplit[2], installed: isInstalled };
          packages.push(package);       
        }
      });

      packagelist.on('exit', function (code) {
        if (code == 0) {
          response.success = true;
          response.packages = packages;
        }
        res.json(response);
      });
    }
    else if ( apicmd == "list_upgrades" ) {
      var packagelist = spawn('pacman', ["-Syup","--print-format","'%n %v'"]);
      packagelist.stdout.on('data', function (data) {
        response.upgradelist.push(data);
      });

      packagelist.on('exit', function (code) {
        if (code == 0) {
          response.success = true;
        }
        res.json(response);
      });
    }
    else if ( apicmd == "do_upgrade" ) {
      var packagelist = spawn('pacman', ["-Syu","--noconfirm","--noprogressbar"]);
      packagelist.stdout.on('data', function (data) {
        response.upgraderesult.push(data);
      });

      packagelist.on('exit', function (code) {
        if (code == 0) {
          response.success = true;
        }
        res.json(response);
      });
    }   
  });
}
