import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Internationalization } from '@syncfusion/ej2-base';

import { FormBuilder, FormGroup, Validators, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';

import { bookData } from '../webapp.model';
import { BookService } from '../services/book.service'

import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-create-book',
  templateUrl: './create-book.component.html',
  styleUrls: ['./create-book.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CreateBookComponent implements OnInit {

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
  public newBookItem: bookData;
  public newBookSave: bookData;
  public useremail: string;

  public Month: Date;
  public Day: Date;
  public Year: Date;
  public dataMonth: string;
  public dataDay: string;
  public dataYear:string;
  public intl: Internationalization = new Internationalization();

  public selectedFile: File
  public images = [];
  public url: string | ArrayBuffer
  public imageSave: string = ""
  public imageFiles = [];

  constructor(private logger: NGXLogger, private fb: FormBuilder, public bookService: BookService, public routes: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.useremail = this.routes.snapshot.paramMap.get('useremail');
    if (localStorage.getItem(this.useremail) == null){
      alert("You already signout! Please signin agagin!");
      this.router.navigateByUrl('');
    }
    this.createForms();
  }

  myForm = new FormGroup({
   file: new FormControl('', [Validators.required]),
   fileSource: new FormControl('', [Validators.required])
 });
 get f(){
  return this.myForm.controls;
}

  createForms() {

    // user links form validations
    this.createBookForm = this.fb.group({
      ISBN: new FormControl('', Validators.compose([
        Validators.maxLength(25),
        Validators.minLength(1),
        Validators.required
      ])),
      // type: new FormControl(this.types),
      Title: new FormControl('', Validators.compose([
        Validators.maxLength(100),
        Validators.minLength(1),
        Validators.required
      ])),
      Authors: new FormControl('', Validators.compose([
        // RegisterComponent.validEmail,
        Validators.maxLength(100),
        Validators.minLength(1),
        Validators.required
      ])),
      PublicationDate: ['', Validators.required],
      // type: new FormControl(this.types),
      Quantity: new FormControl('', Validators.compose([
        // Validators.maxLength(25),
        // Validators.minLength(1),
        Validators.required,
        Validators.pattern('^(?:[0-9][0-9]?[0-9]?)$')
      ])),
      Price: new FormControl('', Validators.compose([
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

  onSubmitcreateBookForm(value) {
    // console.log(value);

    var newBookItem: any = {};
    newBookItem.ISBN = value.ISBN;
    newBookItem.Title = value.Title;
    newBookItem.Authors = value.Authors;
    newBookItem.PublicationDate = this.getDateFormat(value.PublicationDate);
    newBookItem.Quantity = value.Quantity;
    newBookItem.Price = value.Price;
    // newBookItem.images = this.imageFiles;
    this.newBook = JSON.stringify(newBookItem);
    console.log(this.newBook)
    console.log(this.imageFiles)
    var startCreatebook = performance.now(); 
    this.logger.log(`user ${this.useremail} is tring to create new book.`);
    this.bookService.save(this.newBook, this.useremail, this.imageFiles).subscribe(newBookSave => {
      var durationCreatebook = performance.now() - startCreatebook;
      this.logger.log(`user ${this.useremail},create book request,${durationCreatebook}`, "statsd");
      this.newBookSave = newBookSave;
      // console.log("this.newUserAccount: "+this.newUserAccount.message)
      if (this.newBookSave.message === "Success Create!") {
        this.logger.log(`user ${this.useremail} creates new book successfully.`);
        alert("Create Successfully!")
        this.router.navigateByUrl('/selllist/'+this.useremail);
      }
    });
  };

  // onSelectFile(event) {
  //   if (event.target.files && event.target.files[0]) {
  //     this.selectedFile = event.target.files[0]
  //     var reader = new FileReader();
  //     reader.readAsDataURL(event.target.files[0]); // read file as data url
  //     reader.onload = (event) => { // called once readAsDataURL is completed
  //       this.url = event.target.result;
  //     }
  //   } 
  // }

  onFileChange(event) {
    if (event.target.files && event.target.files[0]) {
        var filesAmount = event.target.files.length;
        for (let i = 0; i < filesAmount; i++) {
          this.imageFiles.push(event.target.files[i]);
                var reader = new FileReader();
                reader.onload = (event:any) => {
                  // console.log(event.target.result);
                   this.images.push(event.target.result); 
   
                   this.myForm.patchValue({
                      fileSource: this.images
                   });
                }
                reader.readAsDataURL(event.target.files[i]);
        }
    }
  }

  
  submit(){
    // console.log(this.myForm.value.fileSource);
    // for(var i=0;i<this.myForm.value.fileSource.length;i++){
    //       // this.imageSave = `${this.myForm.value.fileSource[i]}_${this.imageSave}`;
    //       this.imageSave = `${i}_${this.imageSave}`;
    // }
    // alert("Save Images successfully!")
    // console.log(this.imageSave)
    // this.http.post('http://localhost:8001/upload.php', this.myForm.value)
    //   .subscribe(res => {
    //     console.log(res);
    //     alert('Uploaded Successfully.');
    //   })
  // }
}

  cancel(){
    this.router.navigateByUrl('/selllist/'+this.useremail);
  }

}