# the bulk of the imports for this server

# import gevent and monkey patch things so they play nice
from gevent import monkey; monkey.patch_all()
import gevent

# standard lib imports
import sys
import json
import urllib2
import re
import datetime, time
import psutil
import os
import shutil 
import traceback
import shlex
import locale 
import re
import operator
import posixpath
import uuid
import base64
import mimetypes


# plugui private api
import privateapi.core 
import privateapi.pacman

# bottle is the microframework
import bottle

# template library stuff
from jinja2 import Environment, FileSystemLoader
from jinja2 import Undefined 
JINJA2_ENVIRONMENT_OPTIONS = { 'undefined' : Undefined }

# session tracking
from beaker.middleware import SessionMiddleware

# light database layer for getting package info out of mysql
from database import Database

# all of the code that deals with client/server interaction is inside this class		
class Server(object):

	def auth(self,callback):
		def wrapper(*a, **ka):
			session = bottle.request.environ.get('beaker.session')
			if session and 'authenticated' in session:
				return callback(*a, **ka)
			else:
				return bottle.abort(401,"Access denied")
		return wrapper
	
	
	def __init__(self):	
		self.database = Database()	

		# load templates #
		# -------------- #

		env = Environment(loader=FileSystemLoader('/opt/PlugUI/templates'))


		coreTemplate		= env.get_template("core.html")
		dashboardTemplate	= env.get_template("dashboard.html")
		settingsTemplate	= env.get_template("settings.html")
		fileListTemplate    = env.get_template("filelist.html")
		packageListTemplate	= env.get_template("packagelist.html")
		
	
	
		fourOhFourTemplate	= env.get_template("404.html")


		# create wsgi bottle apps #
		# ---------------------- #

		self.web = bottle.Bottle()

		@self.web.error(404)
		def error404(error):		
			return fourOhFourTemplate.render()
			
			
		@self.web.get('/')
		def dashboard():
			return coreTemplate.render()
				
		@self.web.get('/dashboard')
		def dashboard():
			return dashboardTemplate.render()

		@self.web.get('/files')
		def dashboard():
			return fileListTemplate.render()
			
		@self.web.get('/packages')
		def dashboard():
			return packageListTemplate.render()
			
		@self.web.get('/settings')
		def dashboard():
			return settingsTemplate.render()
			
									
		# static files, this wont be called in production as nginx will instead reach in and serve files directly 
		@self.web.get('/static/<filepath:path>')
		def server_static(filepath):
			return bottle.static_file(filepath, root='/opt/PlugUI/static')
							
							
							
							
		# simple server stats api, to be called from js in the client
		@self.web.post('/statusapi')
		def statusapi():
			response = {}
			response['success'] = True
			response['diskuse'] = privateapi.core.getdiskuse()
			response['memused'] = psutil.phymem_usage().percent
			response['cpu'] = psutil.cpu_percent()
			response['loadavg'] = privateapi.core.getloadavg()
			response['uptime'] = privateapi.core.getuptime()
			response['memory_total'] = privateapi.core.getmemory_total()
			return response
					
		@self.web.post('/pacmanapi')
		def pacmanapi():
			response = {}
			response['success'] = False
			apicmd = bottle.request.forms.apicmd
			
			if apicmd == "list_installed":
				#package_list = privateapi.pacman.list_installed()
				pass #unused function
			elif apicmd == "list_updates":
				response['output'] = privateapi.pacman.list_upgrades()
				response['success'] = True
			elif apicmd == "do_upgrade":
				response['output'] = privateapi.pacman.doupdateos()
				response['success'] = True
				privateapi.maintenance.update_counter()
			return response

		@self.web.post('/systemapi')
		def systemapi():
			response = {}
			response['success'] = False
			apicmd = bottle.request.forms.apicmd
			
			if apicmd == "execute":
				command = bottle.request.forms.command.strip('\n')
				try:
					response['output'] = privateapi.core.runcommand(command)
					response['success'] = True
				except:
					pass
			elif apicmd == "reboot":
				response['output'] = privateapi.core.rebootnow()
				response['success'] = True
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
		

	
		@self.web.post('/fileapi')	
		def fileapi():
			response = {}
			response['success'] = False
			def nodot(item): 
				return item[0] != '.'
		
		
	
			apicmd = bottle.request.forms.apicmd
			print apicmd
			if apicmd == 'directory_list':
				dirs = []
				rawpath = bottle.request.forms.path
				directory = "/media/" + posixpath.normpath(urllib2.unquote(rawpath)).rstrip('.').strip('/')
				print "getting dirlist"
				
				if re.match("/media", directory):
					print "dir matches"
					response['requestpath'] = directory
					response['validpath'] = True
					try:
						for file in filter(nodot, os.listdir(directory)):
							try:
								currentfile = {}
								fullpath = os.path.join(directory,file)
								if os.path.isdir(fullpath):
									currentfile['fullpath'] = fullpath
									currentfile['directory'] = directory
									currentfile['text'] = file
									currentfile['iconCls'] = 'directory'
									currentfile['folder'] = True
									currentfile['disabled'] = False
									size = os.path.getsize(fullpath)
									currentfile['size'] = privateapi.core.prettyfilesize(size)
									currentfile['date'] = str(datetime.datetime.fromtimestamp(os.path.getmtime(fullpath)))
								else:
									extension = os.path.splitext(file)[1][1:] # get .ext and remove dot
									currentfile['fullpath'] = fullpath
									currentfile['directory'] = directory
									currentfile['text'] = file
									currentfile['iconCls'] = 'file-' + extension
									currentfile['folder'] = False
									currentfile['disabled'] = False
									size = os.path.getsize(fullpath)
									currentfile['size'] = privateapi.core.prettyfilesize(size)
									currentfile['date'] = str(datetime.datetime.fromtimestamp(os.path.getmtime(fullpath)))
								dirs.append(currentfile)
							except:
								pass
						dirs.sort(key=operator.itemgetter('text'))
						response['success'] = True
						response['files'] = dirs
						return response
					except:
						response['success'] = False
						response['validpath'] = True
						return response
				else:
					response['success'] = False
					response['validpath'] = False
					return response



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
				response['success'] = False
				rawpath = bottle.request.forms.path
				cleanpath = posixpath.normpath(urllib2.unquote(rawpath)).rstrip('.').rstrip('/')
				if re.match("/media", cleanpath):
					share = ShareForm(request.POST)
					if share.is_valid():
						share.save()
						response['success'] = True
				return response
				
			elif apicmd == 'deleteshare':
				response = dict()
				response['success'] = False
				rawpath = bottle.request.forms.path
				cleanpath = posixpath.normpath(urllib2.unquote(rawpath)).rstrip('.').rstrip('/')
				if re.match("/media", cleanpath):
					share = ShareForm(request.POST)
					if share.is_valid():
						share.save()
						response['success'] = True
				return response

		# beaker session options, configured to use memcached on localhost
		session_opts = {
  		  	'session.type': 'ext:memcached',
			'session.url': '127.0.0.1:11211',
			'session.cookie_expires'        : True,
			'session.skip_pickle'		: True,
			'session.lock_dir'		: './data',
		}
		
		# wrap the bottle wsgi app with beaker session middleware
		self.application = SessionMiddleware(self.web, session_opts)


# create a new server object, which initializes itself 
server = Server()

# this lets the wsgi server upstream find and use the wsgi application, when being run by an external server
application = server.application



bottle.run(app=application, server='gevent', host="0.0.0.0", debug=True, port=80)
