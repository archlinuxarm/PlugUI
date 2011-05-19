#!/bin/sh

echo "Making required support directories...."

mkdir -p /var/run/PlugUI > /dev/null 2>&1
mkdir -p /var/lib/PlugUI > /dev/null 2>&1

echo "Installing python2 and support frameworks...."
pacman --noconfirm -S python2 django cherrypy > /dev/null 2>&1

echo "Synchronizing database...."
cd /opt/PlugUI/ > /dev/null 2>&1
python2 manage.py syncdb --noinput > /dev/null 2>&1

echo "Setting up maintenance system....."
chmod +x /opt/PlugUI/plugmaintenance.py > /dev/null 2>&1
ln -s /opt/PlugUI/plugmaintenance.py /etc/cron.hourly/plugmaintenance > /dev/null 2>&1
/opt/PlugUI/plugmaintenance.py > /dev/null 2>&1

echo "Setting up runscript....."
chmod +x /opt/PlugUI/plugui.cherrypy > /dev/null 2>&1
ln -s /opt/PlugUI/plugui.cherrypy /etc/rc.d/plugui > /dev/null 2>&1

echo "Starting server...."
/etc/rc.d/plugui start > /dev/null 2>&1

echo "All done! Visit http://plugfinder.appspot.com in a browser to find your plug on the local network"
