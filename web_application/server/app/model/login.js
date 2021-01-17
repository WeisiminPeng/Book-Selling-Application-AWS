'use strict';
// model user
const Login= function(login) {
    this.email = login.email;
    this.password = login.password;
  };

module.exports = Login;