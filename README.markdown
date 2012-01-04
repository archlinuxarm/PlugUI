##PlugUI

PlugUI is a file management and system admin web interface for small ARM based devices running Arch Linux ARM. 

It will run on other distros, but the package upgrade stuff is geared to use pacman. It will likely become more dependent on pacman when the code moves to using libalpm instead of running subprocesses for upgrade and other actions.

There is a periodically updated package in the Arch Linux ARM repo: "pacman -Sy plugui-git".

#State of the code

There are some very old spots in this code, some things need to be updated both in looks and function, but it's not dead :D

PlugUI has moved repos once or twice, but the original code started life back in 2010 and has evolved quite a bit since then.

The newest commits to this repo change the way pages are loaded, they're now dynamic and don't require a page reload. This is in part to facilitate keeping the music player active when the user clicks around to other parts of the UI.

The screenshots below show some things that will probably be removed or hidden by default soon, like the Samba config which isn't usable at the moment.


##Setup

If you don't want to use the package in Arch ARM repo, clone this repo into /opt/:

    cd /opt; git clone git://github.com/archlinuxarm/PlugUI.git

There are some hardcoded paths and symlinks used so make sure you end up with /opt/PlugUI/ and not a subdirectory or alternate location.

Then run the setup script 

    /opt/PlugUI/setup.sh

This runs through some dependency checks and attempts to install any packages that are required, and then does a standard django app setup to generate the database and allow you to create a user. 

This little process will likely need to be cleaned up and potentially moved to using PAM authentication.

##Basic plug info

![](http://github.com/archlinuxarm/PlugUI/raw/master/screenshots/info.png)


##Package upgrade notifier

There is a periodic check to see if upgraded system packages are available, if so you will see a notification on the main screen:

![](http://github.com/archlinuxarm/PlugUI/raw/master/screenshots/upgrades.png)


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

Each share has a public link and a direct link, the former uses Plugfinder (below) to resolve your plugs current public IP dynamically (like DNS in a way), the latter uses the best guess of your public IP directly if you want to avoid plugfinder. Neither of those links are suitable for use on a local network, if you need to download a file use the links on in the file browser page.

Note that the file sharing system is effectively a whitelisted sandbox in your /media directory: you cannot create shares for files outside that directory, nor can anyone (attackers, etc) access files that have not been explicitly shared (urls and user input are never used to construct a file path).


##Plugfinder

I've written a very simple App Engine app that works in conjunction with PlugUI as an intelligent dynamic DNS system.

Once per hour, PlugUI will send a unique but random ID based on the MAC address of your plug to Plugfinder, which will record that ID along with the public IP address it came from. 

Plugfinder will then spit this information back out when you visit plugfinder.appspot.com in a browser, along with links to the local IP address of your plugs.  You can use this if you have a lot of plugs and want to access the web interface on each one quickly, or to find a plug after installation.

In addition, the file sharing system in PlugUI has a "public link" feature. When you create a shared file, you can optionally use the public link in the form plugfinder.appspot.com/dl/{PLUG_ID}/{SHARE_UUID}, which will look up the last known public IP for that plug and redirect the browser to download the file directly from the plug.

