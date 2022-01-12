#!/bin/bash
echo "set pm2 logrotate"
pm2 set pm2-logrotate:retain 365
pm2 set pm2-logrotate:dateFormat YYYY-MM-DD
pm2 set pm2-logrotate:max_size 500M
pm2 set pm2-logrotate:rotateInterval "59 59 23 * * *"
