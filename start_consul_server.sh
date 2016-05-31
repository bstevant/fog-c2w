#!/bin/sh

BOOTSTRAP_OPT=""
if [ "$2" = "y" ] ; then
    BOOTSTRAP_OPT="-bootstrap-expect 1"
fi

/etc/init.d/dnsmasq start
echo "nameserver 127.0.0.1" > /etc/resolv.conf 
tmux new -d /usr/bin/consul agent -server -data-dir /tmp/consul -config-dir /etc/consul.d $BOOTSTRAP_OPT
sleep 2
/usr/bin/consul join $1