'use strict';

const controller = require('../controllers/controllerUser');
module.exports = function (app) {
    app.route('/users')
        // .get(controller.list) //list all the appointments
        .post(controller.create);  //create one user

    app.route('/users/:useremail')
        .get(controller.get)   //search appointment by user email
        .put(controller.update)  //update appointment by email
        .post(controller.login)  //login

    app.route('/users/login')
        .post(controller.login)  //login
        
    app.route('/reset')
        .post(controller.reset)  //reset
        
        
    // app.route('/users/:userid')
    //     .put(controller.update)  //update appointment by id
        // .delete(controller.delete); //delete appointment by id



};