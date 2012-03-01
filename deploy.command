#!/bin/sh

cd /SourceCache/Projects/PlugUI

/usr/local/bin/fab -f fabfile.py local deploy
