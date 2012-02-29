#PlugUI

PlugUI is a file management and system admin web interface for small ARM based devices running Arch Linux ARM. 

It will run on other distros, but the package upgrade stuff is geared to use pacman. It will likely become more dependent on pacman when the code moves to using libalpm instead of running subprocesses for upgrade and other actions.
 
##State of the code

PlugUI is in the process of being ported to Node.js with a clean separation between the client and server side, communicating back and forth via JSON APIs.

It isn't anywhere near done yet, so if you want something usable, checkout the django branch of this repo

##Setup

Clone this repo into /opt/:

    cd /opt; git clone git://github.com/archlinuxarm/PlugUI.git

There is no setup, just run:

	node server.js

You'll inevitably hit some missing node modules but things will be smoothed out soon

##Dashboard

The main page of PlugUI is the dashboard, which shows device status like ram used and cpu load, along with notifications for packages that have upgrades available.



##File Browser

PlugUI has a dynamic, javascript based file browser with an integrated music player, file sharing system, and links to download or "view" a file directly in the browser, where possible.



##File Sharing

Not yet ported from the django version
