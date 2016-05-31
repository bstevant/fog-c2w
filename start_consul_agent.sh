#!/bin/sh

/etc/init.d/dnsmasq start
echo "nameserver 127.0.0.1" > /etc/resolv.conf
tmux new -d /usr/bin/consul agent -data-dir /tmp/consul 

if [ "$1" != "" ] ; then
    sleep 2
    /usr/bin/consul join $1
fi
