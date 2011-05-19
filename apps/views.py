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
from django.http import HttpResponseRedirect
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.template import RequestContext
from django import forms
import os
import privateapi.core
import privateapi.minidlna
import privateapi.samba
import settings

from custom_decorators import user_present

BOOLEAN_CHOICES = ( ('no', 'No'), ('yes', 'Yes'), )

class MinidlnaForm(forms.Form):	
	strict_dlna = forms.ChoiceField(choices=BOOLEAN_CHOICES)
	enable_tivo = forms.ChoiceField(choices=BOOLEAN_CHOICES)
	inotify = forms.ChoiceField(choices=BOOLEAN_CHOICES)
	#album_art_names = forms.CharField(max_length=300)
	media_dir = forms.CharField()
	port = forms.CharField()

class SambaForm(forms.Form):
        workgroup = forms.CharField(max_length=300)
	server_string = forms.CharField(max_length=300)

class SambaShare(forms.Form):
	name = forms.CharField(max_length=100)
	path = forms.CharField(max_length=300)
	comment = forms.CharField(max_length=200)
	public = forms.ChoiceField(choices=BOOLEAN_CHOICES)
	writeable = forms.ChoiceField(choices=BOOLEAN_CHOICES)

@user_present
@login_required
def index(request): 
	return render_to_response('apps/index.html', { },context_instance=RequestContext(request))

@user_present
@login_required
def install(request,package):
	packagename = package
	return render_to_response('apps/install.html', { "packagename": packagename },context_instance=RequestContext(request))

@user_present
@login_required
def minidlna(request): 
	if request.method == 'POST':
		form = MinidlnaForm(request.POST)
		if form.is_valid():
			dict = {}
			dict['strict_dlna'] = form.cleaned_data['strict_dlna']
			dict['enable_tivo'] = form.cleaned_data['enable_tivo']
			dict['media_dir'] = form.cleaned_data['media_dir']
			dict['inotify'] = form.cleaned_data['inotify']
			dict['port'] = form.cleaned_data['port']
			privateapi.minidlna.set_config(dict)
			return render_to_response('apps/minidlna.html', { "form": form },context_instance=RequestContext(request))
		else:
			return render_to_response('apps/minidlna.html', { "form": form },context_instance=RequestContext(request))
	else:
		config_dict = privateapi.minidlna.get_config()
		form = MinidlnaForm(initial=config_dict)
		return render_to_response('apps/minidlna.html', { "form": form },context_instance=RequestContext(request))

@user_present
@login_required
def samba(request):
	if request.method == 'POST':
		if request.POST['cmd'] == 'global':
			form = SambaForm(request.POST)
			if form.is_valid():
				dict = {}
				dict['workgroup'] = form.cleaned_data['workgroup']
				dict['server_string'] = form.cleaned_data['server_string']
				privateapi.samba.set_config(dict)
				return render_to_response('apps/samba.html', { "form": form },context_instance=RequestContext(request))
			else:
				return render_to_response('apps/samba.html', { "form": form },context_instance=RequestContext(request))

		elif request.POST['cmd'] == 'add_share':
			form = SambaShare(request.POST)
			if form.is_valid():
				dict = {}
				dict['name'] = form.cleaned_data['name']
				dict['path'] = form.cleaned_data['path']
				dict['comment'] = form.cleaned_data['comment']
				dict['public'] = form.cleaned_data['public']
				dict['writeable'] = form.cleaned_data['writeable']
				privateapi.samba.add_share(dict)
				return render_to_response('apps/samba.html', { "form": form },context_instance=RequestContext(request))
			else:
				return render_to_response('apps/samba.html', { "form": form },context_instance=RequestContext(request))

	else:
		full_dict = privateapi.samba.get_config()
		shares = []
		for item, dict in full_dict.items():
        		if dict['name'] == "global":
                		pass
        		else:
				shares.append(dict)
		options_list = full_dict['global']['options']
		form_dict = {}
		for option in options_list:
			try:
				if option["workgroup"]:
					form_dict['workgroup'] = option["workgroup"]
			except:
				pass
			try:
				if option["server string"]:
					form_dict['server_string'] = option["server string"]
			except:
				pass
		form = SambaForm(initial=form_dict)
		return render_to_response('apps/samba.html', { "form": form, "shares": shares },context_instance=RequestContext(request))
