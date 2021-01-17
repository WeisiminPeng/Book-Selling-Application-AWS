#!/bin/bash
cd ~/webapp/server
# node server.js
sudo npm i --unsafe-perm
sudo touch server.log
sudo chown ubuntu server.log
source /etc/profile

pm2 start /home/ubuntu/webapp/server/server.js --log ~/webapp/server/server.log
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
pm2 save
# sudo touch server.log
# sudo chown ubuntu server.log
# source /etc/profile
# nohup node server.js > server.log 2>&1 &

# cd ~/webapp/statsd
# sudo apt install build-essential
# sudo npm i --unsafe-perm
# sudo touch statsd.log
# sudo chown ubuntu statsd.log
# source /etc/profile
# nohup node stats.js statsdconfig.js > statsd.log 2>&1 &

sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -c file:/opt/cloudwatch-config.json \
    -s
