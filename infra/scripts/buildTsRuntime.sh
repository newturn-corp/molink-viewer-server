#!/bin/bash
echo "Build Ts Package"
cd /home/ubuntu/knowlink-viewer
# production packages
rm -r build

sleep 1

npm run build
