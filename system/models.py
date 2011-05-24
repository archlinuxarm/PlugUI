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

from django.db import models
from datetime import datetime

class SystemStats(models.Model):

	updatecount = models.CharField(max_length=256,editable=True)
	updatesavailable = models.BooleanField(default=False,editable=True)
	publicip = models.CharField(max_length=12,editable=True)
	ipchecktime = models.DateTimeField()
	
	def __unicode__(self):
		return u'System stats'
		
	def save(self):
		self.id=1
		self.ipchecktime = datetime.now()
		super(SystemStats, self).save()

	def delete(self):
		pass

class AvailableUpdate(models.Model):
	name = models.CharField(max_length=256,editable=True)
	currentversion = models.CharField(max_length=256,editable=True)
	newversion = models.CharField(max_length=256,editable=True)

class MaintenanceStats(models.Model):
	last_maintenance = models.DateTimeField()
	def __unicode__(self):
		return u'Maintenance stats'
		
	def save(self, *args, **kwargs):
		self.id = 1
		self.last_maintenance = datetime.now()
		super(MaintenanceStats, self).save(*args, **kwargs)

	def delete(self):
		pass
		
class PlugappsNewsEntry(models.Model):
	title = models.CharField(max_length=256)
	description = models.TextField()
	#date = models.DateField()
	link = models.CharField(max_length=256)