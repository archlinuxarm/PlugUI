#PlugUI

PlugUI is a file management and system admin web interface for small ARM based devices running Arch Linux ARM. 

It will run on other distros, but the package manager is geared to use pacman. It will likely become more dependent on pacman when the code moves to using libalpm instead of running subprocesses for upgrade and other actions.
 
##Code

PlugUI is in the process of being ported to Node.js with a clean separation between the client and server side, communicating back and forth via JSON APIs.

The client side is a Backbone application, the backend uses Express and some other Node.js libraries.

It isn't anywhere near done yet, so if you want something usable, checkout the django branch of this repo

##Setup

Clone this repo into /opt/:

    cd /opt; git clone git://github.com/archlinuxarm/PlugUI.git

Install node:

	pacman -Sy nodejs

Then install the required node modules:

	npm install -g express unixlib connect-form each

Now symlink the run script and run it:

	ln -s /opt/PlugUI/plugui.sh /etc/rc.d/plugui
	chmod +x /opt/PlugUI/plugui.sh
	/etc/rc.d/plugui start

##Dashboard

The main page of PlugUI is the dashboard, which shows device status like ram used and cpu load, along with notifications for packages that have upgrades available.


##File Browser

The file browser is basic but works pretty well. Sharing and download/media playback aren't ported to node yet.


##Package Manager

Not implemented yet but planned to be a simple list of all packages available vs installed, upgrade notifications etc.
