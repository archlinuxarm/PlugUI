/*
 * PlugUI server backend
 * Copyright © 2012 Stephen Oliver <mrsteveman1@gmail.com>
 */
 
var os		= require('os');
var fs		= require('fs');
var util	= require('util');
var express = require('express');
var mime	= require('mime');

var clientSessions = require('client-sessions');
var crypto	= require('crypto');

//configuration	
var configFile = require('yaml-config');
var config = configFile.readConfig("config/app.yaml");	
	
//pam auth connector
var unixlib = require('unixlib');

// secret used for cookie encryption, needs to be stored once in the filesystem if it doesnt exist already
var secret;
var secretPath = os.tmpDir() + "/plugui.secret";

if (fs.existsSync(secretPath)) {
	secret = fs.readFileSync(secretPath);
}
else {
	try {
		secret = crypto.randomBytes(256);
		fs.writeFileSync(secretPath, secret);
	} catch (ex) {
		console.log('Error generating random bytes for secret!');
	}	
	
}

// read version information
var packageJson = JSON.parse(fs.readFileSync("package.json", "UTF-8"));

// create an application 
var app = module.exports = express.createServer(

);

app.configure(function(){
	app.use(express.bodyParser());
	
	//sessions in memory at the moment
	app.use(express.cookieParser());
	app.use(
		clientSessions({
			cookieName: 'session_state',
			secret: secret, 
			duration: 24 * 60 * 60 * 1000, // 1 day
		})
	);
	
	app.use(express.methodOverride());
	app.use(app.router);
	app.use("/static", express.static(__dirname + '/static'));

	// disable layout
	app.set("view options", {layout: false});
	
	// enable cross routes settings
	app.set("secret", secret);
	app.set("config", config);
	app.set("packageJson", packageJson);

	console.log("basepath: " + config.app.basepath);

	app.register('.html', {
		compile: function(str, options){
			return function(locals){
				return str;
			};
		}
	});
});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
	app.use(express.errorHandler());
});

// allow dynamic routes
require('./routes')(app);

// only one page, all views and transitions handled client-side
app.get('/', function(req, res){
	res.render('core.html');
});


app.post('/api/auth', function(req, res) {
	response = {};
	response.success = false;
	apicmd = req.body.apicmd;
	if (apicmd == "check") {
		response.authenticated = req.session.authenticated;
		response.username = req.session.username;
		response.success = true;
		res.json(response);	
	}
	else if ( apicmd == "login" ) {
		var username = req.body.username;
		var password = req.body.password;
		unixlib.pamauth("login", username, password, function(result) {
			req.session.authenticated = result;
			req.session.username = username;
			res.json({ success: true, authenticated: result, username: username });
		});
	}
	else if ( apicmd == "logout" ) {
		req.session.reset(['csrf']);
		res.json({ success: true });
	}	
	
});							
		
//app.post('/api/files/upload', function(req, res) {
//	req.form.complete(function(err, fields, files){
//		if (err) {
//			next(err);
//		} 
//		else {
//			console.log('\nuploaded %s to %s',  files.image.filename, files.image.path);
//			//res.redirect('back');
//			res.json( { "success": success });
//		}
//	});
//	
//	req.form.on('progress', function(bytesReceived, bytesExpected){
//		var percent = (bytesReceived / bytesExpected * 100) | 0;
//		console.log('Uploading: %' + percent + '\r');
//	});
//	
//});




	





/*
Unported stuff

elif apicmd == 'download':
		rawpath = bottle.request.forms.path
		path = "/media/" + posixpath.normpath(urllib2.unquote(rawpath)).rstrip('.')
		if re.match("/media", path):
			try:
				return privateapi.core.streamfile(path,"download")
			except:
				pass
		return "Cannot download file: %s" % path


	elif apicmd == 'view':
		rawpath = bottle.request.forms.path
		path = "/media/" + posixpath.normpath(urllib2.unquote(rawpath)).rstrip('.')
		if re.match("/media", path):
			try:
				return privateapi.core.streamfile(path,"view")
			except:
				pass
		return "Cannot view file: %s" % path

	elif apicmd == 'addshare':
		response = dict()
		response.success = false
		rawpath = bottle.request.forms.path
		cleanpath = posixpath.normpath(urllib2.unquote(rawpath)).rstrip('.').rstrip('/')
		if re.match("/media", cleanpath):
			share = ShareForm(request.POST)
			if share.is_valid():
				share.save()
				response.success = true
		return response
		
		
	elif apicmd == 'deleteshare':
		response = dict()
		response.success = false
		rawpath = bottle.request.forms.path
		cleanpath = posixpath.normpath(urllib2.unquote(rawpath)).rstrip('.').rstrip('/')
		if re.match("/media", cleanpath):
			share = ShareForm(request.POST)
			if share.is_valid():
				share.save()
				response.success = true
		return response

		# simple server stats api, to be called from js in the client
		@self.web.post('/api/status', apply=[self.auth])
		def statusapi():
			response = {}
			response.success = true
			response.diskuse = privateapi.core.getdiskuse()
			response.memused = psutil.phymem_usage().percent
			response.cpu = psutil.cpu_percent()
			response.loadavg = privateapi.core.getloadavg()
			response.uptime = privateapi.core.getuptime()
			response.storage = privateapi.core.storage_details()
			response.memory_total = privateapi.core.getmemory_total()
			return response

		@self.web.post('/api/pacman', apply=[self.auth])
			response = {}
			response.success = false
			apicmd = bottle.request.forms.apicmd

			if apicmd == "list_installed":
				#package_list = privateapi.pacman.list_installed()
				pass #unused function
			elif apicmd == "list_updates":
				response.output = privateapi.pacman.list_upgrades()
				response.success = true
			elif apicmd == "do_upgrade":
				response.output = privateapi.pacman.doupdateos()
				response.success = true
				privateapi.maintenance.update_counter()
			return response

		@self.web.post('/api/system', apply=[self.auth])
		def systemapi():
			response = {}
			response.success = false
			apicmd = bottle.request.forms.apicmd

			if apicmd == "execute":
				command = bottle.request.forms.command.strip('\n')
				try:
					response.output = privateapi.core.runcommand(command)
					response.success = true
				except:
					pass
			elif apicmd == "reboot":
				response.output = privateapi.core.rebootnow()
				response.success = true
			return response

		@self.web.get('/download/<uuid>')
		def downloadshare(uuid):
			share = self.database.get_share(uuid)
			path = share.path
			response = privateapi.core.streamfile(path,"download")
			return response


		def handle_uploaded_file(f):
			destination = open('/var/lib/PlugUI/data/uploads/' + f.name, 'wb+')
			for chunk in f.chunks():
				destination.write(chunk)
			destination.close()
			
*/


// GO! :D
console.log('Starting PlugUI on port: ' +  config.app.port);
app.listen(config.app.port);