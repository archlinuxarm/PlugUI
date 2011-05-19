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
from django.template import RequestContext

from django.contrib.auth.decorators import login_required

from system.models import SystemStats
from system.models import AvailableUpdate
#from home.models import PlugappsNewsEntry

from custom_decorators import user_present

@user_present
@login_required
def index(request):
	#news_list = PlugappsNewsEntry.objects.all()
	try:
		systemstats = SystemStats.objects.get(id=1)
		updatesavailable = systemstats.updatesavailable
		updatelist = AvailableUpdate.objects.all()
		packagelist = []
		for package in updatelist:
			if ":" in package.name:
				pass
			else:
				packagedict = dict()
				packagedict['name'] = package.name
				packagedict['newversion'] = package.newversion
				packagelist.append(packagedict)	
		updatecount = len(packagelist)
	except:
		updatecount = "0"
		updatesavailable = False
	return render_to_response('home.html', {"updatecount": updatecount, "updatesavailable": updatesavailable }, context_instance=RequestContext(request))
	#return render_to_response('home.html', {"updatecount": updatecount, "updatesavailable": updatesavailable, "news_list": news_list }, context_instance=RequestContext(request))
