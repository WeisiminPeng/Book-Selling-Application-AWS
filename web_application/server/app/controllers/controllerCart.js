'use strict';
const logger = require('../config/winston.config.js');
const sdc = require('../config/statsd_cliect.config.js')

// model Cart
const Cart = require("../model/cart");

//Import specific operations to database
const service = require('../services/serviceCart');


// Create and Save a new Cart
exports.create = async (req, res) => {
    // Validate request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    // Create a Cart
    const newCart = new Cart({
        BookId: req.body.BookId,
        selleremail: req.body.selleremail,
        buyeremail: req.body.buyeremail,
    });

    // Save user in the database
    service.create(newCart, (err, cart) => {
        if (err)
            res.status(200).send({
                message:
                    "error"
                // err.message || "Some error occurred while creating the User."
            });
        else res.status(200).send({
            message: "Success Add!"
        });
    });
};

// Retrieve all carts by useremail from the database.
exports.getAll = (req, res) => {
    service.getAll(req.params.useremail,(err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving carts."
        });
      else res.send(data);
    });
  };
  
