'use strict';

const RouteUser= require('./../routes/routeUser');
const RouteBook= require('./../routes/routeBook');
const RouteCart= require('./../routes/routeCart');
const RouteLog= require('./../routes/routeLog');

module.exports = (app) => {
    RouteUser(app);
    RouteBook(app);
    RouteCart(app);
    RouteLog(app);
};