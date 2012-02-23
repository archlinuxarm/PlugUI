"""
Copyright (c) 2012, Stephen Oliver (mrsteveman1@gmail.com)
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
from django.conf import settings
from django.views.generic.simple import redirect_to
from django.contrib.auth.views import password_change_done

urlpatterns = patterns('',
	(r'^static/(?P<path>.*)$', 'django.views.static.serve',
        {'document_root': settings.STATIC_DOC_ROOT}),
	
	(r'^fileapi$', 'api.views.fileapi'),
	(r'^uploadapi$', 'api.views.uploadapi'),
	(r'^statusapi$', 'api.views.statusapi'),
	(r'^userapi$', 'api.views.userapi'),
	(r'^pacmanapi$', 'api.views.pacmanapi'),
	(r'^systemapi$', 'api.views.systemapi'),
	(r'^maintenanceapi$', 'api.views.maintenanceapi'),
	
	(r'^storage$', 'system.views.storage', {}, 'storage'),
	(r'^software$', 'system.views.software', {}, 'software'),
	(r'^networking$', 'system.views.networking', {}, 'networking'),
	(r'^reboot$', 'system.views.reboot', {}, 'reboot'),
	(r'^advanced', 'system.views.advanced', {}, 'advanced'),
	(r'^shell', 'system.views.shell', {}, 'shell'),
	(r'^system', 'system.views.about', {}, 'system'),
	
	
	(r'^browse', 'files.views.browse', {}, 'browse'),
	(r'^shares', 'files.views.shares', {}, 'shares'),
	(r'^addshare', 'files.views.addshare', {}, 'addshare'),
	(r'^deleteshare', 'files.views.deleteshare', {}, 'deleteshare'),
	(r'^download/(?P<shareuuid>\w+)', 'files.views.downloadshare', {}, 'downloadshare'),
	
	
	(r'^samba', 'apps.views.samba', {}, 'samba'),
	(r'^minidlna', 'apps.views.minidlna', {}, 'minidlna'),
	(r'^app_list', 'apps.views.list', {}, 'apps'),
	(r'^install_app/(?P<package>\w{1,50})/$', 'apps.views.install'),
	
	(r'^create_user$', 'users.views.create', {}, 'createuser'),
	(r'^create_default_user$', 'users.views.createdefaultuser', {}, 'createdefaultuser'),
	(r'^deleteuser$', 'users.views.delete', {}, 'deleteuser'),
	(r'^login', 'django.contrib.auth.views.login', {'template_name': 'users/login.html'}, 'login'),
	(r'^logout', 'django.contrib.auth.views.logout', {'template_name': 'users/logout.html'}, 'logout'),
	(r'^change_password', 'django.contrib.auth.views.password_change', { 'template_name': 'users/password_change.html' , 'post_change_redirect': '#'} ),
	(r'^user_list', 'users.views.list', {}, 'user_list'),
	
	
	(r'^home', 'index.home', {}, 'home'),
	(r'^$', 'index.index', {}, 'index'),
)