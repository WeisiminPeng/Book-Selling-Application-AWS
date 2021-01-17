'use strict';
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
let jwt = require('jsonwebtoken');
const logger = require('../config/winston.config.js');
const sdc = require('../config/statsd_cliect.config.js')

const jwtKey = "my_secret_key"

const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });


// model User/login
const User = require("../model/user.js")
const Login = require("../model/login")

//Import specific operations to database
const service = require('../services/serviceUser.js');
// Create and Save a new User
exports.create = async (req, res) => {
    // Validate request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    const hashPassword = await bcrypt.hash(req.body.password, salt);


    // Create a User
    const newUser = new User({
        email: req.body.email,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        type: req.body.type,
        password: hashPassword
    });

    // Save user in the database
    service.create(newUser, (err, user) => {
        if (err)
            res.status(200).send({
                message:
                    "error"
                // err.message || "Some error occurred while creating the User."
            });
        else res.status(200).send(user);
    });
};


// Find a single User with a User email
exports.get = (req, res) => {
    service.get(req.params.useremail, (err, user) => {
        if (err) {
            if (err.status === "no_record") {
                res.status(404).send({
                    // message: `There is no User with this email: ${req.params.useremail}.`
                    message: "no_record"
                });
            } else {
                res.status(500).send({
                    message: "Error retrieving User with email: " + req.params.useremail
                });
            }
        } else res.status(200).send(user);
    });
};



// Update a user identified by the useremail in the request
exports.update = async (req, res) => {
    // Validate Request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    // console.log(req.body);

    const hashPassword1 = await bcrypt.hash(req.body.password, salt);


    // Create a User
    const updatedUser = new User({
        email: req.body.email,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        password: hashPassword1,
        // type: req.body.type
    });

    // console.log("CREATE: " + updatedUser.type)

    service.update(
        req.params.useremail,
        // const user = Object.assign({}, req.body);
        updatedUser,
        (err, user) => {
            if (err) {
                if (err.status === "no_record") {
                    res.status(200).send({
                        message: "no_record"
                    });
                } else {
                    res.status(500).send({
                        message: "Error updating user with email " + req.params.useremail
                    });
                }
            } else res.status(200).send({
                message: "successful"
            });
        }
    );
};



//login
exports.login = async (req, res) => {
    // const inputPassword = await bcrypt.hash(req.body.password, salt);
    const loginAccount = new Login({
        email: req.body.email,
        password: req.body.password
        // password: inputPassword
    });
    // console.log(loginAccount);
    service.login(loginAccount, (err, response) => {
        if (err) {
            if (err.status === "no_record") {
                res.status(404).send({
                    // message: `There is no User with this email: ${req.params.useremail}.`
                    message: "no_record"
                });
            } else {
                res.status(500).send({
                    message: "Error retrieving User with email: " + req.body.email
                });
            }
        } else {
            if (response.status === "success") {
                let token = jwt.sign({ "email": loginAccount.email }, jwtKey, { algorithm: 'HS256' }, { expiresIn: '300s' });
                // console.log("token:", token)
                res.status(200).send({
                    Statu_Code: 200,
                    message: "success",
                    token: token
                });
            }
            if (response.status === "wrong") {
                res.status(400).send({
                    // Statu_Code: 400,
                    message: "wrong"
                });
            }
        }
        // res.status(200).send(response);
    });
};

exports.reset = async (req, res) => {
    var email = req.body.email;
    console.log(email);
    logger.info(`[server] message: "successfully send reset request to server"`);

    // Create publish parameters
    var params = {
        Message: email, /* required */
        TopicArn: process.env.topicArn
    };

    console.log(params);

    // Create promise and SNS service object
    var publishTextPromise = new AWS.SNS({ apiVersion: '2010-03-31' }).publish(params).promise();

    // Handle promise's fulfilled/rejected states
    publishTextPromise.then(
        function (data) {
            console.log(`Message ${params.Message} send sent to the topic ${params.TopicArn}`);
            console.log("MessageID is " + data.MessageId);
            res.status(200).send({
                message: "success"
            });
        }).catch(
            function (err) {
                console.error(err, err.stack);
            });
};