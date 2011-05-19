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

from __future__ import division
from django.http import HttpResponse
from django.core.servers.basehttp import FileWrapper
from system.models import SystemStats
import shlex, subprocess, re, socket, os, mimetypes, httplib, urllib
from operator import itemgetter
from datetime import tzinfo, timedelta, datetime
import pytz
import ConfigParser
import hashlib

class FileIterWrapper(object):
	def __init__(self, flo, chunk_size = 1024**2):
		self.flo = flo
		self.chunk_size = chunk_size
	
	def next(self):
		data = self.flo.read(self.chunk_size)
		if data:
			return data
		else:
			raise StopIteration
	
	def __iter__(self):
		return self
	
def FormatWithCommas(format, value):
	re_digits_nondigits = re.compile(r'\d+|\D+')
	parts = re_digits_nondigits.findall(format % (value,))
	for i in xrange(len(parts)):
		s = parts[i]
		if s.isdigit():
			parts[i] = _commafy(s)
			break
	return ''.join(parts)

def _commafy(s):
	r = []
	for i, c in enumerate(reversed(s)):
		if i and (not (i % 3)):
			r.insert(0, ',')
		r.insert(0, c)
	return ''.join(r)

def prettyfilesize(size):
	length = len(str(size))
	if length >= 13 and length <= 15:
		suffix = "TB"
		size = ((((size / 1024) / 1024) / 1024) / 1024)
	if length >= 10 and length <= 12:
		suffix = "GB"
		size = (((size / 1024) / 1024) / 1024)
	if length >= 7 and length <= 9:
		suffix = "MB"
		size = ((size / 1024) / 1024)
	if length >= 4 and length <= 6:                                              
		suffix = "KB"
		size = (size / 1024)
	if length >= 0 and length <= 3:
		suffix = "B"
	return FormatWithCommas('%.2f', size) + suffix

def prettydrivesize(size):
	length = len(str(size))
	if length >= 13 and length <= 15:
		suffix = "PB"
		size = ((((size / 1024) / 1024) / 1024) / 1024)
	if length >= 10 and length <= 12:
		suffix = "TB"
		size = (((size / 1024) / 1024) / 1024)
	if length >= 7 and length <= 9:
		suffix = "GB"
		size = ((size / 1024) / 1024)
	if length >= 4 and length <= 6:                                              
		suffix = "MB"
		size = (size / 1024)
	if length >= 0 and length <= 3:
		suffix = "KB"
	return FormatWithCommas('%.2f', size) + suffix
	
def streamfile(path,type):
	f = open( path )
	mimetype = mimetypes.guess_type(f.name)
	response = HttpResponse(FileIterWrapper(f), mimetype='%s' % mimetype[0])
	response['Content-Length'] = os.path.getsize(f.name)
	if 'download' in type:
		response['Content-Disposition'] = 'attachment; filename=%s' % os.path.basename(f.name)
	else:
		response['Content-Disposition'] = 'filename=%s' % os.path.basename(f.name)
	return response
	
def runcommand(cmd):
	final = cmd.encode(encoding='ascii',errors='strict')
	args = shlex.split(final)
	process = subprocess.Popen(args,stdout=subprocess.PIPE)
	lines = []
	try:
		for line in process.stdout.readlines():
			lines.append(line)
	except:
		pass
	return lines

def mounted_devices():
    base_df_command_raw = "df"
    args = shlex.split(base_df_command_raw)
    process = subprocess.Popen(args,stdout=subprocess.PIPE,universal_newlines=True)
    mount_list = []
    for line in process.stdout.readlines():
        newoutput = line.rstrip('\n')
        if "Filesystem" in newoutput:
            continue
        elif "udev" in newoutput:
            continue
        elif "shm" in newoutput:
            continue
        else:
            components = newoutput.split()
            mount_list.append(components[0])
    return mount_list

def get_fs_for_device(device):
	cmd = "mount"
	args = shlex.split(cmd)
	process = subprocess.Popen(args,stdout=subprocess.PIPE,universal_newlines=True)
	lines = process.stdout.readlines()
	for line in lines:
			if device in line:
					components = shlex.split(line)
					return components[4]
			else:
					pass
	return "Couldn't determine"

def connected_devices():
	try:
		f = open( "/proc/partitions" )
	except:
		f.close()
		pass
	drive_list = []
	for line in f.readlines():
		newoutput = line.rstrip('\n')
		if not newoutput.strip():
			continue
		if "major" in newoutput:
			continue
		if "mtdblock" in newoutput:
			continue
		else:
			drive_details = {}
			components = newoutput.split()
			devicename = components[3]
			devicesize = components[2]
			if "sd" in devicename:
				devicename = "/dev/" + devicename
			drive_details['devicename'] = devicename
			drive_details['devicesize'] = devicesize
			drive_details['prettydevicesize'] = prettydrivesize(int(devicesize))
			drive_list.append(drive_details)
	f.close()
	return drive_list

def storage_details():
	conn = connected_devices()
	details = mount_details()
	merged = {}
	for device in conn+details:
		if device['devicename'] in merged:
			merged[device['devicename']].update(device)
		else:
			merged[device['devicename']] = device
	final = [val for (_, val) in merged.items()]
	return sorted(final, key=itemgetter('devicename'))

def mount_details():
	cmd_raw = "df"
	args = shlex.split(cmd_raw)
	process = subprocess.Popen(args,stdout=subprocess.PIPE,universal_newlines=True)
	mount_detail_list = []
	for line in process.stdout.readlines():
		newoutput = line.rstrip('\n')
		if "Filesystem" in newoutput:
			continue
		elif "udev" in newoutput:
			continue
		elif "shm" in newoutput:
			continue
		else:
			components = newoutput.split()
			mount_details = { }
			try:
				mount_details['filesystem'] = get_fs_for_device(components[0])
			except:
				mount_details['filesystem'] = "Unknown"
			try:
				mount_details['devicename'] = components[0]
			except:
				mount_details['devicename'] = "Unknown"
			try:
				mount_details['filesystemsize'] = components[1]
			except:
				mount_details['filesystemsize'] = '0'
			try:
				mount_details['prettyfilesystemsize'] = prettydrivesize(int(components[1]))
			except:
				mount_details['prettyfilesystemsize'] = '0'
			try:
				mount_details['spaceused'] = components[2]
			except:
				mount_details['spaceused'] = '0'
			try:
				mount_details['prettyspaceused'] = prettydrivesize(int(components[2]))
			except:
				mount_details['prettyspaceused'] = '0'
			try:
				mount_details['spacefree'] = components[3]
			except:	
				mount_details['spacefree'] = '0'
			try:	
				mount_details['prettyspacefree'] = prettydrivesize(int(components[3]))
			except:
				mount_details['prettyspacefree'] = '0'
			try:
				mount_details['percentused'] = components[4]
			except:
				mount_details['percentused'] = '0'
			try:
				mount_details['mountpoint'] = components[5]
			except:
				mount_details['mountpoint'] = "Unknown"
			mount_detail_list.append(mount_details)
	return mount_detail_list

def rebootnow():
       reboot_command_raw = "reboot"
       args = shlex.split(reboot_command_raw)
       process = subprocess.Popen(args)
       return "Done"

def getlocalip():

	# get the eth0 ip
	eth0cmd = """ifconfig eth0 | grep "inet addr" | awk '{ print $2 }' | sed s/addr://"""
	eth0process = subprocess.Popen(eth0cmd,stdout=subprocess.PIPE,shell=True)
	eth0ip = eth0process.stdout.read()

	# get the wlan0 ip
	wlan0cmd = """ifconfig wlan0 | grep "inet addr" | awk '{ print $2 }' | sed s/addr://"""
	wlan0process = subprocess.Popen(wlan0cmd,stdout=subprocess.PIPE,shell=True)
	wlan0ip = wlan0process.stdout.read()

	# get the usb0 ip
	usb0cmd = """ifconfig usb0 | grep "inet addr" | awk '{ print $2 }' | sed s/addr://"""
	usb0process = subprocess.Popen(usb0cmd,stdout=subprocess.PIPE,shell=True)
	usb0ip = usb0process.stdout.read()

	# get the usb1 ip
	usb1cmd = """ifconfig usb1 | grep "inet addr" | awk '{ print $2 }' | sed s/addr://"""
	usb1process = subprocess.Popen(usb1cmd,stdout=subprocess.PIPE,shell=True)
	usb1ip = usb1process.stdout.read()

	# now go through each variable to see if it has an assigned IP, most of the time unused interfaces dont have one
	if len(eth0ip) >= 8:
		ip = eth0ip
	elif len(wlan0ip) >= 8:
		ip = wlan0ip
	elif len(usb0ip) >= 8:
		ip = usb0ip
	elif len(usb1ip) >= 8:
		ip = usb1ip
	else:
		ip = '127.0.0.1'
	return ip.rstrip('\n')

def getstun():
	conn = httplib.HTTPConnection("plugfinder.appspot.com:80")
	conn.request("GET", "/stun")
	response = conn.getresponse()
	return response.read()

def getpublicip():
	try:
		systemstats = SystemStats.objects.get(id=1)
	except:
		systemstats = SystemStats()
	if systemstats.ipchecktime:
		if systemstats.ipchecktime >= datetime.now() - timedelta(hours = 1):
			systemstats.publicip = getstun()
		else:
			pass
	else:
		systemstats.publicip = getstun()
	
	systemstats.save()
	return systemstats.publicip

def getport():
	try:
		config = ConfigParser.RawConfigParser()
		config.readfp(open('/etc/plugui.conf'))
	except:
		pass
	try:
		port = config.get("Global", "port")
	except:
		port = "80"
	return port
			
def getethermac():
    cmd = """ifconfig -a | grep eth0 | awk '{ print $5 }'"""
    process = subprocess.Popen(cmd,stdout=subprocess.PIPE,shell=True)
    ethermac = process.stdout.read()
    return ethermac.rstrip('\n')

def getplugid():
	return hashlib.sha256(getethermac()).hexdigest()[:20]	

def getkernelversion():
       kernv_cmd = "uname -rv"
       args = shlex.split(kernv_cmd)
       kernv_process = subprocess.Popen(args,stdout=subprocess.PIPE)
       return kernv_process.stdout.read().rstrip('\n')

def getdevicename():
       devicename_cmd = "uname -i"
       args = shlex.split(devicename_cmd)
       devicename_process = subprocess.Popen(args,stdout=subprocess.PIPE)
       return devicename_process.stdout.read()
	   
def gethostname():
       hostname_cmd = "uname -n"
       args = shlex.split(hostname_cmd)
       hostname_process = subprocess.Popen(args,stdout=subprocess.PIPE)
       return hostname_process.stdout.read().strip(' ').rstrip('\n')

def getprocessor():
       proc_cmd = "uname -p"
       args = shlex.split(proc_cmd)
       proc_process = subprocess.Popen(args,stdout=subprocess.PIPE)
       return proc_process.stdout.read()

def getarchitecture():
       arch_cmd = "uname -m"
       args = shlex.split(arch_cmd)
       arch_process = subprocess.Popen(args,stdout=subprocess.PIPE)
       return arch_process.stdout.read()

def getdiskuse():
    cmd = """df -h | grep -e ubi0 | awk '{ print $5 }'"""
    process = subprocess.Popen(cmd,stdout=subprocess.PIPE,shell=True)
    diskuse = process.stdout.read()
    return diskuse

def getloadavg():
     try:
         f = open( "/proc/loadavg" )
         loadavg = shlex.split(f.read())
         f.close()
     except:
        return "Cannot open loadavg file: /proc/loadavg"
     return loadavg[0] + ", " + loadavg[1] + ", " + loadavg[2]

def getentropy():
    cmd = "cat /proc/sys/kernel/random/entropy_avail"
    args = shlex.split(cmd)
    process = subprocess.Popen(args,stdout=subprocess.PIPE)
    entropy = process.stdout.read()
    return entropy

def getuptime():
 
     try:
         f = open( "/proc/uptime" )
         contents = f.read().split()
         f.close()
     except:
        return "Cannot open uptime file: /proc/uptime"
 
     total_seconds = float(contents[0])
 
     # Helper vars:
     MINUTE  = 60
     HOUR    = MINUTE * 60
     DAY     = HOUR * 24
 
     # Get the days, hours, etc:
     days    = int( total_seconds / DAY )
     hours   = int( ( total_seconds % DAY ) / HOUR )
     minutes = int( ( total_seconds % HOUR ) / MINUTE )
 
     # Build up the pretty string (like this: "N days, N hours, N minutes, N seconds")
     string = ""
     if days> 0:
         string += str(days) + " " + (days == 1 and "day" or "days" ) + ", "
     if len(string)> 0 or hours> 0:
         string += str(hours) + (hours == 1 and "h" or "h" ) + ":"
     if len(string)> 0 or minutes> 0:
         string += str(minutes) + (minutes == 1 and "m" or "m")
 
     return string;


def getmemory_total():
      re_parser = re.compile(r'^(?P<key>\S*):\s*(?P<value>\d*)\s*kB' )

      result = dict()
      for line in open('/proc/meminfo'):
           match = re_parser.match(line)
           if not match:
                continue # skip lines that don't parse
           key, value = match.groups(['key', 'value'])
           result[key] = int(value)
      return int(result.get("MemTotal")) / 1024

def get_automount():
	values = dict()
	usbrulepath = '/etc/udev/rules.d/11-media-by-label-auto-mount.rules'
	sdrulepath = '/etc/udev/rules.d/11-sd-cards-auto-mount.rules'
	if os.path.isfile(usbrulepath):
		values['usbautomount'] = True
	else:
		values['usbautomount'] = False
	if os.path.isfile(sdrulepath):
		values['sdautomount'] = True
	else:
		values['sdautomount'] = False
	return values
	
def set_automount(usb,sd):
	values = dict()
	usbrulepath = '/etc/udev/rules.d/11-media-by-label-auto-mount.rules'
	usbrulepathdisabled = '/etc/udev/rules.d/11-media-by-label-auto-mount.disabled'
	sdrulepath = '/etc/udev/rules.d/11-sd-cards-auto-mount.rules'
	sdrulepathdisabled = '/etc/udev/rules.d/11-sd-cards-auto-mount.disabled'
	
	if usb == True:
		if os.path.isfile(usbrulepath):
			values['usbautomountsuccess'] = True
		elif os.path.isfile(usbrulepathdisabled):
			os.rename(usbrulepathdisabled,usbrulepath)
			values['usbautomountsuccess'] = True
		else:
			values['usbautomountsuccess'] = False
	elif usb == False:
		if os.path.isfile(usbrulepathdisabled):
			values['usbautomountsuccess'] = True
		elif os.path.isfile(usbrulepath):
			os.rename(usbrulepath,usbrulepathdisabled)
			values['usbautomountsuccess'] = True
		else:
			values['usbautomountsuccess'] = False

	if sd == True:
		if os.path.isfile(sdrulepath):
			values['sdautomountsuccess'] = True
		elif os.path.isfile(sdrulepathdisabled):
			os.rename(sdrulepathdisabled,sdrulepath)
			values['sdautomountsuccess'] = True
		else:
			values['sdautomountsuccess'] = False
	elif sd == False:
		if os.path.isfile(sdrulepathdisabled):
			values['sdautomountsuccess'] = True
		elif os.path.isfile(sdrulepath):
			os.rename(sdrulepath,sdrulepathdisabled)
			values['sdautomountsuccess'] = True
		else:
			values['sdautomountsuccess'] = False
	try:
		udevcmd = "udevadm control restart"
		args = shlex.split(udevcmd)
		process = subprocess.Popen(args)
		values['udevrestart'] = True
	except:
		values['udevrestart'] = False
	return values	

def getmemory_free():
	cmd = """free | grep cache: | awk '{ print $4 }'"""
	process = subprocess.Popen(cmd,stdout=subprocess.PIPE,shell=True)
	freekb = process.stdout.read()
	return int(freekb) / 1024
    
    
def getmemory_percent():
      megabytes_total = getmemory_total()
      megabytes_free = getmemory_free()
      megabytes_used = megabytes_total - megabytes_free
      percent_pre = float(megabytes_free) / float(megabytes_total)
      percent_used = int((percent_pre *100))
      return percent_used

def get_leds():
	leds = dict()
	
	leds['green_trigger'] = 'unknown'
	leds['orange_trigger'] = 'unknown'
	leds['red_trigger'] = 'unknown'
	
	leds['green_status'] = 'unknown'
	leds['orange_status'] = 'unknown'
	leds['red_status'] = 'unknown'

	try:
		f = open( "/sys/class/leds/status:orange:misc/trigger", 'r' )
		for trigger in shlex.split(f.read()):
			if not "[" in trigger:
				continue
			leds['orange_trigger'] = trigger.strip('[').strip(']')   
		f.close()
		
		f = open( "/sys/class/leds/status:orange:misc/brightness", 'r' )
		if not "0" in f.read():
			leds['orange_status'] = 'on'
		else:
			leds['orange_status'] = 'off'
		f.close()
		leds['orange_present'] = True
	except:
		leds['orange_present'] = False	
		
	try:
		f = open( "/sys/class/leds/status:green:health/trigger", 'r' )
		for trigger in shlex.split(f.read()):
			if not "[" in trigger:
				continue
			leds['green_trigger'] = trigger.strip('[').strip(']')  
		f.close()
		
		f = open( "/sys/class/leds/status:green:health/brightness", 'r' )
		if not "0" in f.read():
			leds['green_status'] = 'on'
		else:
			leds['green_status'] = 'off'
		f.close()
		leds['green_present'] = True
	except:
		leds['green_present'] = False

	try:
		f = open( "/sys/class/leds/status:red:fault/trigger", 'r' )
		for trigger in shlex.split(f.read()):
			if not "[" in trigger:
				continue
			leds['red_trigger'] = trigger.strip('[').strip(']')  
		f.close()
		
		f = open( "/sys/class/leds/status:red:fault/brightness", 'r' )
		if not "0" in f.read():
			leds['red_status'] = 'on'
		else:
			leds['red_status'] = 'off'
		f.close()
		leds['red_present'] = True
	except:
		leds['red_present'] = False

	return leds
	
def set_led(led,trigger):
	try:
		if led == 'orange':
			f = open( "/sys/class/leds/status:orange:misc/trigger", 'w' )
			f.write(trigger)
		elif led == 'green':
			f = open( "/sys/class/leds/status:green:health/trigger", 'w' )
			f.write(trigger)
		elif led == 'red':
			f = open( "/sys/class/leds/status:red:fault/trigger", 'w' )
			f.write(trigger)
		f.close()
	except:
		return False
	return True
	
def getlocaltime(dt):
	try:
		f = open( "/etc/rc.conf", 'r' )
		for line in f.readlines():
			if not "TIMEZONE" in line:
				continue
			else:
				tz_list = line.strip().split('=')
				tz = tz_list[1].replace('\"','')
				currenttz = pytz.timezone(tz)
				return currenttz.localize(dt)
		f.close()
	except:
		return dt
	
	
	
