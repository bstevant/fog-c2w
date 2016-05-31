#!/bin/sh

/etc/init.d/dnsmasq start
tmux new -d /usr/bin/consul agent -data-dir /tmp/consul 