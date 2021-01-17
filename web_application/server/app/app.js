'use strict';
module.exports = function(app){
    //Register the data model to MongoDB
    // 
    // const models = require('./models/index');
    // 
    
    //Initialize routes
    const routes = require("./routes/index");
    routes(app);
}