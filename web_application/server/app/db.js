'use strict';
const mysql = require("mysql");
const dbConfig = require("./config/db.config.js");
const logger = require('./config/winston.config.js');
// const Sequelize = require('sequelize');

var connection = mysql.createConnection({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  ssl: 'Amazon RDS'
});

// const connection = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
//   host: dbConfig.HOST,
//   dialect: mysql/* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */
// });

// open the MySQL connection
connection.connect(function (err) {
  if (err) throw err;
  console.log("Successfully connected to the database.");
  logger.info(`${new Date(new Date().toUTCString()).toISOString()} message: Successfully connected to the database.`);

  // var cartExist = "DROP TABLE IF EXISTS `carts`;"
  // connection.query(cartExist, function (err, result) {
  //   if (err) throw err;

  //   var bookExist = "DROP TABLE IF EXISTS `books`;"
  //   connection.query(bookExist, function (err, result) {
  //     if (err) throw err;

  //     var userExist = "DROP TABLE IF EXISTS `users`;"
  //     connection.query(userExist, function (err, result) {
  //       if (err) throw err;

        var usertable = "CREATE TABLE IF NOT EXISTS `users` (`email` varchar(255) NOT NULL," +
          "`firstname` varchar(255) NOT NULL,`lastname` varchar(255) NOT NULL," +
          "`password` varchar(255) NOT NULL,PRIMARY KEY (`email`)) ENGINE=InnoDB DEFAULT CHARSET=utf8;"
        connection.query(usertable, function (err, result) {
          if (err) throw err;
          console.log("Users Table created!");
          logger.info(`${new Date(new Date().toUTCString()).toISOString()} message: Users Table created!`);

          var booktable = "CREATE TABLE IF NOT EXISTS `books` (`BookId` int NOT NULL AUTO_INCREMENT," +
            "`ISBN` text,`images` text, `Title` text,`Authors` varchar(255) DEFAULT NULL," +
            "`PublicationDate` date DEFAULT NULL,`Quantity` int DEFAULT NULL," +
            "`Price` double DEFAULT NULL,`Created` timestamp NULL DEFAULT CURRENT_TIMESTAMP," +
            "`Updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP," +
            "`email` varchar(255) NOT NULL,PRIMARY KEY (`BookId`),KEY `sellemail` (`email`)," +
            "CONSTRAINT `sellemail` FOREIGN KEY (`email`) REFERENCES `users` (`email`) " +
            "ON DELETE CASCADE) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8;"
          connection.query(booktable, function (err, result) {
            if (err) throw err;
            console.log("Books Table created!");
            logger.info(`${new Date(new Date().toUTCString()).toISOString()} message: Books Table created!`);

            var carttable = "CREATE TABLE IF NOT EXISTS `carts` (`BookId` int NOT NULL," +
              "`selleremail` varchar(255) NOT NULL,`buyeremail` varchar(255) NOT NULL," +
              "KEY `bookid` (`BookId`),CONSTRAINT `bookid` FOREIGN KEY (`BookId`) REFERENCES `books` " +
              "(`BookId`) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8;"
            connection.query(carttable, function (err, result) {
              if (err) throw err;
              console.log("Carts Table created!");
              logger.info(`${new Date(new Date().toUTCString()).toISOString()} message: Carts Table created!`);
              connection.query("INSERT INTO users (firstname, lastname, email, password) SELECT 'John', 'Doe', 'peng@gmail.com', '$2b$10$ty0GS18/62m8fKBBsVT4h.dNOvuN4jCVCwkCQlC79fS85pbJUSxZO' WHERE NOT EXISTS ( SELECT email FROM users WHERE email = 'peng@gmail.com');", function (err, result) {
                if (err) throw err;
                console.log("Test User created!");
                logger.info(`${new Date(new Date().toUTCString()).toISOString()} message: Test User created!`);
                let sql= "show status like 'Ssl_version'";
                connection.query(sql, function (err, result) {
                  console.log(result);
                  logger.info(`${new Date(new Date().toUTCString()).toISOString()} message: SSL result ${result}`);
                })
              });
            });
          });
        });
      });
//     });
//   });

// });


module.exports = connection;