'use strict';

const controller = require('../controllers/controllerLog');
module.exports = function (app) {
    app.route('/logs')
        .post(controller.create);  //create logs
};