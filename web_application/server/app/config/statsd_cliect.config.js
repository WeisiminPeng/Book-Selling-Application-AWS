var StatsD = require('node-statsd');
var sdc;
if(process.env.DBname = "cloudsu2020"){
    sdc = new StatsD({host: process.env.IP, port: 8125});
}else{
    sdc = new StatsD({host: localhost, port: 8125});
}

module.exports = sdc;

    