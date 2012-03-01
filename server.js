
/**
 * Module dependencies.
 */
var fs		= require('fs');
var express = require('express');

//pam auth connector
var unixlib = require('unixlib');
var service = "system-auth";


// templates, stored in global vars at start time so they can be tunneled in json responses
var core;
var dashboard;
var files;
var packages;
var settings;
var login;


// Yes, this is probably "un-node-like", its a hack :)

fs.readFile('./views/core.html', 'utf8', function (err,data) {
	core = data;
});

fs.readFile('./views/dashboard.html', 'utf8', function (err,data) {
	dashboard = data;
});

fs.readFile('./views/files.html', 'utf8', function (err,data) {
	files = data;
});

fs.readFile('./views/packages.html', 'utf8', function (err,data) {
	packages = data;
});

fs.readFile('./views/settings.html', 'utf8', function (err,data) {
	settings = data;
});

fs.readFile('./views/login.html', 'utf8', function (err,data) {
	login = data;
});







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
	res.json({ authenticated: req.session.authenticated, page: JSON.stringify(login) });
});

app.get('/dashboard', function(req, res){
	res.json({ authenticated: req.session.authenticated, page: JSON.stringify(dashboard) });
});

app.get('/files', function(req, res){
	res.json({ authenticated: req.session.authenticated, page: JSON.stringify(files) });
});

app.get('/packages', function(req, res){
	res.json({ authenticated: req.session.authenticated, page: JSON.stringify(packages) });
});

app.get('/settings', function(req, res){
	res.json({ authenticated: req.session.authenticated, page: JSON.stringify(settings) });
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