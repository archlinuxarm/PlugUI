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
from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.http import HttpResponseRedirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect
from custom_decorators import user_present

@user_present
@login_required
def index(request):
	user_list = User.objects.all()
	contents = { "user_list": user_list } 
	return render_to_response('users/index.html', contents, context_instance=RequestContext(request))

@user_present
@login_required
def create(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            new_user = form.save()
            return HttpResponseRedirect("/users/show")
    else:
        form = UserCreationForm()
    return render_to_response('users/create.html', { 'form': form, }, context_instance=RequestContext(request))
	
def createdefaultuser(request):
	if request.method == 'POST':
		try:
			users = User.objects.get()
			return HttpResponseRedirect('/')
		except:
			form = UserCreationForm(request.POST)
			if form.is_valid():
				new_user = form.save()
				return HttpResponseRedirect('/')
	else:
		try:
			users = User.objects.get()
			return HttpResponseRedirect('/')
		except:
			form = UserCreationForm()
	return render_to_response('users/createdefaultuser.html', { 'form': form, }, context_instance=RequestContext(request))


@user_present
@login_required
def delete(request):
	if request.method == 'POST':
		name = request.POST.get('name')
		user = User.objects.get(username=name)
		user.delete()
		return HttpResponseRedirect("/users/show")
	else:
		return HttpResponseRedirect("/users/show")
	return render_to_response('users/show.html', {}, context_instance=RequestContext(request))
