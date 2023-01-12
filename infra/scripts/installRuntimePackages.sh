#!/bin/bash
apt-get -y update

if [ $(dpkg-query -W -f='${Status}' build-essential 2>/dev/null | grep -c "ok installed") -eq 0 ]
then
    echo "install build-essential"
    apt-get install -y build-essential
else
    echo "build-essential is already installe. skip"
fi

if ! which pm2 > /dev/null
then
    echo "install pm2 globally"
    npm install -g pm2@latest
    echo "install pm2 logrotate and setup"
    pm2 install pm2-logrotate
else
    echo "pm2 is already installed. skip"
fi
