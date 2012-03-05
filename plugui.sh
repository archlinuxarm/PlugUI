#!/bin/bash

. /etc/rc.conf
. /etc/rc.d/functions

DIR=/opt/PlugUI
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
NODE_PATH=/usr/lib/node_modules
NODE=/usr/bin/node


PIDFILE=/var/run/plugui.pid
PID=$(cat $PIDFILE 2>/dev/null)
if ! readlink -q /proc/$PID/exe | grep -q '^/usr/bin/node'; then
	PID=
	rm $PIDFILE 2>/dev/null
fi

case "$1" in
	start)
		stat_busy 'Starting PlugUI'
		NODE_ENV=production nohup "$NODE" "$DIR/server.js" 1>>"/var/log/plugui.log" 2>&1 &
		PID=$!
		echo $! > $PIDFILE
		if [[ $? -gt 0 ]]; then
			stat_fail
		else
			add_daemon plugui
			stat_done
		fi
		;;
	stop)
		stat_busy 'Stopping PlugUI'
		[[ ! -z $PID ]] && kill $PID &> /dev/null
		if [[ $? -gt 0 ]]; then
			stat_fail
		else
			rm_daemon plugui
			stat_done
		fi
		;;
	restart)
		$0 stop
		sleep 1
		$0 start
		;;
	*)
		echo "usage: $0 {start|stop|restart}"
esac
exit 0