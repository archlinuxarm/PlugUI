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

	npm install -g express unixlib connect-form each client-sessions

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
