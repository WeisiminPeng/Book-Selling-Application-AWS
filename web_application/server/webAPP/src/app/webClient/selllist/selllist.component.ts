import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { Internationalization } from '@syncfusion/ej2-base';

import { bookData } from '../webapp.model';
import { BookService } from '../services/book.service'
import { environment } from '../../../environments/environment';

import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-selllist',
  templateUrl: './selllist.component.html',
  styleUrls: ['./selllist.component.scss']
})
export class SelllistComponent implements OnInit {

  public useremail: string;
  public books: Array<bookData>;
  public yes: Boolean = true;
  public resMsg: bookData;
  public dataDate: Date;
  // public hostname = localStorage.getItem("hostname");


  public intl: Internationalization = new Internationalization();

  constructor(private logger: NGXLogger, public bookService: BookService, public routes: ActivatedRoute, private router: Router) { }


  ngOnInit(): void {
    var hostname = environment.publicIP;
    this.useremail = this.routes.snapshot.paramMap.get('useremail');
    if (localStorage.getItem(this.useremail) == null){
      alert("You already signout! Please signin agagin!");
      this.router.navigateByUrl('');
    }
    var startselllist = performance.now();
    this.logger.log(`user ${this.useremail} is tring to list selllist.`);
    this.bookService.listSell(this.useremail).subscribe(books => {
      var durationselllist = performance.now() - startselllist;
      this.logger.log(`user ${this.useremail},selllist request,${durationselllist}`, "statsd");
      this.logger.log(`user ${this.useremail} list selllist successfully.`);
      // this.books = books;
      if(books[0].message !== "empty_selllist"){
      for (let book of books) {
          var imagelist = book.images.split("||");
          book.imageStringList = [];
          for (var i = 0; i < imagelist.length - 1; i++) {
            book.imageStringList.push(`https://${hostname}:3000/book/images/` + imagelist[i]);
          }
      }
      this.books = books;
    }
      // console.log(this.books)
    });
  }

  deleteBook(data: any) {
    // console.log("data.id: "+ data.BookId);
    var result = confirm("Are you sure you want to delete this book?");
    if (result) {
      var startdeletebook = performance.now();
      this.logger.log(`user ${this.useremail} is tring to delete book he sells.`);
      this.bookService.delete(data.BookId).subscribe(deleteMsg => {
        var durationdeletebook = performance.now() - startdeletebook;
        this.logger.log(`user ${this.useremail},delete book request,${durationdeletebook}`, "statsd");
        this.resMsg = deleteMsg;
        if (this.resMsg.message == "successfully") {
          this.logger.log(`user ${this.useremail} deletes book successfully.`);
          alert("Delete successfully!")
          location.reload();
        }
      });
    }
  };

  getPublicationDate(data: any) {
    this.dataDate = new Date(data);
    return `${this.intl.formatDate(this.dataDate, { skeleton: 'yMMMd' })}`;
  }

  createBook() {
    this.router.navigateByUrl('/createBook/' + this.useremail);
  }

  updateBook(data: any) {
    this.router.navigateByUrl('/updateBook/' + data.email + '_' + data.BookId);
  };

}
