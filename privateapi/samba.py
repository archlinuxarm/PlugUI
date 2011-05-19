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

import shlex, subprocess, re, socket, os, fileinput


def is_installed():
    fpath = "/usr/sbin/smbd"
    return os.path.isfile(fpath)
           
def is_running():
	process = os.popen("ps x -o pid,args | grep -v grep | grep smbd").read()
	if process:
		return True
	return False

def start():
    if not is_running():
       start_command_raw = "/etc/rc.d/samba start"
       args = shlex.split(start_command_raw)
       process = subprocess.Popen(args,stdout=subprocess.PIPE,universal_newlines=True)
       for line in process.stdout.readlines():
            newoutput = line.rstrip('\n')
            if ":: Starting Samba Server" in newoutput:
                return True
       return False
    else:
        return True

def stop():
    if is_running():
       stop_command_raw = "/etc/rc.d/samba stop"
       args = shlex.split(stop_command_raw)
       process = subprocess.Popen(args,stdout=subprocess.PIPE,universal_newlines=True)
       for line in process.stdout.readlines():
            newoutput = line.rstrip('\n')
            if ":: Stopping Samba Server" in newoutput:
                return True
       return False
    else:
        return True

def get_config():
	config = "/etc/samba/smb.conf"
	default = "/etc/samba/smb.conf.default"
	d = {}
	sectionname = ""
	#test for the config file and copy the default if it is missing
	try:
		if os.path.exists(config):
			pass
		else:
			os.rename(default,config)
	except:
		return d
	#now we should have a config and we can rely on it being there
	for line in fileinput.input(config):
		if not line.strip(): # skip empty or space padded lines
			continue
		if re.compile('^#').search(line) is not None: # skip commented lines
			continue
		if "]" in line: #new section so we can initialize some stuff here
			section = {}
			sectionname = line.strip("[")[:-2]
			print "new section name: " + sectionname
			section["name"] = sectionname
			section["options"] = []
			d[sectionname] = section
		else:
			kvp = line.strip().split('=')
			option = {}
			optionname = kvp[0]
			optionvalue = kvp[1]
			if sectionname == "global":
				if re.compile('^;').search(optionname):
					option["enabled"] = False
				else:
					option["enabled"] = True
			else:
				pass
			option[optionname.strip(";").strip()] = optionvalue
			section = d.get(sectionname)
			section["options"].append(option)
	return d

def set_config(configdict):
	server_string_line = "server string =" + configdict['server_string']
	workgroup_line = "workgroup =" + configdict['workgroup']
	oldfile = open('/etc/samba/smb.conf','r')
	newfile = open('/etc/samba/smb.conf.new','w')
	for line in oldfile:
		if "#" in line:
			line = line
			newfile.write(line)
			continue
		elif "workgroup" in line:
			line = workgroup_line + '\n'
		elif "server string" in line:
			line = server_string_line + '\n'
		else:
			line = line
		newfile.write(line)
	newfile.close()
	oldfile.close()
	os.rename('/etc/samba/smb.conf','/etc/samba/smb.conf.back')
	os.rename('/etc/samba/smb.conf.new','/etc/samba/smb.conf')
	return True