'use strict';
const logger = require('../config/winston.config.js');
const sdc = require('../config/statsd_cliect.config.js')
// Connect to local MySQL database webappdb
const sql = require("../db.js");
let jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);



// model User
const User = require("../model/user.js")

// save new user into db
exports.create = (newUser, result) => {
    var timeSQLcreate1 = new Date().toISOString();
    logger.info(`[SQL] ${timeSQLcreate1} message: insert new user in SQL dataset`);
    sql.query("INSERT INTO users  SET ?", newUser, (err, res) => {
        var timeSQLcreate2 = new Date().toISOString();
        var durationSQLcreate = new Date(timeSQLcreate2).getTime()- new Date(timeSQLcreate1).getTime();
        sdc.timing(`SQLcreatUser`, durationSQLcreate); 
        if (err) {
            logger.error(`[SQL] ${new Date().toISOString()} message: fail to insert new user in SQL dataset`);
            console.log("error: ", err);
            result(err, null);
        } else {
            logger.info(`[SQL] ${new Date().toISOString()} message: insert new user in SQL dataset successfully`);
            // console.log("created user: ", { ...newUser });
            result(null, { ...newUser });
        }
    });
};

// get user info by user email
exports.get = (useremail, result) => {
    var timeSQLget1 = new Date().toISOString();
    logger.info(`[SQL] ${timeSQLget1} message: get user ${useremail}`);
    sql.query(`SELECT * FROM users WHERE email = "${useremail}"`, (err, res) => {
        var timeSQLget2 = new Date().toISOString();
        var durationSQLget = new Date(timeSQLget2).getTime()- new Date(timeSQLget1).getTime();
        sdc.timing(`SQLgetUser`, durationSQLget); 
        if (err) {
            logger.error(`[SQL] ${new Date().toISOString()} message: fail to get user ${useremail}`);
            console.log("error: ", err);
            result(err, null);
        } else if (res.length) {
            logger.info(`[SQL] ${new Date().toISOString()} message: get user ${useremail} successfully`);
            // console.log("found user: ", res[0]);
            result(null, res[0]);
        }
        else {
            result({ status: "no_record" }, null);
            logger.error(`[SQL] ${new Date().toISOString()} message: no record for user ${useremail}`);
        }
    });
};


exports.update = (useremail, user, result) => {
    
    var timeSQLget11 = new Date().toISOString();
    logger.info(`[SQL] ${timeSQLget11} message: update user ${useremail}`);
    sql.query("UPDATE users SET firstname = ?, lastname = ?, password = ? WHERE email = ?",
        [user.firstname, user.lastname, user.password, useremail],
        (err, res) => {
            var timeSQLget12 = new Date().toISOString();
            var durationSQLget1 = new Date(timeSQLget12).getTime()- new Date(timeSQLget11).getTime();
            sdc.timing(`SQLupdateBook`, durationSQLget1);
            if (err) {
                logger.error(`[SQL] ${new Date().toISOString()} message: fail to update user ${useremail}`);
                console.log("error: ", err);
                result(null, err);
                return;
            } else if (res.affectedRows == 0) {
                // not found user with the email
                logger.error(`[SQL] ${new Date().toISOString()} message: no record for user ${useremail}`);
                result({ status: "no_record" }, null);
                return;
            } else {
                // console.log("updated user: ", { ...user });
                logger.info(`[SQL] ${new Date().toISOString()} message: update user ${useremail} successfully`);
                result(null, { ...user });
            }
        }
    );
};

//login
exports.login = (loginAccount, result) => {
    var timeSQLlogin1 = new Date().toISOString();
    logger.info(`[SQL] ${timeSQLlogin1} message:  user ${loginAccount.email} login`);
    sql.query(`SELECT Password FROM users WHERE email = "${loginAccount.email}"`, (err, res) => {
        var timeSQLlogin2 = new Date().toISOString();
        var durationSQLlogin = new Date(timeSQLlogin2).getTime()- new Date(timeSQLlogin1).getTime();
        sdc.timing(`SQLlogin`, durationSQLlogin);
        if (err) {
            logger.error(`[SQL] ${new Date().toISOString()} message:  user ${loginAccount.email} fails to login`);
            console.log("error: ", err);
            result(err, null);
        } else if (res.length) {
            // console.log("found user: ", res[0]);
            let pwd = JSON.stringify(res[0]);
            // console.log("pws: " + pwd);
            let pwd2 = JSON.parse(pwd);
            // console.log("pwd2: "+ pwd2);
            let hash = pwd2.Password;
            // console.log("db's password: " + hash);
            // console.log("input password: " + loginAccount.password)
            bcrypt.compare(loginAccount.password, hash, (err, match) => {
                if (err) {
                    result(err, null);
                }
                else {
                    if (match) {
                        logger.info(`[SQL] ${new Date().toISOString()} message:  user ${loginAccount.email} login successfully`);
                        result(null, { status: "success" });
                        // let token = jwt.sign({ "IsAdmin": pwd2[0].IsAdmin }, "secret", { algorithm: 'HS256' }, { expiresIn: '300s' });
                        // res.status(200).send({
                        //     Statu_Code: 200,
                        //     Message: "Authentication successful ",
                        //     token: token
                        // });
                    }
                    else {
                        logger.error(`[SQL] ${new Date().toISOString()} message:  user ${loginAccount.email} inputs wrong password`);
                        result(null, { status: "wrong" });
                    }

                    // result(err, match);
                    // console.log("result" + result);
                    // });
                }
                // else result({ status: "no_record" }, null);
            });
        }
        else {
            result({ status: "no_record" }, null);
            logger.error(`[SQL] ${new Date().toISOString()} message:  no record of user ${loginAccount.email}`);
        }
    });
};

