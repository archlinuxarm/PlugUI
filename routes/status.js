var os = require('os');

module.exports = function(app) {
  // API for status
  app.post('/api/status', function(req,res) {
    response = {};
  //  console.log("Constructing status response");
    response.success    = true;
    response.hostname   = os.hostname();
    response.type       = os.type();
    response.arch       = os.arch();
    response.platform   = os.platform();
    response.release    = os.release(); 
    response.freemem    = os.freemem();
    response.usedmem    = os.totalmem() - os.freemem();
    response.loadavg    = os.loadavg();
    response.uptime     = os.uptime();
    response.totalmem   = os.totalmem();
    response.version    = app.settings.packageJson.version;
  //  console.log("Response constructed");
    res.json(response);
  });  
}

