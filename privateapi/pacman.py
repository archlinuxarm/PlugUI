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
import shlex, subprocess, re, socket

def check():
    check_cmd = "pacman -Syup"
    args = shlex.split(check_cmd)
    process = subprocess.Popen(args,stdout=subprocess.PIPE,universal_newlines=True)
    output_list = []
    for line in process.stdout.readlines():
        newoutput = line.rstrip('\n')
        if not "there is nothing to do" in newoutput:
            continue
        elif "there is nothing to do" in newoutput:
            return False
    return True
           
		   
def install(package):
    packagename = str(package)
    cmd = "pacman --noconfirm --noprogressbar -S " + packagename 
    args = shlex.split(cmd)
    process = subprocess.Popen(args,stdout=subprocess.PIPE,universal_newlines=True)
    return process.stdout.readlines()
	
def list_upgrades():
    pacmanqu_command_raw = "pacman -Sup --print-format '%n %v'"
    args = shlex.split(pacmanqu_command_raw)
    process = subprocess.Popen(args,stdout=subprocess.PIPE,universal_newlines=True)
    output_list = []
    for line in process.stdout.readlines():
        newoutput = line.rstrip('\n')
        output_list.append(newoutput)
    return output_list

def list_installed():
    pacmanq_command_raw = "pacman -Q"
    args = shlex.split(pacmanq_command_raw)
    process = subprocess.Popen(args,stdout=subprocess.PIPE,universal_newlines=True)
    output_list = []
    for line in process.stdout.readlines():
        newoutput = line.rstrip('\n')
        currentpackage = shlex.split(newoutput)
        output_list.append(currentpackage)
    return output_list

def doupdateos():
       update_command_raw = "pacman -Syu --noconfirm --noprogressbar"
       args = shlex.split(update_command_raw)
       process = subprocess.Popen(args,stdout=subprocess.PIPE,universal_newlines=True)
       output_list = []
       for line in process.stdout.readlines():
              newoutput = line.rstrip('\n')
              output_list.append(newoutput)
              output_list.append('<br/>')
       return output_list
