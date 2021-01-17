'use strict';
// model user
const Cart= function(cart) {
    this.BookId = cart.BookId;
    this.selleremail = cart.selleremail;
    this.buyeremail = cart.buyeremail;
  };

module.exports = Cart;