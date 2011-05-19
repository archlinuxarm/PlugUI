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

import privateapi.core 
import privateapi.pacman
import privateapi.minidlna
import privateapi.samba
import privateapi.maintenance
from files.models import ShareForm
from system.models import MaintenanceStats
from system.models import AvailableUpdate
from system.models import SystemStats
from django.contrib.auth.decorators import login_required

import urllib, os, shutil, traceback, sys, shlex, datetime, locale, re, operator, posixpath

@login_required
def install(request,package):
	output = privateapi.pacman.install(package)
	return HttpResponse(simplejson.dumps(output),content_type = 'application/javascript; charset=utf8')

@login_required
def maintenance(request):
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
def isinstalled(request,package):
	if getattr(privateapi, package).is_installed():
		return HttpResponse('True')
	return HttpResponse('False')
   
@login_required
def isrunning(request,package):
	if getattr(privateapi, package).is_running():
		return HttpResponse('True')
	return HttpResponse('False')
    
@login_required 
def startapp(request,package):
	if getattr(privateapi, package).start():
		return HttpResponse('True')
	return HttpResponse('False')
    
@login_required 
def stopapp(request,package):
	if getattr(privateapi, package).stop():
		return HttpResponse('True')
	return HttpResponse('False')
    
@login_required
def doupdateos(request):
    pacman_output = privateapi.pacman.doupdateos()
    privateapi.maintenance.update_counter()
    return HttpResponse(pacman_output)
    
@login_required
def listupgrades(request):
    return HttpResponse(privateapi.pacman.list_upgrades())

@login_required    
def checkforupdates(request):
	privateapi.maintenance.update_counter()
	systemstats = SystemStats.objects.get(id=1)
	returnlist = dict()
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
		returnlist['packages'] = packagelist
		returnlist['numberofpackages'] = len(packagelist)
	else:
		returnlist['hasupgrades'] = False
	return HttpResponse(simplejson.dumps(returnlist),content_type = 'application/javascript; charset=utf8')

@login_required    
def list_installed(request):
	package_list = privateapi.pacman.list_installed()
	returnlist = dict()
	if package_list:
		returnlist['success'] = True
		counter = 0
		for package in package_list:
			packagedict = dict()
			packagedict['name'] = package[0]
			packagedict['version'] = package[1]
			returnlist[counter] = packagedict
			counter += 1
		returnlist['numberofpackages'] = counter
	else:
		returnlist['success'] = False
	return HttpResponse(simplejson.dumps(returnlist),content_type = 'application/javascript; charset=utf8')


@login_required	
def rebootnow(request):
    return HttpResponse(privateapi.core.rebootnow())


def diskuse(request):
    return HttpResponse(privateapi.core.getdiskuse())


def loadavg(request):
    return HttpResponse(privateapi.core.getloadavg())


def entropy(request):
    return HttpResponse(privateapi.core.getentropy())


def uptime(request):
    return HttpResponse(privateapi.core.getuptime())


def memory_total(request):
    return HttpResponse(privateapi.core.getmemory_total())



def memory_free(request):
    return HttpResponse(privateapi.core.getmemory_free())
    
   
def memory_percent(request):
    return HttpResponse(privateapi.core.getmemory_percent())

@login_required
def runcommand(request):
	if request.method == 'POST':
		formdata = request.POST
		command = formdata['command'].strip('\n')
		response = {}
		try:
			response['output'] = privateapi.core.runcommand(command)
			response['success'] = True
		except:
			response['success'] = False
		return HttpResponse(simplejson.dumps(response))
	else:
		return HttpResponse("this API requires a POST command")
	

@login_required	
def fileapi(request):
	def nodot(item): 
		return item[0] != '.'
		
	if request.method == 'POST':
		if request.POST['cmd'] == 'get':
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
			
		if request.POST['cmd'] == 'rename':
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
				
		if request.POST['cmd'] == 'newdir':
			response = dict()
			dir = '/media/' + urllib.unquote(request.POST['dir'])
			try:
				os.mkdir(dir)
				response['success'] = True
			except:
				response['success'] = False
				response['error'] = 'Cannot create directory: %s' %(dir)
			return HttpResponse(simplejson.dumps(response),content_type = 'application/javascript; charset=utf8')
					
		if request.POST['cmd'] == 'delete':
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
			


		if request.POST['cmd'] == 'download':
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

		if request.POST['cmd'] == 'view':
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

		if request.POST['cmd'] == 'addshare':
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
		if request.GET['cmd'] == 'stream':
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
