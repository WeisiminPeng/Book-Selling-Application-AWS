'use strict';
const logger = require('../config/winston.config.js');
const sdc = require('../config/statsd_cliect.config.js')
// model Cart
const Book = require("../model/book");
const bucketConfig = require("../config/aws.config.js");
const shortid = require('shortid');

//Import specific operations to database
const service = require('../services/serviceBook');

const multer = require('multer');
const fs = require('fs');
const AWS = require('aws-sdk');

exports.upload = multer();

// Create and Save a new book
exports.create = async (req, res) => {
    // Validate request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
    }
    // console.log(req.body);
    // console.log(req.files);

    let bookImages = "";

    for (let file of req.files) {
        let extension = file.originalname.split(".")[1];
        file.originalname = shortid.generate()+ "." + extension;
        bookImages = bookImages.concat(file.originalname + "||");
    }

    // Create a book
    const newBook = new Book({
        ISBN: req.body.ISBN,
        Title: req.body.Title,
        Authors: req.body.Authors,
        PublicationDate: req.body.PublicationDate,
        Quantity: req.body.Quantity,
        Price: req.body.Price,
        email: req.params.useremail,
        images: bookImages
    });

    const s3 = new AWS.S3({
        // accessKeyId: bucketConfig.access_keyId,
        // secretAccessKey: bucketConfig.access_key,
        region: bucketConfig.region
    })

    const imageFiles = req.files;
    // console.log(imageFiles);
    var timeS3upload1 = new Date().toISOString();
    logger.info(`[S3] ${timeS3upload1} message: upload images to s3 bucket`);
    imageFiles.map((item) => {
        var params = {
            Bucket: bucketConfig.bucket,
            Key: item.originalname,
            Body: item.buffer,
            ACL: 'public-read'
        };

        s3.upload(params, function (err, data) {
            if (err)
                console.log(err);

            var timeS3upload2 = new Date().toISOString();
            logger.info(`[S3] ${timeS3upload2} message: upload images to s3 bucket successfully`);
            var durationS3upload = new Date(timeS3upload2).getTime()- new Date(timeS3upload1).getTime();
            sdc.timing(`S3UploadImages`, durationS3upload); 
            // console.log("durationS3upload: "+ durationS3upload);

            console.log(data);
        });
    });



    // Save book in the database
    service.create(newBook, (err, book) => {
        if (err)
            res.status(500).send({
                message:
                    "error"
                // err.message || "Some error occurred while creating the User."
            });
        else res.status(200).send({
            message: "Success Create!"
        });
    });
};

// Retrieve all books by this username sell
exports.getAll = (req, res) => {
    service.getAll(req.params.useremail, (err, data) => {
        if (err) {
            if (err.message == "no_book") {
                res.status(200).send([{
                    message:
                        "empty_selllist"
                }]);
            } else {
                res.status(500).send({
                    message:
                        err.message || "Some error occurred while retrieving books."
                });
            }
        }
        else res.send(data);
    });
};

exports.transferImage = (req, res) => {
    const filename = req.params.imagename;
    let filePath = __dirname + "/../../imagesSave/" + filename;
    // console.log(filePath);
    fs.readFile(filePath, function (err, data) {
        if (err) {
            res.writeHead(404);
            res.end(JSON.stringify(err));
            return;
        }

        else {
            res.writeHead(200);
            //res.setHeader('Content-Type', 'text/html');
            res.end(data);
        }
    })
};

// Retrieve all books except this user sell from the database.
exports.list = (req, res) => {
    service.list(req.params.useremail, (err, data) => {
        console.log(err)
        console.log(data)
        if (err) {
            if (err.message == "no_book") {
                res.status(200).send([{
                    message:
                        "empty_booklist"
                }]);
            } else {
                res.status(500).send({
                    message:
                        err.message || "Some error occurred while retrieving books."
                });
            }
        }
        else res.send(data);
    });
};

// Find a single book with a book id
exports.get = (req, res) => {
    service.get(req.params.id, (err, book) => {
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
        } else res.status(200).send(book);
    });
};

// Update a book identified by the id in the request
exports.update = async (req, res) => {
    // Validate Request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
    }
    // Create a User
    const updatedBook = new Book({
        ISBN: req.body.ISBN,
        Title: req.body.Title,
        Authors: req.body.Authors,
        PublicationDate: req.body.PublicationDate,
        Quantity: req.body.Quantity,
        Price: req.body.Price,
        images: req.body.images,
    });

    service.update(
        req.params.id,
        // const user = Object.assign({}, req.body);
        updatedBook,
        (err, book) => {
            if (err) {
                if (err.status === "no_record") {
                    res.status(200).send({
                        message: "no_record"
                    });
                } else {
                    res.status(500).send({
                        message: "Error updating book with id " + req.params.id
                    });
                }
            } else res.status(200).send({
                message: "successful"
            });
        }
    );
};

// Delete a book with the specified bookId
exports.delete = (req, res) => {
    service.remove(req.params.id, (err, data) => {
        if (err) {
            if (err.status === "not_found") {
                res.status(404).send({
                    message: `Not found Book with id ${req.params.id}.`
                });
            } else {
                res.status(500).send({
                    message: "Could not delete Book with id " + req.params.id
                });
            }
        } else res.send({ message: `successfully` });
    });
};