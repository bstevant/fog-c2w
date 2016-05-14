#!/bin/sh

nohup /etc/init.d/redis-server start
node userlist.js