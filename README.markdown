#PlugUI

PlugUI is a file management and system admin web interface for small ARM based devices running Arch Linux ARM. 

It will run on other distros, but the package upgrade stuff is geared to use pacman. It will likely become more dependent on pacman when the code moves to using libalpm instead of running subprocesses for upgrade and other actions.
 
##State of the code

PlugUI is now a lightweight event based WSGI application, using the Bottle framework. 

It is currently being ported from django to bottle and cleanly separated into a client side javascript application, and a server side json API. It isn't anywhere near done yet, so if you want something usable, checkout the django branch of this repo

##Setup

Clone this repo into /opt/:

    cd /opt; git clone git://github.com/archlinuxarm/PlugUI.git

There are some hardcoded paths and symlinks used so make sure you end up with /opt/PlugUI/ and not a subdirectory or alternate location.

Then run the setup script 

    /opt/PlugUI/setup.sh

This runs through some dependency checks and attempts to install any packages that are required. 

##Dashboard

The main page of PlugUI is the dashboard, which shows device status like ram used and cpu load, along with notifications for packages that have upgrades available.



##File Browser

PlugUI has a dynamic, javascript based file browser with an integrated music player, file sharing system, and links to download or "view" a file directly in the browser, where possible.



##File Sharing

Not yet ported from the django version
