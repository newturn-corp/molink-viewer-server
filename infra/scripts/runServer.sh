#!/bin/bash
echo "run server"
cd /home/ubuntu/viewer
pm2 startOrReload /home/ubuntu/viewer/infra/configs/ecosystem.config.js
