/*
 * PlugUI server backend
 * Copyright © 2012 Stephen Oliver <mrsteveman1@gmail.com>
 */
 
var path	= require('path');
var os		= require('os');
var fs		= require('fs');
var util	= require('util');
var express = require('express');
var each	= require('each');
var mime	= require('mime');

var clientSessions = require('client-sessions');
var crypto	= require('crypto');

var spawn = require('child_process').spawn;

//configuration	
var config = require('yaml-config');
var settings = config.readConfig("config/app.yaml");	
	
//pam auth connector
var unixlib = require('unixlib');

// read version information
var packageJson = JSON.parse(fs.readFileSync("package.json", "UTF-8"));
var packageVersion = packageJson.version;

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


// only one page, all views and transitions handled client-side
app.get('/', function(req, res){
	res.render('core.html');
});


// APIs
app.post('/api/status', function(req,res) {
	response = {};
//	console.log("Constructing status response");
	response.success		= true;
	response.hostname   = os.hostname();
	response.type       = os.type();
	response.arch       = os.arch();
	response.platform   = os.platform();
	response.release    = os.release(); 
	response.freemem		= os.freemem();
	response.usedmem		= os.totalmem() - os.freemem();
	response.loadavg		= os.loadavg();
	response.uptime			= os.uptime();
	response.totalmem	  = os.totalmem();
	response.version    = packageVersion;
//	console.log("Response constructed");
	res.json(response);
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

app.post('/api/files', function(req, res){
	console.log("Getting directory list");
	response = {};
	response.success = false


	apicmd = req.body.apicmd

	if (apicmd == 'directory_list') {
		dirs = [];
		rawpath = req.body.path;
		directory = path.join("/media/", rawpath);
		if ( directory.match("^/media") ) {
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
console.log('Starting PlugUI on port: ' +  settings.app.port);
app.listen(settings.app.port);