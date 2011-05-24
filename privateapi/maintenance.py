#!/usr/bin/env python 
# coding: utf8
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

import shlex, subprocess, re, socket, os, httplib, urllib
import feedparser
from system.models import PlugappsNewsEntry
from system.models import MaintenanceStats
from system.models import SystemStats
from system.models import AvailableUpdate
import privateapi.pacman
import privateapi.core


def update_counter():
	systemstats = SystemStats()
	availableupdates = AvailableUpdate.objects.all()
	availableupdates.delete()
	if privateapi.pacman.check():
		upgradelist = privateapi.pacman.list_upgrades()
		for package in upgradelist:
			if ":" in package:
				pass
			else:
				print package
				packagearray = shlex.split(package)
				availableupdate = AvailableUpdate()
				availableupdate.name = packagearray[0]
				availableupdate.newversion = packagearray[1]
				availableupdate.save()
		systemstats.updatecount = str(len(upgradelist))
		systemstats.updatesavailable = True
	else:
		systemstats.updatesavailable = False
		systemstats.updatecount = "0"
	systemstats.save()
	
	
def update_plugapps_news():
	PlugappsNewsEntry.objects.all().delete()
	plugappsfeed = feedparser.parse("http://plugapps.com/feed")
	feed_items = plugappsfeed['entries']
	for story in feed_items:
		item = PlugappsNewsEntry()
		item.title = story['title']
		item.description = story['description']
		#item.date = story['date']
		item.link = story['link']
		item.save()

def update_plug_location():
	plugid = privateapi.core.getplugid()
	localip = privateapi.core.getlocalip()
	publicip = privateapi.core.getpublicip()
	port = privateapi.core.getport()
	params = urllib.urlencode( { 'plugid': plugid, 'localip': localip, 'port': port } )
	headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/plain"}
	conn = httplib.HTTPConnection("plugfinder.appspot.com:80")
	conn.request("POST", "/", params, headers)
	conn.close()

def run_maintenance():
	update_counter()
	#update_plugapps_news()
	update_plug_location()
	if privateapi.pacman.check():
		privateapi.pacman.list_upgrades()
	maintenancestats = MaintenanceStats()
	maintenancestats.save()
