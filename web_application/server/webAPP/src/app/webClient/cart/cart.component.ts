import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { Internationalization } from '@syncfusion/ej2-base';

import { bookData, cartData } from '../webapp.model';
import { CartService } from '../services/cart.service';
import { environment } from '../../../environments/environment';

import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {

  constructor(private logger: NGXLogger, public cartService: CartService, public routes: ActivatedRoute, private router: Router) { }

  public useremail: string;
  public books: Array<bookData>;
  public intl: Internationalization = new Internationalization();
  public dataDate: Date;

  ngOnInit(): void {
    var hostname = environment.publicIP; 
    // console.log(hostname)
    // this.bookid = parseInt(this.routes.snapshot.paramMap.get('bookid_useremail').split("_")[1]);
    this.useremail = this.routes.snapshot.paramMap.get('useremail');
    if (localStorage.getItem(this.useremail) == null){
      alert("You already signout! Please signin agagin!");
      this.router.navigateByUrl('');
    }
    var startCartlist = performance.now(); 
    this.logger.log(`user ${this.useremail} is tring to list cartlist.`);
    this.cartService.get(this.useremail).subscribe(books => {
      var durationCartlist = performance.now() - startCartlist;
      this.logger.log(`user ${this.useremail},listcart request,${durationCartlist}`, "statsd");
      this.logger.log(`user ${this.useremail} lists cartlist successfully.`);
      for(let book of books){
        var imagelist = book.images.split("||");
        book.imageStringList = [];
        for(var i=0; i<imagelist.length-1; i++){
          book.imageStringList.push(`https://${hostname}:3000/book/images/` + imagelist[i]);
          console.log(book.imageStringList)
        }
      }
      this.books = books;
      // console.log(books);
    });
  }

  getPublicationDate(data: any) {
    this.dataDate = new Date(data);
    return `${this.intl.formatDate(this.dataDate, { skeleton: 'yMMMd' })}`;
  }

}
