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
from django.views.generic.simple import redirect_to
from django.contrib.auth.views import password_change_done

urlpatterns = patterns('',
	(r'^create$', 'users.views.create', {}, 'createuser'),
	(r'^createdefaultuser$', 'users.views.createdefaultuser', {}, 'createdefaultuser'),
	(r'^delete$', 'users.views.delete', {}, 'deleteuser'),
	(r'^show', 'users.views.index', {}, 'users'),
	(r'^login', 'django.contrib.auth.views.login', {'template_name': 'users/login.html'}, 'login'),
	(r'^logout', 'django.contrib.auth.views.logout', {'template_name': 'users/logout.html'}, 'logout'),
	(r'^password_change', 'django.contrib.auth.views.password_change', { 'template_name': 'users/password_change.html' , 'post_change_redirect': '/users/show'} ),
	(r'^$', redirect_to, {'url': '/users/show'}),
)
