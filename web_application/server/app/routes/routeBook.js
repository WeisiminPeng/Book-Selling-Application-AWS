'use strict';

const controller = require('../controllers/controllerBook');
module.exports = function (app) {
    app.route('/books/:useremail')
        .get(controller.list) //list all the appointments
        .post(controller.upload.array("imageFile"),controller.create);  //create one book

    app.route('/books/sell/:useremail')
        .get(controller.getAll)   //get all book this user sell

    app.route('/book/:id')
        .get(controller.get)  //get one book by id
        .put(controller.update)  //update one book by id
        .delete(controller.delete); //delete book by id
    
    app.route('/book/images/:imagename')
       .get(controller.transferImage)
        

};