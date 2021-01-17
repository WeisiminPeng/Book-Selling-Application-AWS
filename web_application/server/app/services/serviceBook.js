'use strict';
const logger = require('../config/winston.config.js');
const sdc = require('../config/statsd_cliect.config.js')
// Connect to local MySQL database webappdb
const sql = require("../db.js");

// model User
const Cart = require("../model/book.js")

const AWS = require('aws-sdk');
const fs = require('fs');
const bucketConfig = require("../config/aws.config.js");


// save new cart into db
exports.create = (newBook, result) => {
    var timeSQLcreate1 = new Date().toISOString();
    logger.info(`[SQL] ${timeSQLcreate1} message: insert new book in SQL dataset`);
    sql.query("INSERT INTO books  SET ?", newBook, (err, res) => {
        var timeSQLcreate2 = new Date().toISOString();
        var durationSQLcreate = new Date(timeSQLcreate2).getTime()- new Date(timeSQLcreate1).getTime();
        sdc.timing(`SQLcreatBook`, durationSQLcreate); 
        // console.log("durationS3upload: "+ durationS3upload);
        if (err) {
            logger.error(`[SQL] ${new Date().toISOString()} message: fail to insert new book in SQL dataset`);
            console.log("error: ", err);
            result(err, null);
        } else {
            logger.info(`[SQL] ${new Date().toISOString()} message: insert new book in SQL dataset successfully`);
            // console.log("created book: ", { ...newBook });
            result(null, { ...newBook });
        }
    });
};

// retrive all the books this user sell
exports.getAll = (useremail, result) => {
    var allFileNames = [];

    const s3 = new AWS.S3({
        // accessKeyId: bucketConfig.access_keyId,
        // secretAccessKey: bucketConfig.access_key,
        region: bucketConfig.region
    })
    var timeSQLsell1 = new Date().toISOString();
    logger.info(`[SQL] ${timeSQLsell1} message: retrive all the books this user sell`);
    sql.query(`SELECT * FROM books WHERE email ="${useremail}"`, (err, res) => {
        var timeSQLsell2 = new Date().toISOString();
        var durationSQLsell = new Date(timeSQLsell2).getTime()- new Date(timeSQLsell1).getTime();
        sdc.timing(`SQLselllist`, durationSQLsell); 
        if (err) {
            logger.error(`[SQL] ${new Date().toISOString()} message: fail to retrive all the books ${useremail} sell`);
            console.log("error: ", err);
            result(null, err);
            return;
        }
        // console.log(res)
        if (res.length) {
            logger.info(`[SQL] ${new Date().toISOString()} message: retrive all the books ${useremail} sell successfully`);

            for (let book of res) {
                let tokens = book.images.split("||");
                for (let i = 0; i < tokens.length - 1; i++)
                    allFileNames.push(tokens[i]);
            }

            var callRemaining = allFileNames.length;
            for (let bookName of allFileNames) {
                // console.log("bookName: "+bookName)
                var file = fs.createWriteStream('imagesSave/' + bookName);
                var aws_params = {
                    Bucket: bucketConfig.bucket,
                    Key: bookName
                }
                var timeS3getsell1 = new Date().toISOString();
                logger.info(`[S3] ${timeS3getsell1} message: get images ${useremail} sell from s3 bucket`);
                s3.getObject(aws_params).createReadStream().on('end', () => {
                    --callRemaining;
                    // console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<");

                    if (callRemaining <= 0) {
                        var timeS3getsell2 = new Date().toISOString();
                        logger.info(`[S3] ${timeS3getsell2} message: get images ${useremail} sell from s3 bucket successfully`);
                        var durationS3getsell = new Date(timeS3getsell2).getTime()- new Date(timeS3getsell1).getTime();
                        sdc.timing(`S3GetImagesSell`, durationS3getsell); 
                        // console.log("durationS3get: "+ durationS3getsell);
                        // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>");
                        result(null, res);
                    }
                }).pipe(file);
            }
        } else {
            logger.info(`[SQL] ${new Date().toISOString()} message: ${useremail} is not selling any book`);
            result({ message: "no_book" }, null);
        }


        // console.log("books: ", res);
        // result(null, res);
    });
};


// retrive all the books except this user sell
exports.list = (useremail, result) => {

    // console.log("************************")

    var allFileNames = [];

    const s3 = new AWS.S3({
        // accessKeyId: bucketConfig.access_keyId,
        // secretAccessKey: bucketConfig.access_key,
        region: bucketConfig.region
    })
    var timeSQLlist1 = new Date().toISOString();
    logger.info(`[SQL] ${timeSQLlist1} message: retrive all the books except ${useremail} sell`);
    sql.query(`SELECT * FROM books WHERE email !="${useremail}" AND Quantity != 0`, (err, res) => {
        var timeSQLlist2 = new Date().toISOString();
        var durationSQLlist = new Date(timeSQLlist2).getTime()- new Date(timeSQLlist1).getTime();
        sdc.timing(`SQLbooklist`, durationSQLlist); 
        if (err) {
            logger.error(`[SQL] ${new Date().toISOString()} message: fail to retrive all the books except ${useremail} sell`);
            // console("&&&&&&&&&&&&&&&&&")
            console.log("error: ", err);
            result(err, null);
            return;
        }

        // console.log("books: ", res);
        // result(null, res);
        // console.log(res)
        if (res.length) {
            logger.info(`[SQL] ${new Date().toISOString()} message: retrive all the books except ${useremail} sell successfully`);
            // console.log("$$$$$$$$$$$$$$$$$$$$$$")
            for (let book of res) {
                let tokens = book.images.split("||");
                for (let i = 0; i < tokens.length - 1; i++)
                    allFileNames.push(tokens[i]);
            }

            var callRemaining = allFileNames.length;
            for (let bookName of allFileNames) {
                var file = fs.createWriteStream('imagesSave/' + bookName);
                var aws_params = {
                    Bucket: bucketConfig.bucket,
                    Key: bookName
                }
                var timeS3getlist1 = new Date().toISOString();
                logger.info(`[S3] ${timeS3getlist1} message: get images except ${useremail} sell from s3 bucket`);
                s3.getObject(aws_params).createReadStream().on('end', () => {
                    --callRemaining;

                    if (callRemaining <= 0) {
                        var timeS3getlist2 = new Date().toISOString();
                        logger.info(`[S3] ${timeS3getlist2} message: get images except ${useremail} sell from s3 bucket successfully`);
                        var durationS3getlist = new Date(timeS3getlist2).getTime()- new Date(timeS3getlist1).getTime();
                        sdc.timing(`S3GetImagesList`, durationS3getlist); 
                        // console.log("durationS3get: "+ durationS3getlist);
                        result(null, res);
                    }
                }).pipe(file);
            }
        } else {
            // console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
            logger.info(`[SQL] ${new Date().toISOString()} message: there is no book except ${useremail} sell`);
            result({ message: "no_book" }, null);
        }
    });
};

// get user info by user email
exports.get = (id, result) => {
    var timeSQLget1 = new Date().toISOString();
    logger.info(`[SQL] ${timeSQLget1} message: get book ${id}`);
    sql.query(`SELECT * FROM books WHERE BookId = "${id}";`, (err, res) => {
        var timeSQLget2 = new Date().toISOString();
        var durationSQLget = new Date(timeSQLget2).getTime()- new Date(timeSQLget1).getTime();
        sdc.timing(`SQLgetbook`, durationSQLget); 
        if (err) {
            logger.error(`[SQL] ${new Date().toISOString()} message: fail to get book ${id}`);
            console.log("error: ", err);
            result(err, null);
        } else if (res.length) {
            logger.info(`[SQL] ${new Date().toISOString()} message: get book ${id} successfully`);
            // console.log("found book: ", res[0]);
            result(null, res[0]);
        }
        else {
            logger.error(`[SQL] ${new Date().toISOString()} message: no record for book ${id}`);
            result({ status: "no_record" }, null);
        }
    });
};


// update one book by id
exports.update = (id, book, result) => {

    var timeSQLget11 = new Date().toISOString();
    logger.info(`[SQL] ${timeSQLget11} message: update book ${id}`);
    sql.query(`SELECT * FROM books WHERE BookId = "${id}";`, (err, res) => {
        var timeSQLget12 = new Date().toISOString();
        var durationSQLget1 = new Date(timeSQLget12).getTime()- new Date(timeSQLget11).getTime();
        sdc.timing(`SQLgetbook`, durationSQLget1);
        if (err) {
            logger.error(`[SQL] ${new Date().toISOString()} message: fail to update book ${id}`);
            console.log("error: ", err);
            return;
        }
        logger.info(`[SQL] ${new Date().toISOString()} message: update book ${id} successfully`);
        var original_tokens = res[0].images.split("||");
        var incoming_tokens = book.images.split("||");
        var deleted_tokens = [];

        //For deletion only
        for (let token of original_tokens) {
            if (!incoming_tokens.includes(token)) {
                deleted_tokens.push(token);
            }
        }

        if (deleted_tokens != []) {

            // console.log("The deleted images are: " + deleted_tokens);
            const s3 = new AWS.S3({
                // accessKeyId: bucketConfig.access_keyId,
                // secretAccessKey: bucketConfig.access_key,
                region: bucketConfig.region
            })

            var timeS3delete1 = new Date().toISOString();
            logger.info(`[S3] ${timeS3delete1} message: delete images from s3 bucket`);
            deleted_tokens.map((item) => {
                var params = {
                    Bucket: bucketConfig.bucket,
                    Key: item
                };

                s3.deleteObject(params, function (err, data) {
                    if (err)
                        console.log(err);
                    var timeS3delete2 = new Date().toISOString();
                    logger.info(`[S3] ${timeS3delete2} message: delete images from s3 bucket successfully`);
                    var durationS3delete = new Date(timeS3delete2).getTime()- new Date(timeS3delete1).getTime();
                    sdc.timing(`S3ImagesDelete`, durationS3delete); 
                    // console.log("durationS3delete: "+ durationS3delete);
                    // console.log(data);
                });
            });
        }





        var timeSQLupdate1 = new Date().toISOString();
        logger.info(`[SQL] ${timeSQLupdate1} message: update book ${id}`);
        sql.query("UPDATE books SET ISBN = ?, images = ?, Title = ?, Authors = ?, PublicationDate = ?, Quantity = ?, Price = ? WHERE BookId = ?",
            [book.ISBN, book.images, book.Title, book.Authors, book.PublicationDate, book.Quantity, book.Price, id],
            (err, res) => {
                var timeSQLupdate2 = new Date().toISOString();
                var durationSQLupdate = new Date(timeSQLupdate2).getTime()- new Date(timeSQLupdate1).getTime();
                sdc.timing(`SQLupdatebook`, durationSQLupdate);
                if (err) {
                    logger.error(`[SQL] ${new Date().toISOString()} message: fail to update book ${id}`);
                    console.log("error: ", err);
                    result(err, null);
                    return;
                } else if (res.affectedRows == 0) {
                    // not found user with the email
                    logger.info(`[SQL] ${new Date().toISOString()} message: no record for book ${id}`);
                    result({ status: "no_record" }, null);
                    return;
                } else {
                    logger.info(`[SQL] ${new Date().toISOString()} message: update book ${id} successfully`);
                    // console.log("updated book: ", { ...book });
                    result(null, { ...book });
                }
            });
    });
};

exports.remove = (id, result) => {

    var timeSQLget21 = new Date().toISOString();
    logger.info(`[SQL] ${timeSQLget21} message: get book ${id}`);
    sql.query(`SELECT * FROM books WHERE BookId = "${id}";`, (err, res) => {
        var timeSQLget22 = new Date().toISOString();
        var durationSQLget21 = new Date(timeSQLget22).getTime()- new Date(timeSQLget21).getTime();
        sdc.timing(`SQLdeleteBook`, durationSQLget21);
        if (err) {
            logger.error(`[SQL] ${new Date().toISOString()} message: fail to delete book ${id}`);
            console.log("error: ", err);
            return;
        }
        logger.info(`[SQL] ${new Date().toISOString()} message: delete book ${id} successfully`);
        // var original_tokens = res[0].images.split("||");
        var deleteBookList = res[0].images.split("||");

        var deleted_tokens = [];

        //For deletion only
        for (var i = 0; i < deleteBookList.length - 1; i++) {
            deleted_tokens.push(deleteBookList[i]);
        }
        // console.log(deleted_tokens)
        // var deleted_tokens = [];

        //For deletion only
        // for (let token of original_tokens) {
        //     if (!incoming_tokens.includes(token)) {
        //         deleted_tokens.push(token);
        //     }
        // }

        // console.log("The deleted images are: " + deleted_tokens);
        const s3 = new AWS.S3({
            // accessKeyId: bucketConfig.access_keyId,
            // secretAccessKey: bucketConfig.access_key,
            region: bucketConfig.region
        })

        var timeS3deleteall1 = new Date().toISOString();
        logger.info(`[S3] ${timeS3deleteall1} message: delete all images from s3 bucket`);
        deleted_tokens.map((item) => {
            var params = {
                Bucket: bucketConfig.bucket,
                Key: item
            };

            s3.deleteObject(params, function (err, data) {
                if (err)
                    console.log(err);

                console.log(data);
                var timeS3deleteall2 = new Date().toISOString();
                logger.info(`[S3] ${timeS3deleteall2} message: delete all images from s3 bucket successfully`);
                var durationS3deleteall = new Date(timeS3deleteall2).getTime()- new Date(timeS3deleteall1).getTime();
                sdc.timing(`S3ImagesDeleteAll`, durationS3deleteall); 
                // console.log("S3GetImagesDeleteAll: "+ durationS3deleteall);
            });
        });






        var timeSQLdelete1 = new Date().toISOString();
        logger.info(`[SQL] ${timeSQLdelete1} message: delete book ${id}`);
        sql.query("DELETE FROM books WHERE BookId = ?", id, (err, res) => {
            var timeSQLdelete2 = new Date().toISOString();
            var durationSQLdelete1 = new Date(timeSQLdelete2).getTime()- new Date(timeSQLdelete1).getTime();
            sdc.timing(`SQLdeleteBook`, durationSQLdelete1);
            if (err) {
                logger.error(`[SQL] ${new Date().toISOString()} message: fail to delete book ${id}`);
                console.log("error: ", err);
                result(err), null;
                return;
            }

            if (res.affectedRows == 0) {
                // not found Customer with the id
                logger.error(`[SQL] ${new Date().toISOString()} message: fail to delete because no book ${id}`);
                result({ status: "not_found" }, null);
                return;
            }

            // console.log("deleted book with id: ", id);
            logger.info(`[SQL] ${new Date().toISOString()} message: delete book ${id} successfully`);
            result(null, res);
        });
    });
};