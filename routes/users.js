var fs    = require('fs');

module.exports = function(app) {
  app.post('/api/users', function(req, res){
    response = {};
    response.success = false;
    apicmd = req.body.apicmd;
    if (apicmd == "list") {
      fs.readFile('/etc/passwd', 'ascii', function(err,data){
        if(err) {
          
        }
        else {
          var users = data.toString().split("\n");
          var userlist = [];
          for(i in users) {         
            var userinfo = users[i].split(":");
            
            var user = {};
            user.username = userinfo[0];
            user.uid = userinfo[2];
            user.gid = userinfo[3];
            user.homedir = userinfo[5];
            user.shell = userinfo[6];
            userlist.push(user);
          }
          response.success = true;
          response.userlist = userlist;
        }
        res.json(response);
      });
    }
    else if ( apicmd == "create" ) {
      var username = req.body.username;
      // note: this is vulnerable to potential attack, 'username; rm -rf /' 
      var useradd = spawn('useradd', [username]);
      useradd.on('exit', function (code) {
        if (code == 0) {
          response.success = true;
        }
        res.json(response);
      });
      
    }
    else if ( apicmd == "delete" ) {
      var username = req.body.username;
      // note: this is vulnerable to potential attack, 'username; rm -rf /' 
      var userdel = spawn('userdel', [username]);
      userdel.on('exit', function (code) {
        if (code == 0) {
          response.success = true;
        }
        res.json(response);
      });
    }
    
  });
}