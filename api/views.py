"""
Copyright (c) 2011, Steve Oliver (mrsteveman1@gmail.com)
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the 
      documentation and/or other materials provided with the distribution.
    * Neither the name of the <organization> nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY STEVE OLIVER ''AS IS'' AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL STEVE OLIVER BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;                    
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND 
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE."""
from django.http import HttpResponse
from django.utils import simplejson
from django import forms
from django.contrib.auth.decorators import login_required
import urllib, os, shutil, traceback, sys, shlex, datetime, locale, re, operator, posixpath

import privateapi.core 
import privateapi.pacman
import privateapi.minidlna
import privateapi.samba
import privateapi.maintenance
import files.views as files
import users.views as users 
from files.models import ShareForm
from system.models import MaintenanceStats
from system.models import AvailableUpdate
from system.models import SystemStats

@login_required
def maintenanceapi(request):
	response = dict()
	try:
		privateapi.maintenance.run_maintenance()
		maintenance_stats = MaintenanceStats.objects.get(id=1)
		prettytime = privateapi.core.getlocaltime(maintenance_stats.last_maintenance).strftime('%B %d, %Y, %I:%M%p')
		response['last_maintenance'] = prettytime
		response['success'] = True
	except:
		response['success'] = False
		response['last_maintenance'] = 'Unknown'
	return HttpResponse(simplejson.dumps(response),content_type = 'application/javascript; charset=utf8')
	
@login_required
def appapi(request):
	response = {}
	response['success'] = False
	if request.method == 'POST':
		apicmd = request.POST['apicmd']
		if apicmd == "check_install":
			package = request.POST['package']
			if getattr(privateapi, package).is_installed():
				response['success'] = True
				response['installed'] = True
			else:
				response['installed'] = False
		elif apicmd == "check_running":
			package = request.POST['package']
			if getattr(privateapi, package).is_running():
				response['success'] = True
				response['running'] = True
			else:
				response['running'] = False
		elif apicmd == "install_package":
			response['output'] = privateapi.pacman.install(package)
			response['success'] = True
		elif apicmd == "startapp":
			package = request.POST['package']
			if getattr(privateapi, package).start():
				response['success'] = True
		elif apicmd == "stop_app":
			package = request.POST['package']
			if getattr(privateapi, package).stop():
				response['success'] = True
	else:
		pass
	return HttpResponse(simplejson.dumps(response),content_type = 'application/javascript; charset=utf8')
		
	
	
@login_required
def pacmanapi(request):
	response = {}
	response['success'] = False
	if request.method == 'POST':
		apicmd = request.POST['apicmd']
		if apicmd == "list_installed":
			package_list = privateapi.pacman.list_installed()
			if package_list:
				response['success'] = True
				counter = 0
				for package in package_list:
					packagedict = dict()
					packagedict['name'] = package[0]
					packagedict['version'] = package[1]
					response[counter] = packagedict
					counter += 1
				response['numberofpackages'] = counter
			else:
				response['success'] = False
		elif apicmd == "check_for_updates":
			privateapi.maintenance.update_counter()
			systemstats = SystemStats.objects.get(id=1)
			if systemstats.updatesavailable:
				returnlist['hasupgrades'] = True
				availableupdates = AvailableUpdate.objects.all()
				packagelist = []
				for package in availableupdates:
					if ":" in package.name:
						pass
					else:
						packagedict = dict()
						packagedict['name'] = package.name
						packagedict['newversion'] = package.newversion
						packagelist.append(packagedict)
				response['packages'] = packagelist
				response['numberofpackages'] = len(packagelist)
			else:
				response['hasupgrades'] = False
			response['success'] = True
		elif apicmd == "list_updates":
			response['output'] = privateapi.pacman.list_upgrades()
			response['success'] = True
		elif apicmd == "do_upgrade":
			response['output'] = privateapi.pacman.doupdateos()
			response['success'] = True
			privateapi.maintenance.update_counter()
	# dont do anything on GET requests and success = false will be returned as json		
	else:
		pass
	return HttpResponse(simplejson.dumps(response),content_type = 'application/javascript; charset=utf8')
			

@login_required
def systemapi(request):
	response = {}
	response['success'] = False
	if request.method == 'POST':
		apicmd = request.POST['apicmd']
		if apicmd == "execute":
			command = formdata['command'].strip('\n')
			try:
				response['output'] = privateapi.core.runcommand(command)
				response['success'] = True
			except:
				pass
		elif apicmd == "reboot":
			response['output'] = privateapi.core.rebootnow()
			response['success'] = True
	else:
		pass
	return HttpResponse(simplejson.dumps(response),content_type = 'application/javascript; charset=utf8')
		
	
	
	
@login_required
def statusapi(request):
	response = {}
	response['success'] = False
	response['diskuse'] = privateapi.core.getdiskuse()
	response['loadavg'] = privateapi.core.getloadavg()
	response['entropy'] = privateapi.core.getentropy()
	response['uptime'] = privateapi.core.getuptime()
	response['memory_total'] = privateapi.core.getmemory_total()
	response['memory_free'] = privateapi.core.getmemory_free()
	response['memory_percent'] = privateapi.core.getmemory_percent()
	return HttpResponse(simplejson.dumps(response),content_type = 'application/javascript; charset=utf8')

def userapi(request):
	pass

def downloadshare(request,shareuuid=''):
	share = Share.objects.get(uuid=shareuuid)
	path = share.path
	response = privateapi.core.streamfile(path,"download")
	return response
	
class UploadFileForm(forms.Form):
	file  = forms.FileField()	

def handle_uploaded_file(f):
	destination = open('/var/lib/PlugUI/data/uploads/' + f.name, 'wb+')
	for chunk in f.chunks():
		destination.write(chunk)
	destination.close()
		
@login_required
def uploadapi(request):
	if request.method == 'POST':
		form = UploadFileForm(request.POST, request.FILES)
		if form.is_valid():
			for file in request.FILES:
				handle_uploaded_file(file)
			return HttpResponse(request.FILES)
	return HttpResponse(request.FILES)
	
@login_required	
def fileapi(request):
	def nodot(item): 
		return item[0] != '.'
		
		
	
	if request.method == 'POST':
		apicmd = request.POST['apicmd']
		if apicmd == 'directory_list':
			dirs = []
			response = {}
			rawpath = request.POST['path']
			directory = "/media/" + posixpath.normpath(urllib.unquote(rawpath)).rstrip('.').strip('/')
			response['requestpath'] = directory
			if re.match("/media", directory):
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
				except:
					response['success'] = False
					response['validpath'] = True
			else:
				response['success'] = False
				response['validpath'] = False
			return HttpResponse(simplejson.dumps(response),content_type = 'application/javascript; charset=utf8')
			
		if apicmd == 'rename':
				response = dict()
				oldname = '/media/' + urllib.unquote(request.POST['oldname'])
				newname = '/media/' + urllib.unquote(request.POST['newname'])
				if os.path.exists(oldname):
					try:
						os.rename(oldname,newname)
						response['success'] = True
					except:
						response['success'] = False
						response['error'] = 'Cannot rename file %s to %s' %(oldname,newname)
				else:
					response['success'] = False
					response['error'] = 'Cannot rename file %s to %s' %(oldname,newname)
				return HttpResponse(simplejson.dumps(response),content_type = 'application/javascript; charset=utf8')
				
		if apicmd == 'newdir':
			response = dict()
			dir = '/media/' + urllib.unquote(request.POST['dir'])
			try:
				os.mkdir(dir)
				response['success'] = True
			except:
				response['success'] = False
				response['error'] = 'Cannot create directory: %s' %(dir)
			return HttpResponse(simplejson.dumps(response),content_type = 'application/javascript; charset=utf8')
					
		if apicmd == 'delete':
			response = dict()
			rawpath = request.POST['file']
			path = "/media/" + posixpath.normpath(urllib.unquote(rawpath)).rstrip('.')
			if re.match("/media", path):
				if os.path.isdir(path):
					try:
						shutil.rmtree(path)
						response['success'] = True
					except:
						response['success'] = False
						response['error'] = 'Cannot delete directory: %s' %(path)
				else:
					try:
						os.remove(path)
						response['success'] = True
					except:
						response['success'] = False
						response['error'] = 'Cannot delete file: %s' %(path)
			else:
				response['success'] = False
				response['error'] = 'Cannot delete: %s' %(path)				
			return HttpResponse(simplejson.dumps(response),content_type = 'application/javascript; charset=utf8')
			


		if apicmd == 'download':
			rawpath = request.POST['path']
			path = "/media/" + posixpath.normpath(urllib.unquote(rawpath)).rstrip('.')
			if re.match("/media", path):
				try:
					response = privateapi.core.streamfile(path,"download")
				except:
					response = HttpResponse("Cannot download file: %s" % path)
			else:
				HttpResponse("Cannot download file: %s" % path)
			return response

		if apicmd == 'view':
			rawpath = request.POST['path']
			path = "/media/" + posixpath.normpath(urllib.unquote(rawpath)).rstrip('.')
			if re.match("/media", path):
				try:
					response = privateapi.core.streamfile(path,"view")
				except:
					response = HttpResponse("Cannot view file: %s" % path)
			else:
				response = HttpResponse("Cannot view file: %s" % path)
			return response

		if apicmd == 'addshare':
			response = dict()
			response['success'] = False
			rawpath = request.POST['path']
			cleanpath = posixpath.normpath(urllib.unquote(rawpath)).rstrip('.').rstrip('/')
			if re.match("/media", cleanpath):
				share = ShareForm(request.POST)
				if share.is_valid():
					share.save()
					response['success'] = True
			return HttpResponse(simplejson.dumps(response),content_type = 'application/javascript; charset=utf8')

		if apicmd == 'deleteshare':
			response = dict()
			response['success'] = False
			rawpath = request.POST['path']
			cleanpath = posixpath.normpath(urllib.unquote(rawpath)).rstrip('.').rstrip('/')
			if re.match("/media", cleanpath):
				share = ShareForm(request.POST)
				if share.is_valid():
					share.save()
					response['success'] = True
			return HttpResponse(simplejson.dumps(response),content_type = 'application/javascript; charset=utf8')			
				
	else:
		apicmd = request.GET['apicmd']
		if apicmd == 'stream':
			rawpath = request.GET['path']
			path = "/media/" + posixpath.normpath(urllib.unquote(rawpath)).rstrip('.')
			if re.match("/media", path):
				try:
					return privateapi.core.streamfile(path,"view")
				except:
					response = dict()
					response['success'] = False
					return HttpResponse(simplejson.dumps(response),content_type = 'application/javascript; charset=utf8')
			else:
				response = dict()
				response['success'] = False
				return HttpResponse(simplejson.dumps(response),content_type = 'application/javascript; charset=utf8')
