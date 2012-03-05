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
var form	= require('connect-form');


//pam auth connector
var unixlib = require('unixlib');

// create an application 
var app = module.exports = express.createServer(
	form({ keepExtensions: true })
);

app.configure(function(){
	app.use(express.bodyParser());
	
	//sessions in memory at the moment
	app.use(express.cookieParser());
	app.use(express.session({ secret: "70197a4d3a5cd29b62d4239007b1c5c3c0009d42d190308fd855fc459b107f40a03bd427cb6d87de18911f21ae9fdfc24dadb0163741559719669c7668d7d587" }));
	
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
	response.success		= true;
	response.freemem		= os.freemem();
	response.memused		= os.totalmem() - os.freemem();
	response.loadavg		= os.loadavg();
	response.uptime			= os.uptime();
	response.memory_total	= os.totalmem();
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
			res.json({ authenticated: result, username: username });
		});
	}
	else if ( apicmd == "logout" ) {
		req.session.destroy();
		res.json({ success: true });
	}	
	
});							
		


app.post('/api/user', function(req, res){
	response = {};
	response.success = false
	apicmd = req.body.apicmd
	if (apicmd == "list") {
		//users = database.list_users();
		//response.success = true;
		//response.users = users;
	}
	else if ( apicmd == "create" ) {
		//database.create_user(username=bottle.request.forms.username,password=bottle.request.forms.password,admin=true);
		//response.success = true;
	}
	else if ( apicmd == "delete" ) {
		//database.delete_user(uuid=bottle.request.forms.uuid)
		//response.success = true;
	}
	res.json(response);
});

app.post('/api/files/upload', function(req, res) {
	req.form.complete(function(err, fields, files){
		if (err) {
			next(err);
		} 
		else {
			console.log('\nuploaded %s to %s',  files.image.filename, files.image.path);
			//res.redirect('back');
			res.json( { "success": success });
		}
	});
	
	// We can add listeners for several form
	// events such as "progress"
	req.form.on('progress', function(bytesReceived, bytesExpected){
		var percent = (bytesReceived / bytesExpected * 100) | 0;
		console.log('Uploading: %' + percent + '\r');
	});
	
});

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
app.listen(80);