'use strict';
const logger = require('../config/winston.config.js');
const sdc = require('../config/statsd_cliect.config.js')

// const SDC = require('statsd-client')
// var sdc;
// if(process.env.DBname = "cloudsu2020"){
//     sdc = new SDC({host: process.env.IP, port: 8125});
// }else{
//     sdc = new SDC({host: localhost, port: 8125});
// }

// var StatsD = require('node-statsd');
// var sdc;
// if(process.env.DBname = "cloudsu2020"){
//     sdc = new StatsD({host: process.env.IP, port: 8125});
// }else{
//     sdc = new StatsD({host: localhost, port: 8125});
// }

// const service = require('../services/serviceLog');

exports.create = async (req, res) => {
    // Validate request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    // console.log(req.body);

    if (req.body.additional.includes('statsd')) {
        // console.log(req.body);
        var message = req.body.message.split(",");
        if (message[0] == "bookTitle") {
            var bookTitle = message[1];
            sdc.increment(`${bookTitle}`);
        } else {
            var requestName = message[1];
            // console.log(requestName);
            var requestTime = message[2];
            // console.log(requestTime);
            sdc.increment(`${requestName}`); // Increment by one.
            sdc.timing(`${requestName}Timer`, requestTime); // Calculates time diff
        }
        // console.log(req.body);
    } else {
        if (req.body.level == 5) {
            logger.error(`[web] ${req.body.timestamp} message: ${req.body.message} fileName: ${req.body.fileName} lineNumber: ${req.body.lineNumber}`);
        }
        if (req.body.level == 3) {
            logger.info(`[web] ${req.body.timestamp} message: ${req.body.message} fileName: ${req.body.fileName} lineNumber: ${req.body.lineNumber}`);
        }
    }
    res.status(200).send({
        message: "get log"
    });


    // const newUser = new User({
    //     email: req.body.email,
    //     firstname: req.body.firstname,
    //     lastname: req.body.lastname,
    //     type: req.body.type,
    //     password: hashPassword
    // });

    // // Save user in the database
    // service.create(newUser, (err, user) => {
    //     if (err)
    //         res.status(200).send({
    //             message:
    //                 "error"
    //             // err.message || "Some error occurred while creating the User."
    //         });
    //     else res.status(200).send(user);
    // });
};