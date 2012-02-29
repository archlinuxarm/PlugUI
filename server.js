
/**
 * Module dependencies.
 */
var fs		= require('fs');
var express = require('express');

//pam auth connector
var unixlib = require('unixlib');
var service = "system-auth";



// create an application 
var app = module.exports = express.createServer();



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

	// make a custom html template
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






// setup routes for static pages, none of these do anything but return flat html so the client side can render it inside a DOM element
// these also require no auth because everything that can change state on the server goes through a POST'ed JSON API



app.get('/', function(req, res){
	res.render('core.html');
});

app.get('/login', function(req, res){
	res.render('login.html');
});

app.get('/dashboard', function(req, res){
	res.render('dashboard.html');
});

app.get('/files', function(req, res){
	res.render('files.html');
});

app.get('/packages', function(req, res){
	res.render('packages.html');
});

app.get('/settings', function(req, res){
	res.render('settings.html');
});


// APIs

app.post('/api/login', function(req, res){

	unixlib.pamauth(service, username, password, function(result) {
		console.log("Username: " + username + ", password: " + password + ", result: " + result);
		//res.json({ authenticated: true, login: true });

	});
	
	
});							
		



// GO! :D
app.listen(80);

console.log("PlugUI running on port %d in %s mode", app.address().port, app.settings.env);
