#!/bin/bash

# remove angular dist file
sudo rm -rf /var/www/html/*

sudo rm /opt/cloudwatch-config.json
# remove server file
mkdir -p /home/ubuntu/webapp
mkdir -p /home/ubuntu/webapp/dist
mkdir -p /home/ubuntu/webapp/server
sudo rm -rf /home/ubuntu/webapp/*