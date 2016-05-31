#!/bin/sh

/etc/init.d/redis-server start
tmux neww nodejs board.js
tmux attach