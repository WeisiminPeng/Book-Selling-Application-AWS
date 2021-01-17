import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as bcrypt from 'bcryptjs';

import { UserService } from '../services/user.service'
import { userData} from '../webapp.model';

import { NGXLogger } from 'ngx-logger';

// import { PasswordValidator,ParentErrorStateMatcher} from '../validators';
// import { EmailValidator} from '../validators';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RegisterComponent implements OnInit {

  // define FormGroup
  userRegisterForm: FormGroup;
  matching_passwords_group: FormGroup;

  parentErrorStateMatcher = new ParentErrorStateMatcher();

  // need format change!!!!!
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
    'email': [
      { type: 'required', message: 'Email is required' },
      { type: 'pattern', message: 'Enter a valid email' },
      { type: 'validEmail', message: 'This email has already been taken' }
    ],
    'confirm_password': [
      { type: 'required', message: 'Confirm password is required' },
      { type: 'areEqual', message: 'Password mismatch' }
    ],
    'password': [
      { type: 'required', message: 'Password is required' },
      { type: 'minlength', message: 'Password must be at least 8 characters long' },
      { type: 'pattern', message: 'Your password must contain at least one uppercase, one lowercase, and one number' }
    ]
  }

  public Password: string;
  public newUser: string;
  public newUserAccount: userData;

  public types = [
    "Seller",
    "Buyer",
    "Both"
  ];




  constructor(private logger: NGXLogger, private fb: FormBuilder,public userService: UserService, public routes: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.createForms();
  }

  createForms() {
    // matching passwords validation
    this.matching_passwords_group = new FormGroup({
      password: new FormControl('', Validators.compose([
        Validators.minLength(8),
        Validators.required,
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]+$')
      ])),
      confirm_password: new FormControl('', Validators.required)
    }, (formGroup: FormGroup) => {
      return PasswordValidator.areEqual(formGroup);
    });

  // user links form validations
  this.userRegisterForm = this.fb.group({
    firstname: new FormControl('', Validators.compose([
     Validators.maxLength(25),
     Validators.minLength(1),
     Validators.required
    ])),
    // type: new FormControl(this.types),
    lastname: new FormControl('', Validators.compose([
       Validators.maxLength(25),
       Validators.minLength(1),
       Validators.required
      ])),
    email: new FormControl('', Validators.compose([
      // RegisterComponent.validEmail,
      Validators.required,
      Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
    ])),
    matching_passwords: this.matching_passwords_group,
  })
}


  onSubmitUserRegisterForm(value){
    // console.log(value);

    var newUserItem: any = {};
    newUserItem.firstname = value.firstname;
    newUserItem.lastname = value.lastname;
    newUserItem.email = value.email;
    newUserItem.password = value.matching_passwords.password;
    newUserItem.type = value.type;
    this.newUser = JSON.stringify(newUserItem);
    // console.log(this.newUser)
    var startregister = performance.now(); 
    this.logger.log(`${value.email} is tring to register.`);
    this.userService.save(this.newUser).subscribe(newUserAccount => {
      var durationregister = performance.now() - startregister;
      this.logger.log(`user ${value.email},register request,${durationregister}`, "statsd");
      this.newUserAccount = newUserAccount;
      // console.log("this.newUserAccount: "+this.newUserAccount.message)
      if(this.newUserAccount.message === "error"){
        this.logger.error(`${value.email} has already been taken.`);
        alert("This email address has already been taken");
      }else{
        this.logger.log(`${value.email} registers successfully.`);
        alert("Register Successfully!")
        this.router.navigateByUrl('');
      }
    });
  }

}

class ParentErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = !!(form && form.submitted);
    const controlTouched = !!(control && (control.dirty || control.touched));
    const controlInvalid = !!(control && control.invalid);
    const parentInvalid = !!(control && control.parent && control.parent.invalid && (control.parent.dirty || control.parent.touched));

    return isSubmitted || (controlTouched && (controlInvalid || parentInvalid));
  }
}

class PasswordValidator {
  static areEqual(formGroup: FormGroup) {
    let value;
    let valid = true;
    for (let key in formGroup.controls) {
      if (formGroup.controls.hasOwnProperty(key)) {
        let control: FormControl = <FormControl>formGroup.controls[key];

        if (value === undefined) {
          value = control.value
        } else {
          if (value !== control.value) {
            valid = false;
            break;
          }
        }
      }
    }

    if (valid) {
      return null;
    }

    return {
      areEqual: true
    };
  }
}

