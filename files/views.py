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

from django.shortcuts import render_to_response
from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.template import RequestContext
from django.contrib.auth.decorators import login_required
from files.models import ShareForm
from files.models import Share
from django.conf import settings
from django.views.decorators.http import condition
from django.utils import simplejson

import privateapi.core

from custom_decorators import user_present

import uuid, urllib, base64, sys, mimetypes, os, posixpath, re

@user_present
@login_required	
def browse(request):
    return render_to_response('files/browse.html', {}, context_instance=RequestContext(request))

@user_present
@login_required
def shares(request):
	sharelist = Share.objects.all()
	for share in sharelist:
		share.filename = os.path.basename(share.path)
	hostname = privateapi.core.gethostname()
	plugid = privateapi.core.getplugid()
	localip = privateapi.core.getlocalip()
	publicip = privateapi.core.getpublicip()
	port = privateapi.core.getport()
	return render_to_response('files/shares.html', { "sharelist": sharelist, "port": port, "hostname": hostname, "plugid": plugid, "localip": localip, "publicip": publicip }, context_instance=RequestContext(request))

@condition(etag_func=None)
def downloadshare(request,shareuuid=''):
	share = Share.objects.get(uuid=shareuuid)
	path = share.path
	response = privateapi.core.streamfile(path,"download")
	return response

@login_required
def addshare(request):
	if request.method == 'POST':
		rawpath = request.POST['path']
		cleanpath = posixpath.normpath(urllib.unquote(rawpath)).rstrip('.').rstrip('/')
		if re.match("/media", cleanpath):
			warning = ""
		else:
			warning = "Only files under the /media directory can be shared"
		shareuuid = base64.b64encode(str(uuid.uuid4()))
		share = Share(uuid=shareuuid[:10],path=cleanpath,public = True)
		form = ShareForm(instance=share)
		return render_to_response('files/addshare.html', { "form": form, "warning": warning }, context_instance=RequestContext(request))
		
@user_present
@login_required
def deleteshare(request):
	if request.method == 'POST':
		shareuuid = request.POST['uuid']
		share = Share.objects.get(uuid=shareuuid)
		share.delete()
		return HttpResponse(simplejson.dumps({ "success": True }),content_type = 'application/javascript; charset=utf8')
	return HttpResponse(simplejson.dumps({ "success": False }),content_type = 'application/javascript; charset=utf8')
			
@user_present
@login_required	
def upload(request):
    return render_to_response('files/upload.html', {}, context_instance=RequestContext(request))
	
	
