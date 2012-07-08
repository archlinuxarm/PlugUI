#PlugUI 2

PlugUI 2 is a file management and system admin web interface for small ARM based devices running Arch Linux ARM. 

It will run on other distros, but the package manager is geared to use pacman. It will likely become more dependent on pacman when the code moves to using libalpm instead of running subprocesses for upgrade and other actions.


##Code

PlugUI 2 is a rewrite of the older PlugUI code (which was python), using Node.js. The older code is still in this repo in the django branch.

The old version was heavily tied to server-side things like django forms and templates, which don't play very nicely with in-browser applications, so PlugUI 2 is a cleanly separated browser and server component, which communicate with each other via JSON and at some point probably websockets too. This allows the server to completely ignore anything that doesnt involve running commands, fetching information or checking authentication, while the browser side can completely ignore how all those things are implemented by relying on a clean API.

The rewrite isn't anywhere near done yet, so if you want something usable, checkout the django branch of this repo.

##Setup for development

Clone this repo into /opt/:

    cd /opt; git clone git://github.com/archlinuxarm/PlugUI.git

Install node:

	pacman -Sy nodejs

Then install the required node modules:

	npm install express unixlib each client-sessions

Now symlink the run script and run it:

	ln -s /opt/PlugUI/plugui.sh /etc/rc.d/plugui
	chmod +x /opt/PlugUI/plugui.sh
	/etc/rc.d/plugui start

##Authentication

The current codebase relies on system PAM authentication (denying root by default). This allows users to enter the same username and password via plugui, ssh, or any other system level component. 

##Dashboard

The main page of PlugUI is the dashboard, which already has the hard work done for things like showing system load, memory use, etc. Just needs some pretty graphical elements to show it.

Package notifications for new updates are also planned but not implemented in the Node version yet.


##File Browser

The file browser is basic but works pretty well. It's a single page list, clicking a folder name opens that folder, clicking the parent directory link backs up one level.

Planned soon are 'more info' buttons for each file, which will pop up a small box containing permissions information, filesize and other details for a file, along with controls to configure sharing of that file.

Everything is 'sandboxed' inside the /media/ folder right now, this may need to be a user setting or perhaps just start trusting the user and allow / access (user already has a system level password if they can get here).

Layout and behavior both need some tweaking. Sharing and download/media playback aren't ported to node yet.

##Media playback

The old version of PlugUI had a simple music playback system integrated with the file browser. The new version will have a global media player with volume control, playlist and so on. 

This depends on the backend api for file downloads so isn't in the codebase yet, but all the big pieces are already there (libraries etc).

##Package Manager

Not implemented yet but planned to be a simple list of all packages available vs installed, upgrade notifications etc.


##Settings & users

Currently has a simple list of system users (pulls from /etc/passwd), will be able to add and delete users, change their shell, home folder, password and other basic things.

Settings area will also have basic network settings of some kind, perhaps using NetworkManager but that is not the Arch default so requires more testing.


##API

Note: This is all subject to change, most of the APIs aren't even implemented yet and will morph as the needs of the frontend dictate.

Right now none of these are protected at all, but at some point in the near future you will have to use the auth API to start a session before using any other API. That means storing the cookie and returning it just like a web browser would, if using another tool.

All API methods return a top level 'success' boolean indicating whether or not the API command successfully completed and can return the right data, check if this is false before doing anything else with a result.

Any method which accepts json can also technically accept a standard url encoded form too, so for instance Curl posts will work fine. They're still intended for json, so if you hit an API that requires multi-level structure requests, use json :D

###Status 

Simple device information, memory stats, load average and uptime. May add more stats in the future.

	POST: /api/status
	
	Accepts: nothing
	
	Returns: json
	
	Details: All sizes are in bytes, all times are in seconds.
	
	Sample: { "success":true, 
			  "freemem":14774272,
			  "memused":238837760, 
			  "totalmem":253612032,
			  "loadavg":[5.8623046875,5.5654296875,5.21826171875], 
			  "uptime":498867.340181713, 
			  "hostname": "athene",
			  "type": "Linux",
			  "release": "3.4.4-2-ARCH",
			  "platform": "linux",
			  "arch": "arm",
			  "version": "1.10.001" }
	
###Auth

Assists the frontend in validating existing sessions or authenticating a user, creates a cookie session if successful.

	POST: /api/auth
	
	Accepts: json
	
	Returns: json
	
	Details: 3 commands so far, 'check', 'login' and 'logout'. 
			 Check avoids requiring the frontend to authenticate when a session already exists.
	
	
####Check for a session 

	Request: { apicmd: 'check' }
	
	Response: { success: true|false, authenticated: true|false, username: username }
	
	
####Login 

	Request: { apicmd: 'login', username: 'username', password: 'password' }
	
	Response: { success: true|false, authenticated: true|false, username: username }
	
####Logout

	Request: { apicmd: 'logout' }
	
	Response: { success: true|false }

###Users

Allows the frontend to manage system users

	POST: /api/users
	
	Accepts: json
	
	Returns: json
	
	Details: This is a jsonified wrapper around some unix tools for working with system users. 
			 The user list is all inclusive, frontend must show or hide them as appropriate.
	
####List users 

	Request: { apicmd: 'list' }
	
	Response: { "success":true,
				"userlist": [
					{"username":"root","uid":"0","gid":"0","homedir":"/root","shell":"/bin/bash"},
					{"username":"bin","uid":"1","gid":"1","homedir":"/bin","shell":"/bin/false"},
					{"username":"daemon","uid":"2","gid":"2","homedir":"/sbin","shell":"/bin/false"},
					{"username":"mail","uid":"8","gid":"12","homedir":"/var/spool/mail","shell":"/bin/false"},
					{"username":"ftp","uid":"14","gid":"11","homedir":"/srv/ftp","shell":"/bin/false"},
					{"username":"http","uid":"33","gid":"33","homedir":"/srv/http","shell":"/bin/false"},
					{"username":"nobody","uid":"99","gid":"99","homedir":"/","shell":"/bin/false"},
					{"username":"dbus","uid":"81","gid":"81","homedir":"/","shell":"/bin/false"},
					{"username":"ntp","uid":"87","gid":"87","homedir":"/var/empty","shell":"/bin/false"},
					{"username":"steve","uid":"501","gid":"100","homedir":"/home/steve","shell":"/bin/bash"}
				]
			 }
	
	
####Create a user

	Unimplemented
	
####Delete a user

	Unimplemented


###Files 

Allows for simple directory listing, file download, delete

	POST: /api/files
 
	Accepts: json
 
	Returns: json|binary file (depending on the command)
 
	Details: File list is sandboxed inside /media by path standardization followed by regex matching. 
			 All requested paths are relative to that directory, this may change in the future.
			 All returned sizes are in bytes.
			 Files without any extension will not have a 'type' property, check its length before using.
	

####Directory list

		Request: { apicmd: 'directory_list', path: "/build" }
		
		Response: { "success":true, 
					"requestpath": "/media/build",
					"validpath": true,
					"files": [ 
						{"type":"conf","fullpath":"/media/build/motion.conf","directory":"/media/build","name":"motion.conf","isFolder":false,"size":23997},
						{"type":"tar","fullpath":"/media/build/clang_3.0-3ubuntu1.debian.tar","directory":"/media/build","name":"clang_3.0-3ubuntu1.debian.tar","isFolder":false,"size":112640},
						{"type":"folder","fullpath":"/media/build/PKGBUILDs","directory":"/media/build","name":"PKGBUILDs","isFolder":true,"size":12},
						{"type":"folder","fullpath":"/media/build/Temporary Items","directory":"/media/build","name":"Temporary Items","isFolder":true,"size":3},
						{"type":"folder","fullpath":"/media/build/cam","directory":"/media/build","name":"cam","isFolder":true,"size":3},
						{"type":"folder","fullpath":"/media/build/node_modules","directory":"/media/build","name":"node_modules","isFolder":true,"size":9},
						{"type":"folder","fullpath":"/media/build/PlugUI","directory":"/media/build","name":"PlugUI","isFolder":true,"size":19},
						{"type":"py","fullpath":"/media/build/led.py","directory":"/media/build","name":"led.py","isFolder":false,"size":1185},
						{"type":"gz","fullpath":"/media/build/cloud9-git.tar.gz","directory":"/media/build","name":"cloud9-git.tar.gz","isFolder":false,"size":1658},
						{"type":"folder","fullpath":"/media/build/llvm","directory":"/media/build","name":"llvm","isFolder":true,"size":20},
						{"type":"c","fullpath":"/media/build/hello.c","directory":"/media/build","name":"hello.c","isFolder":false,"size":80},
						{"type":"i","fullpath":"/media/build/hello.i","directory":"/media/build","name":"hello.i","isFolder":false,"size":17259},
						{"type":"folder","fullpath":"/media/build/Network Trash Folder","directory":"/media/build","name":"Network Trash Folder","isFolder":true,"size":3},
						{"type":"folder","fullpath":"/media/build/meta-texasinstruments","directory":"/media/build","name":"meta-texasinstruments","isFolder":true,"size":14},
						{"type":"folder","fullpath":"/media/build/cloud9-git","directory":"/media/build","name":"cloud9-git","isFolder":true,"size":9},
						{"type":"folder","fullpath":"/media/build/log","directory":"/media/build","name":"log","isFolder":true,"size":3},
						{"type":"folder","fullpath":"/media/build/build","directory":"/media/build","name":"build","isFolder":true,"size":7},
						{"type":"folder","fullpath":"/media/build/libobjc2","directory":"/media/build","name":"libobjc2","isFolder":true,"size":4},
						{"type":"folder","fullpath":"/media/build/lost+found","directory":"/media/build","name":"lost+found","isFolder":true,"size":3} 
					]
				}
	
	
	