'use strict';

const controller = require('../controllers/controllerCart');
module.exports = function (app) {
    app.route('/carts')
    //     .get(controller.list) //list all the books in cart
        .post(controller.create);  //create one cart

    app.route('/carts/:useremail')
        .get(controller.getAll)   //get all book in user's carts

    // app.route('/carts/:bookid')
    //     .post(controller.get)  //get one book by id
    //     .put(controller.update)  //update one book by id
    //     .delete(controller.delete); //delete appointment by id
        

};