#!/bin/bash

sudo cp /home/ubuntu/webapp/dist/* /var/www/html
sudo cp /home/ubuntu/webapp/dist/.htaccess /var/www/html
sudo cp -f /home/ubuntu/webapp/000-default.conf  /etc/apache2/sites-available/000-default.conf
sudo cp -f /home/ubuntu/webapp/cloudwatch-config.json  /opt/cloudwatch-config.json

cd ~/webapp/server
# node server.js
# sudo npm i --unsafe-perm
sudo chown -R ubuntu ~/webapp/

sudo a2enmod rewrite
sudo service apache2 restart
