import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Internationalization } from '@syncfusion/ej2-base';

import { FormBuilder, FormGroup, Validators, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';

import { bookData } from '../webapp.model';
import { BookService } from '../services/book.service'
import { environment } from '../../../environments/environment';

import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-modify-book',
  templateUrl: './modify-book.component.html',
  styleUrls: ['./modify-book.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ModifyBookComponent implements OnInit {
   // define FormGroup
   createBookForm: FormGroup;

   book_validation_messages = {
    'ISBN': [
      { type: 'required', message: 'ISBN is required' },
      { type: 'minlength', message: 'ISBN must be at least 1 characters long' },
      { type: 'maxlength', message: 'ISBN cannot be more than 25 characters long' },
      // { type: 'pattern', message: 'Your Firstname must contain only numbers and letters' },
      // { type: 'validUsername', message: 'Your Firstname has already been taken' }
    ],
    'Title': [
      { type: 'required', message: 'Title is required' },
      { type: 'minlength', message: 'Title must be at least 1 characters long' },
      { type: 'maxlength', message: 'Title cannot be more than 100 characters long' },
      // { type: 'pattern', message: 'Your Lastname must contain only numbers and letters' },
      // { type: 'validUsername', message: 'Your username has already been taken' }
    ],
    'Authors': [
      { type: 'required', message: 'Authors is required' },
      { type: 'minlength', message: 'Authors must be at least 1 characters long' },
      { type: 'maxlength', message: 'Authors cannot be more than 100 characters long' },
      // { type: 'pattern', message: 'Authors a valid email' },
      // { type: 'validEmail', message: 'This email has already been taken' }
    ],
    'PublicationDate': [
      { type: 'required', message: 'PublicationDate is required' },
      // { type: 'minlength', message: 'ISBN must be at least 1 characters long' },
      // { type: 'maxlength', message: 'ISBN cannot be more than 25 characters long' },
      // { type: 'pattern', message: 'Your Firstname must contain only numbers and letters' },
      // { type: 'validUsername', message: 'Your Firstname has already been taken' }
    ],
    'Quantity': [
      { type: 'required', message: 'Quantity is required' },
      { type: 'pattern', message: 'Quantity should be 0-999' }
      // { type: 'minlength', message: 'Lastname must be at least 1 characters long' },
      // { type: 'maxlength', message: 'Lastname cannot be more than 25 characters long' },
      // { type: 'pattern', message: 'Your Lastname must contain only numbers and letters' },
      // { type: 'validUsername', message: 'Your username has already been taken' }
    ],
    'Price': [
      { type: 'required', message: 'Price is required' },
      { type: 'pattern', message: 'Price should be 0.01-9999.99' },
      // { type: 'validEmail', message: 'This email has already been taken' }
    ]
  }

  public newBook: string;
  public book: bookData;
  public newBookSave: bookData;
  public bookid: number;
  public useremail: string;

  public Month: Date;
  public Day: Date;
  public Year: Date;
  public dataMonth: string;
  public dataDay: string;
  public dataYear:string;
  public intl: Internationalization = new Internationalization();
  public updateBook: bookData;

  constructor(private logger: NGXLogger, private fb: FormBuilder, public bookService: BookService, public routes: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    var hostname = environment.publicIP; 
    this.bookid = parseInt(this.routes.snapshot.paramMap.get('useremail_bookid').split("_")[1]);
    console.log("this.bookid: "+ this.bookid)
    this.useremail = this.routes.snapshot.paramMap.get('useremail_bookid').split("_")[0];
    if (localStorage.getItem(this.useremail) == null){
      alert("You already signout! Please signin agagin!");
      this.router.navigateByUrl('');
    }
    console.log(" this.useremail: "+ this.useremail)
    var startbookdetail= performance.now(); 
    this.logger.log(`user ${this.useremail} is tring to see book detail.`);
    this.bookService.get(this.bookid).subscribe(book => {
      var durationbookdetail = performance.now() - startbookdetail;
      this.logger.log(`user ${this.useremail},book detail request,${durationbookdetail}`, "statsd");
      this.logger.log(`user ${this.useremail} see book detail successfully.`);
      var imagelist = book.images.split("||");
        book.imageStringList = [];
        for(var i=0; i<imagelist.length-1; i++){
          book.imageStringList.push(`https://${hostname}:3000/book/images/` + imagelist[i]);
        }
      this.book = book;
      // console.log(book);
      this.createForms();
    });
    // this.createForms();
  }

  createForms() {

    // user links form validations
    this.createBookForm = this.fb.group({
      ISBN: new FormControl(this.book.ISBN, Validators.compose([
        Validators.maxLength(25),
        Validators.minLength(1),
        Validators.required
      ])),
      // type: new FormControl(this.types),
      Title: new FormControl(this.book.Title, Validators.compose([
        Validators.maxLength(100),
        Validators.minLength(1),
        Validators.required
      ])),
      Authors: new FormControl(this.book.Authors, Validators.compose([
        // RegisterComponent.validEmail,
        Validators.maxLength(100),
        Validators.minLength(1),
        Validators.required
      ])),
      PublicationDate: [this.book.PublicationDate, Validators.required],
      // type: new FormControl(this.types),
      Quantity: new FormControl(this.book.Quantity, Validators.compose([
        // Validators.maxLength(25),
        // Validators.minLength(1),
        Validators.required,
        Validators.pattern('^(?:[0-9][0-9]?[0-9]?)$')
      ])),
      Price: new FormControl(this.book.Price, Validators.compose([
        // RegisterComponent.validEmail,
        Validators.required,
        Validators.pattern('^(?:0\.0[1-9]|0\.[1-9][1-9]?|[1-9][0-9]?[0-9]?[0-9]?(?:\.[0-9]?[1-9]?)?)$')
      ]))
    })

  }

  getDateFormat(data: any){
    this.Month = new Date(data);
    this.Day = new Date(data);
    this.Year = new Date(data);
    this.dataMonth = `${this.intl.formatDate(this.Month, { skeleton: 'M' })}`;
    this.dataDay = `${this.intl.formatDate(this.Day, { skeleton: 'd' })}`;
    this.dataYear = `${this.intl.formatDate(this.Year, { skeleton: 'y' })}`;
    return `${this.dataYear}-${this.dataMonth}-${this.dataDay}`;
  }

  RemoveImage(image){
    var temp = [];
    for(let token of this.book.imageStringList){
      if(token != image){
        temp.push(token);
      }
    }
    this.book.imageStringList = temp;
    console.log(this.book.imageStringList);

  }

  onSubmitcreateBookForm(value) {
    // console.log(value);

    var newBookItem: any = {};
    newBookItem.ISBN = value.ISBN;
    newBookItem.Title = value.Title;
    newBookItem.Authors = value.Authors;
    newBookItem.PublicationDate = this.getDateFormat(value.PublicationDate);
    newBookItem.Quantity = value.Quantity;
    newBookItem.Price = value.Price;

    var tempImageNames = "";
    for(let imagenamelist of this.book.imageStringList){
      var imagename = imagenamelist.split("/");
      let filename = imagename[imagename.length-1];
      tempImageNames = tempImageNames.concat(filename + "||");
    }
    newBookItem.images = tempImageNames;
    this.newBook = JSON.stringify(newBookItem);
    // console.log(this.newBook)
    var startmodifybook= performance.now(); 
    this.logger.log(`user ${this.useremail} is tring to modify book he sells.`);
    this.bookService.update(this.newBook, this.bookid).subscribe(updateBook => {
      var durationmodifybook = performance.now() - startmodifybook;
      this.logger.log(`user ${this.useremail},modify book request,${durationmodifybook}`, "statsd");
      this.updateBook = updateBook;
      // console.log("this.newUserAccount: "+this.newUserAccount.message)
      if (this.updateBook.message === "successful") {
        this.logger.log(`user ${this.useremail} modifies book he sells successfully.`);
        alert("Update Successfully!")
        this.router.navigateByUrl('/selllist/'+this.useremail);
      }
    });
  };

  cancel(){
    this.router.navigateByUrl('/selllist/'+this.useremail);
  }

}