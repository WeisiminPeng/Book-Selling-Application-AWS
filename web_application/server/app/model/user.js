'use strict';
// model user
const User= function(user) {
    this.email = user.email;
    this.firstname = user.firstname;
    this.lastname = user.lastname;
    this.password = user.password;
    // this.type = user.type;
  };

module.exports = User;