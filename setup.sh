#!/bin/sh

echo "Making required support directories...."

mkdir -p /var/run/PlugUI > /dev/null 2>&1
mkdir -p /var/lib/PlugUI > /dev/null 2>&1

echo "Installing python2 and support frameworks...."
pacman --noconfirm -S python2 > /dev/null 2>&1

pushd /opt/PlugUI
pip-2.7 install -r ./requirements.pip
popd

echo "Run the development server: python2 server.py"
echo ""
echo "This will not be necessary soon"
