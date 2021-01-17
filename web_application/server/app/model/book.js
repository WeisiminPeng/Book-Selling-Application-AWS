'use strict';
// model user
const Book= function(book) {
    this.ISBN= book.ISBN;
    this.Title = book.Title;
    this.Authors = book.Authors;
    this.PublicationDate = book.PublicationDate;
    this.Quantity = book.Quantity;
    this.Price = book.Price;
    this.email = book.email;
    this.images = book.images;
  };

module.exports = Book;