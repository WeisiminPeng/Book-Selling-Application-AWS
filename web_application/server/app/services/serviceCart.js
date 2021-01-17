'use strict';
const logger = require('../config/winston.config.js');
const sdc = require('../config/statsd_cliect.config.js')
// Connect to local MySQL database webappdb
const sql = require("../db.js");

// model User
const Cart = require("../model/cart.js")

// save new cart into db
exports.create = (newCart, result) => {
  var timeSQLcreate1 = new Date().toISOString();
  logger.info(`[SQL] ${timeSQLcreate1} message: add book into cart in SQL dataset`);
    sql.query("INSERT INTO carts  SET ?", newCart, (err, res) => {
      var timeSQLcreate2 = new Date().toISOString();
      var durationSQLcreate = new Date(timeSQLcreate2).getTime()- new Date(timeSQLcreate1).getTime();
      sdc.timing(`SQLcreatCart`, durationSQLcreate); 
        if (err) {
          logger.error(`[SQL] ${new Date().toISOString()} message: fail to add book into cart in SQL dataset`);
            console.log("error: ", err);
            result(err, null);
        } else {
          logger.info(`[SQL] ${new Date().toISOString()} message: add book into cart in SQL dataset successfully`);
            // console.log("created cart: ", { ...newCart });
            result(null, { ...newCart });
        }
    });
};

// retrive all the books in carts by useremail
exports.getAll = (useremail, result) => {
    // console.log("useremail: "+useremail);
    var timeSQLlist1 = new Date().toISOString();
    logger.info(`[SQL] ${timeSQLlist1} message: retrive all the books in ${useremail}'s cart`);
    sql.query(`SELECT BookId FROM carts WHERE buyeremail ="${useremail}"`, (err, res) => {
      var timeSQLlist2 = new Date().toISOString();
      var durationSQLlist = new Date(timeSQLlist2).getTime()- new Date(timeSQLlist1).getTime();
      sdc.timing(`SQLcartBookList`, durationSQLlist); 
      if (err) {
        logger.error(`[SQL] ${new Date().toISOString()} message: fail to retrive all the books in ${useremail}'s cart`);
        console.log("error: ", err);
        result(null, err);
        return;
      }
      logger.info(`[SQL] ${new Date().toISOString()} message: retrive all the books in ${useremail}'s cart successfully`);
    //   console.log("bookid: "+res);
  
      const books = [];
    // books : [];
      res.forEach(curId =>{
        var timeSQLget1 = new Date().toISOString();
        logger.info(`[SQL] ${timeSQLget1} message: get book ${curId.BookId}`);
        // console.log("curId.BookId: "+curId.BookId);
        sql.query(`SELECT * FROM books WHERE BookId ="${curId.BookId}"`, (err, res1) => {
          var timeSQLget2 = new Date().toISOString();
          var durationSQLget = new Date(timeSQLget2).getTime()- new Date(timeSQLget1).getTime();
          sdc.timing(`SQLgetbook`, durationSQLget); 
            if (err) {
              logger.error(`[SQL] ${new Date().toISOString()} message: fail to get book ${curId.BookId}`);
              console.log("error: ", err);
              result(null, err);
              return;
            }
            logger.info(`[SQL] ${new Date().toISOString()} message: get book ${curId.BookId} successfully`);
            // console.log("res1[0].BookId: "+res1[0].BookId);
            books.push({
                BookId: res1[0].BookId,
                ISBN: res1[0].ISBN,
                Title: res1[0].Title,
                Authors: res1[0].Authors,
                PublicationDate: res1[0].PublicationDate,
                Quantity: res1[0].Quantity,
                Price: res1[0].Price,
                images: res1[0].images
            });
            // console.log("books: ", books);
            if(books.length == res.length){
            // console.log("carts: ", books);
            result(null, books);}
        });
      });
        // console.log("carts: ", books);
        // result(null, books);
    });
  };

  


