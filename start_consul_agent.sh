#!/bin/sh

/etc/init.d/dnsmasq start
echo "nameserver 127.0.0.1" > /etc/resolv.conf
IPADDR=`ip addr show eth1 | grep "scope global" | cut -d " " -f 6 | cut -d "/" -f 1`
tmux new -d /usr/bin/consul agent -data-dir /tmp/consul -advertise $IPADDR

if [ "$1" != "" ] ; then
    sleep 2
    /usr/bin/consul join $1
fi
