#!/bin/sh

tmux neww nodejs ui.js
tmux neww watch ip addr
tmux attach