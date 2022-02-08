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
if [ -d viewer ]
then
    echo "clean up: viewer"
    rm -r viewer
    mkdir viewer
else
    echo "create dir: viewer"
    mkdir viewer
fi
