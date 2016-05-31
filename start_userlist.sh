#!/bin/sh

/etc/init.d/redis-server start
tmux neww nodejs userlist.js
tmux attach