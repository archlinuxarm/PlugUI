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

import shlex, subprocess, re, socket, os, fileinput, sys

def is_installed():
    fpath = "/usr/sbin/minidlna"
    return os.path.isfile(fpath) and os.access(fpath, os.X_OK)
           
def is_running():
    fpath = "/var/run/minidlna.pid"
    return os.path.isfile(fpath)

def start():
    if is_installed():
       base_start_command_raw = "/etc/rc.d/minidlna start"
       args = shlex.split(base_start_command_raw)
       process = subprocess.Popen(args,stdout=subprocess.PIPE,universal_newlines=True)
       for line in process.stdout.readlines():
            newoutput = line.rstrip('\n')
            if not ":: Starting MiniDLNA UPnP Media Server" in newoutput:
                continue
            elif ":: Starting MiniDLNA UPnP Media Server" in newoutput:
                return True
       return False
    else:
        return False

def stop():
    if is_installed():
       base_stop_command_raw = "/etc/rc.d/minidlna stop"
       args = shlex.split(base_stop_command_raw)
       process = subprocess.Popen(args,stdout=subprocess.PIPE,universal_newlines=True)
       for line in process.stdout.readlines():
            newoutput = line.rstrip('\n')
            if not ":: Stopping MiniDLNA UPnP Media Server" in newoutput:
                continue
            elif ":: Stopping MiniDLNA UPnP Media Server" in newoutput:
                return True
       return False
    else:
        return False
 
def get_config():
	config = "/etc/minidlna.conf"
	try:
		d = {}
		for line in fileinput.input(config):
			if not line.strip(): # skip empty or space padded lines
				continue
			if re.compile('^#').search(line) is not None: # skip commented lines
				continue
			else: # pick up key and value pairs
				kvp = line.strip().split('=')
				if kvp[1].strip().split('#') is not None:
					d[kvp[0].strip()] = kvp[1].split('#')[0].strip()
				else:
					d[kvp[0].strip()] = kvp[1].strip()	
		return d
	except:
		return {}
		
def set_config(configdict):
	port_line = "port=" + configdict['port']
	media_dir_line = "media_dir=" + configdict['media_dir']
	inotify_line = "inotify=" + configdict['inotify']
	tivo_line = "enable_tivo=" + configdict['enable_tivo']
	dlna_line = "strict_dlna=" + configdict['strict_dlna']
	oldfile = open('/etc/minidlna.conf','r')
	newfile = open('/etc/minidlna.conf.new','w')
	for line in oldfile:
		if "#" in line:
			line = line
			newfile.write(line)
			continue
		elif "port=" in line:
			line = port_line + '\n'
		elif "media_dir=" in line:
			line = media_dir_line + '\n'
		elif "inotify=" in line:
			line = inotify_line + '\n'
		elif "enable_tivo=" in line:
			line = tivo_line + '\n'
		elif "strict_dlna=" in line:
			line = dlna_line + '\n'
		else:
			line = line
		newfile.write(line)
	newfile.close()
	oldfile.close()
	os.rename('/etc/minidlna.conf.new','/etc/minidlna.conf')
	return True
		
	
	
	
