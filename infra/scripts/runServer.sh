#!/bin/bash
echo "run server"
cd /home/ubuntu/knowlink-viewer
pm2 startOrReload /home/ubuntu/knowlink-viewer/infra/configs/ecosystem.config.js
