import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormGroupDirective, NgForm } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import { UserService } from '../services/user.service'
import { userData} from '../webapp.model';

@Component({
  selector: 'app-user-detail-info',
  templateUrl: './user-detail-info.component.html',
  styleUrls: ['./user-detail-info.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UserDetailInfoComponent implements OnInit {

  userInfoForm: FormGroup;

  constructor(private fb: FormBuilder,public userService: UserService, public routes: ActivatedRoute, private router: Router) { }

  account_validation_messages = {
    'firstname': [
      { type: 'required', message: 'Firstname is required' },
      { type: 'minlength', message: 'Firstname must be at least 1 characters long' },
      { type: 'maxlength', message: 'Firstname cannot be more than 25 characters long' },
      // { type: 'pattern', message: 'Your Firstname must contain only numbers and letters' },
      // { type: 'validUsername', message: 'Your Firstname has already been taken' }
    ],
    'lastname': [
      { type: 'required', message: 'Lastname is required' },
      { type: 'minlength', message: 'Lastname must be at least 1 characters long' },
      { type: 'maxlength', message: 'Lastname cannot be more than 25 characters long' },
      // { type: 'pattern', message: 'Your Lastname must contain only numbers and letters' },
      // { type: 'validUsername', message: 'Your username has already been taken' }
    ],
    // 'email': [
    //   { type: 'required', message: 'Email is required' },
    //   { type: 'pattern', message: 'Enter a valid email' },
    //   { type: 'validEmail', message: 'This email has already been taken' }
    // ],
    'password': [
      { type: 'required', message: 'Password is required' },
      { type: 'minlength', message: 'Password must be at least 8 characters long' },
      { type: 'pattern', message: 'Your password must contain at least one uppercase, one lowercase, and one number' }
    ]
    // 'terms': [
    //   { type: 'pattern', message: 'You must accept terms and conditions' }
    // ]
  }

  public types = [
    "Seller",
    "Buyer",
    "Both"
  ];

  public useremail:string;
  public currentUser: userData;
  public currentEmail: string;
  public currentFirstname: string;
  public currentLastname: string;
  public currentType:string;
  public updateUser: string;
  public updatedUser: userData;
  


  ngOnInit(): void {
    this.useremail = this.routes.snapshot.paramMap.get('useremail');
    if (localStorage.getItem(this.useremail) == null){
      alert("You already signout! Please signin agagin!");
      this.router.navigateByUrl('');
    }
    // console.log(this.useremail);
    this.userService.get(this.useremail).subscribe(currentUser => {
      this.currentUser = currentUser;
      this.currentEmail = this.currentUser.email;
      this.currentFirstname = this.currentUser.firstname;
      this.currentLastname = this.currentUser.lastname;
      this.currentType = this.currentUser.type;
      // console.log("this.currentUser.type: "+this.currentUser.type)
      this.createForms();

    });
    // this.createForms();
  }

  createForms() {
     // user details form validations
     this.userInfoForm = this.fb.group({
      password: new FormControl('', Validators.compose([
        Validators.minLength(8),
        Validators.required,
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]+$')
      ])),
      firstname: new FormControl(this.currentFirstname, Validators.compose([
        //  UsernameValidator.validUsername,
         Validators.maxLength(25),
         Validators.minLength(1),
        //  Validators.pattern('^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$'),
         Validators.required
        ])),
        // type: new FormControl(this.types[0]),
        lastname: new FormControl(this.currentLastname, Validators.compose([
          //  UsernameValidator.validUsername,
           Validators.maxLength(25),
           Validators.minLength(1),
          //  Validators.pattern('^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$'),
           Validators.required
          ])),
        email: new FormControl({value: this.currentEmail, disabled: true}, Validators.compose([
          // RegisterComponent.validEmail,
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ])),
    });
  }


  onSubmituserInfoForm(value){
    // console.log(value);

    var newUserItem: any = {};
    newUserItem.firstname = value.firstname;
    newUserItem.lastname = value.lastname;
    newUserItem.email = value.email;
    // newUserItem.type = value.type;
    newUserItem.password = value.password;
    this.updateUser = JSON.stringify(newUserItem);
    // console.log(this.updateUser)
    this.userService.update(this.updateUser, this.useremail).subscribe(updatedUser => {
      this.updatedUser = updatedUser;
      // console.log("this.updatedUser: "+this.updatedUser.message)
      if(this.updatedUser.message === "successful"){
        alert("Updated Successfully!");
        location.reload();
      }
    });


  };

  // logout() {
  //   // remove user from local storage to log user out
  //   localStorage.removeItem(this.useremail);
  //   this.router.navigateByUrl('');
  // };



}
