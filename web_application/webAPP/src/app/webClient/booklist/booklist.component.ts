import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { Internationalization } from '@syncfusion/ej2-base';

import { bookData, cartData } from '../webapp.model';
import { BookService } from '../services/book.service';
import { CartService } from '../services/cart.service'
import { environment } from '../../../environments/environment';

import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-booklist',
  templateUrl: './booklist.component.html',
  styleUrls: ['./booklist.component.scss']
})
export class BooklistComponent implements OnInit {

  constructor(private logger: NGXLogger, public cartService: CartService, public bookService: BookService, public routes: ActivatedRoute, private router: Router) { }

  public useremail: string;
  public books: Array<bookData>;
  public sortBooks: Array<bookData>;
  public intl: Internationalization = new Internationalization();
  public dataDate: Date;
  public cart: cartData;
  public newCart: string;
  public newBook: string;
  public updateBook: bookData;

  public Month: Date;
  public Day: Date;
  public Year: Date;
  public dataMonth: string;
  public dataDay: string;
  public dataYear: string;
  public dataA: bookData;
  public dataB: bookData;

  ngOnInit(): void {
    var hostname = environment.publicIP;
    this.useremail = this.routes.snapshot.paramMap.get('useremail');
    if (localStorage.getItem(this.useremail) == null){
      alert("You already signout! Please signin agagin!");
      this.router.navigateByUrl('');
    }
    var startbooklist = performance.now();
    this.logger.log(`user ${this.useremail} is tring to list booklist.`);
    this.bookService.list(this.useremail).subscribe(books => {
      var durationLogin = performance.now() - startbooklist;
      this.logger.log(`user ${this.useremail},listbook request,${durationLogin}`, "statsd");
      this.logger.log(`user ${this.useremail} list booklist successfully.`);
      // console.log(books)
      if(books[0].message !== "empty_booklist"){
      // this.books = books;
      for (let book of books) {
        // console.log(book)
        // if (book.message == "empty_booklist") {
        //   break;
        // }
        // else {
          this.logger.log(`bookTitle,${book.Title}`, "statsd");
          var imagelist = book.images.split("||");
          book.imageStringList = [];
          for (var i = 0; i < imagelist.length - 1; i++) {
            book.imageStringList.push(`https://${hostname}:3000/book/images/` + imagelist[i]);
          }
        }
        this.books = books;
        this.books.sort(this.GetSortOrder("Price")).sort(this.GetSortOrder("Title"));
      }
      // this.books = books;
      // this.books.sort(this.GetSortOrder("Price")).sort(this.GetSortOrder("Title"));
      // console.log(this.sortBooks);
    });
  }

  GetSortOrder(prop) {
    return function (a, b) {
      if (a[prop] > b[prop]) {
        return 1;
      } else if (a[prop] < b[prop]) {
        return -1;
      }
      return 0;
    }
  }

  getPublicationDate(data: any) {
    this.dataDate = new Date(data);
    return `${this.intl.formatDate(this.dataDate, { skeleton: 'yMMMd' })}`;
  }
  addInCart(value: any) {
    var newcartItem: any = {};
    newcartItem.BookId = value.BookId;
    newcartItem.selleremail = value.email;
    newcartItem.buyeremail = this.useremail;
    this.newCart = JSON.stringify(newcartItem);
    // console.log(this.newCart)
    var startBookToCart = performance.now();
    this.logger.log(`user ${this.useremail} is tring to add book to cart.`);
    this.cartService.save(this.newCart).subscribe(cart => {
      var durationBookToCart = performance.now() - startBookToCart;
      this.logger.log(`user ${this.useremail},book to cart request,${durationBookToCart}`, "statsd");
      this.cart = cart;
      if (this.cart.message === "Success Add!") {
        this.logger.log(`user ${this.useremail} add book to cart successfully.`);
        // console.log(cart);

        // console.log(value)
        var newBookItem: any = {};
        newBookItem.ISBN = value.ISBN;
        newBookItem.Title = value.Title;
        newBookItem.Authors = value.Authors;
        newBookItem.PublicationDate = this.getDateFormat(value.PublicationDate);
        newBookItem.Quantity = value.Quantity - 1;
        newBookItem.Price = value.Price;
        newBookItem.images = value.images;

        this.newBook = JSON.stringify(newBookItem);
        // console.log(this.newBook)
        var startCartBookUpdate = performance.now();
        this.logger.log(`book ${value.BookId} update because of adding to cart.`);
        this.bookService.update(this.newBook, value.BookId).subscribe(updateBook => {
          var durationCartBookUpdate = performance.now() - startCartBookUpdate;
          this.logger.log(`user ${this.useremail},update book when adding to cart request,${durationCartBookUpdate}`, "statsd");
          this.updateBook = updateBook;
          // console.log("this.newUserAccount: "+this.newUserAccount.message)
          if (this.updateBook.message === "successful") {
            this.logger.log(`book ${value.BookId} update because of adding to cart successfully.`);
            var result = confirm("Do you want to check your cart now?");
            if (result) {
              this.router.navigateByUrl('/cart/' + this.useremail);
            } else {
              location.reload();
            }
          }
        });
      }
    });
  };

  getDateFormat(data: any) {
    this.Month = new Date(data);
    this.Day = new Date(data);
    this.Year = new Date(data);
    this.dataMonth = `${this.intl.formatDate(this.Month, { skeleton: 'M' })}`;
    this.dataDay = `${this.intl.formatDate(this.Day, { skeleton: 'd' })}`;
    this.dataYear = `${this.intl.formatDate(this.Year, { skeleton: 'y' })}`;
    return `${this.dataYear}-${this.dataMonth}-${this.dataDay}`;
  }

}
