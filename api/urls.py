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

from django.conf.urls.defaults import *

urlpatterns = patterns('',

	(r'^isinstalled/(?P<package>\w{1,50})/$', 'api.views.isinstalled'),
	(r'^isrunning/(?P<package>\w{1,50})/$', 'api.views.isrunning'),
	(r'^startapp/(?P<package>\w{1,50})/$', 'api.views.startapp'),
	(r'^stopapp/(?P<package>\w{1,50})/$', 'api.views.stopapp'),
	(r'^install/(?P<package>\w{1,50})/$', 'api.views.install'),

	(r'^doupdateos$', 'api.views.doupdateos'),
	(r'^listupgrades$', 'api.views.listupgrades'),
	(r'^checkforupdates$', 'api.views.checkforupdates'),
	(r'^list_installed$', 'api.views.list_installed'),
	
	(r'^runcommand$', 'api.views.runcommand'),

	(r'^rebootnow$', 'api.views.rebootnow'),
	(r'^maintenance$', 'api.views.maintenance'),
	(r'^fileapi$', 'api.views.fileapi'),
	

	(r'^diskuse$', 'api.views.diskuse'),
	(r'^loadavg$', 'api.views.loadavg'),
	(r'^entropy$', 'api.views.entropy'),
	(r'^uptime$', 'api.views.uptime'),
	(r'^memory_total$', 'api.views.memory_total'),
	(r'^memory_free$', 'api.views.memory_free'),
	(r'^memory_percent$', 'api.views.memory_percent'),
	
)
