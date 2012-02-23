##PlugUI

PlugUI is a file management and system admin web interface for small ARM based devices running Arch Linux ARM. 

It will run on other distros, but the package upgrade stuff is geared to use pacman. It will likely become more dependent on pacman when the code moves to using libalpm instead of running subprocesses for upgrade and other actions.
 
#State of the code

PlugUI is now a lightweight event based WSGI application, using the Bottle framework. 


##Setup

If you don't want to use the package in Arch ARM repo, clone this repo into /opt/:

    cd /opt; git clone git://github.com/archlinuxarm/PlugUI.git

There are some hardcoded paths and symlinks used so make sure you end up with /opt/PlugUI/ and not a subdirectory or alternate location.

Then run the setup script 

    /opt/PlugUI/setup.sh

This runs through some dependency checks and attempts to install any packages that are required. 

##Basic plug info

![](http://github.com/archlinuxarm/PlugUI/raw/master/screenshots/info.png)


##Package upgrade notifier

There is a periodic check to see if upgraded system packages are available, if so you will see a notification on the dashboard:

![](http://github.com/archlinuxarm/PlugUI/raw/master/screenshots/dashboard.png)


If there are, you can go upgrade them:

![](http://github.com/archlinuxarm/PlugUI/raw/master/screenshots/packages.png)



Right now there is no way to install new packages or see a list of installed software but it's coming.


##Shell

There is a very VERY simple "shell" available for running commands that require no further user input (it is not interactive).

I'm debating whether to keep this at all, since it is effectively a root shell.....



##Storage view


A simple list of attached storage devices, and some basic info about them. This stuff isn't quite finished and may or may not remain in the code.

![](http://github.com/archlinuxarm/PlugUI/raw/master/screenshots/storage.png)



##File Browser

PlugUI has a dynamic, javascript based file browser with an integrated music player, file sharing system, and links to download or "view" a file directly in the browser, where possible.

![](http://github.com/archlinuxarm/PlugUI/raw/master/screenshots/files.png)


##File Sharing

![](http://github.com/archlinuxarm/PlugUI/raw/master/screenshots/addshare.png)

The file sharing system is very simple, just find a file you want to share in the file browser, select it, and hit the share button. A window will pop up where you can select the share name and save it. 

All shared files are visible from the "Share" screen, and individual shares can be deleted from there. 

![](http://github.com/archlinuxarm/PlugUI/raw/master/screenshots/shares.png)

Each share has a public link and a direct link, the former uses Plugfinder (below) to resolve your plugs current public IP dynamically (like DNS in a way), the latter uses the best guess of your public IP directly if you want to avoid plugfinder. Neither of those links are suitable for use on a local network, if you need to download a file use the links on in the file browser page.

Note that the file sharing system is effectively a whitelisted sandbox in your /media directory: you cannot create shares for files outside that directory, nor can anyone (attackers, etc) access files that have not been explicitly shared (urls and user input are never used to construct a file path).
