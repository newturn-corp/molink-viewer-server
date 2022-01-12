#!/bin/bash
checkThenCreateDir () {
    name=$1
    if [ ! -d $name ]
    then
        echo "create dir: $name"
        mkdir $name
    else
        echo "already exist dir: $name"
    fi
}

cd /home/ubuntu
checkThenCreateDir log

# clean up old source code
if [ -d knowlink-viewer ]
then
    echo "clean up: knowlink-viewer"
    rm -r knowlink-viewer
    mkdir knowlink-viewer
else
    echo "create dir: knowlink-viewer"
    mkdir knowlink-viewer
fi
