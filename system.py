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
from django.http import HttpResponseRedirect,HttpResponse
from django.template import RequestContext
from django import forms
import privateapi.core
import privateapi.pacman
from system.models import MaintenanceStats
from system.models import SystemStats
from system.models import AvailableUpdate
from django.contrib.auth.decorators import login_required

from custom_decorators import user_present

class AdvancedForm(forms.Form):
	TRIGGER_CHOICES = (
		('none', 'No Trigger'),
		('nand-disk', 'NAND Activity'),
		('mmc0', 'SD Activity'),
		('timer', 'Timer'),
		('heartbeat', 'Heartbeat'),
		('default-on', 'Default on'),
	)
	green_trigger = forms.ChoiceField(choices=TRIGGER_CHOICES)
	orange_trigger = forms.ChoiceField(choices=TRIGGER_CHOICES)
	red_trigger = forms.ChoiceField(choices=TRIGGER_CHOICES)
	AUTOMOUNT_CHOICES = (
		('false', 'No'),
		('true', 'Yes'),
	)	
	sdautomount = forms.ChoiceField(choices=AUTOMOUNT_CHOICES)
	usbautomount = forms.ChoiceField(choices=AUTOMOUNT_CHOICES)

@user_present
@login_required
def about(request):
	localip = privateapi.core.getlocalip()
	publicip = privateapi.core.getpublicip()
	currentuptime = privateapi.core.getuptime() 
	load = privateapi.core.getloadavg()
	memfree = privateapi.core.getmemory_free() 
	memtotal = privateapi.core.getmemory_total()
	memused = str(int(memtotal) - int(memfree))
	percentused = str(100 - int(privateapi.core.getmemory_percent()))
	kernelversion = privateapi.core.getkernelversion()
	devicename = privateapi.core.getdevicename()
	processor = privateapi.core.getprocessor()
	architecture = privateapi.core.getarchitecture()
	stats = {	"currentuptime": currentuptime, 
				"load": load, 
				"memused": memused, 
				"memfree": memfree, 
				"memtotal": memtotal, 
				"percentused": percentused, 
				"localip": localip, 
				"publicip": publicip, 
				"kernelversion": kernelversion, 
				"devicename": devicename, 
				"processor": processor, 
				"architecture": architecture } 
	return render_to_response('system/about.html', stats, context_instance=RequestContext(request))

@user_present
@login_required
def storage(request):
	devices = privateapi.core.storage_details()
	stats = { "devices": devices }
	return render_to_response('system/storage.html', stats, context_instance=RequestContext(request))

@user_present
@login_required   
def networking(request):
	localip = privateapi.core.getlocalip()
	stats = { "localip": localip }
	return render_to_response('system/networking.html', stats, context_instance=RequestContext(request))

@user_present    
@login_required  
def software(request):
	installed_packages = privateapi.pacman.list_installed()
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
	return render_to_response('system/software.html', { "updatecount": updatecount, "updatesavailable": updatesavailable, "packagelist": packagelist, "installed_packages": installed_packages }, context_instance=RequestContext(request))

@user_present
@login_required
def reboot(request):
	return render_to_response('system/reboot.html', {}, context_instance=RequestContext(request))


@user_present
@login_required
def shell(request):
	return render_to_response('system/shell.html', {}, context_instance=RequestContext(request))
		
@user_present
@login_required
def advanced(request):
	try:
		maintenance_stats = MaintenanceStats.objects.get(id=1)
		last_maintenance = privateapi.core.getlocaltime(maintenance_stats.last_maintenance)
	except:
		last_maintenance = 'some point in the near future'
	show_led = dict()
	show_led['green'] = False
	show_led['orange'] = False
	show_led['red'] = False
	led_dict = privateapi.core.get_leds()
	if led_dict['green_present']:
		show_led['green'] = True
	if led_dict['orange_present']:
		show_led['orange'] = True
	if led_dict['red_present']:
		show_led['red'] = True
	if request.method == 'POST':
		formdata = request.POST
		try:
			privateapi.core.set_led('green',formdata['green_trigger'])
		except:
			pass
		try:
			privateapi.core.set_led('orange',formdata['orange_trigger'])
		except:
			pass
		try:
			privateapi.core.set_led('red',formdata['red_trigger'])
		except:
			pass
		if 'true' in formdata['usbautomount']:
			usbsetting = True
		else:
			usbsetting = False
		if 'true' in formdata['sdautomount']:
			sdsetting = True
		else:
			sdsetting = False				
		privateapi.core.set_automount(usb=usbsetting,sd=sdsetting)
		return HttpResponseRedirect("/system/advanced")

	else:
		automount_dict = privateapi.core.get_automount()
		if automount_dict['usbautomount'] == True:
			automount_dict['usbautomount'] = 'true'
		elif automount_dict['usbautomount'] == False:
			automount_dict['usbautomount'] = 'false'
		if automount_dict['sdautomount'] == True:
			automount_dict['sdautomount'] = 'true'
		elif automount_dict['sdautomount'] == False:
			automount_dict['sdautomount'] = 'false'			
			
		form_dict = dict(led_dict.items() + automount_dict.items())
		form = AdvancedForm(initial=form_dict)
		
	return render_to_response('system/advanced.html', { "form": form, "last_maintenance": last_maintenance, "show_led": show_led }, context_instance=RequestContext(request))
	
