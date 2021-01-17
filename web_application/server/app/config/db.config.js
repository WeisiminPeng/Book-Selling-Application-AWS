'use strict';

var hostnameTemp = process.env.DBhostname;
var hostname = hostnameTemp.split(":")[0];

  module.exports = {
    HOST: hostname,
    USER: process.env.DBusername,
    PASSWORD: process.env.DBpassword,
    DB: process.env.DBname
  };