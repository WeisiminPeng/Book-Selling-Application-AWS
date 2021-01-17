#!/bin/bash

# stop node.js
# sudo killall "node" 2>/dev/null
pm2 delete /home/ubuntu/webapp/server/server.js
# sudo systemctl stop amazon-cloudwatch-agent
# sudo service apache2 stop