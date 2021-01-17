import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import * as bcrypt from 'bcryptjs';



import { UserService } from '../services/user.service'
import { userData } from '../webapp.model';
import { ActivatedRoute, Router } from '@angular/router';


import { NGXLogger } from 'ngx-logger';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit {

  // define FormGroup
  loginForm: FormGroup;
  matching_passwords_group: FormGroup;


  account_validation_messages = {
    'email': [
      { type: 'required', message: 'Email is required' },
      { type: 'pattern', message: 'Enter a valid email' },
      { type: 'validEmail', message: 'Your email has already been taken' }
    ],
    'password': [
      { type: 'required', message: 'Password is required' },
      { type: 'minlength', message: 'Password must be at least 8 characters long' },
      { type: 'pattern', message: 'Your password must contain at least one uppercase, one lowercase, and one number' }
    ]
  }

  public userAccount: userData;
  public inputPassword: string;
  public userLogin: string;
  public loginRes: userData;
  // public hostname: string;

  constructor(private logger: NGXLogger, private fb: FormBuilder, public userService: UserService, public routes: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    // this.hostname = window.location.hostname;
    // localStorage.setItem("hostname", this.hostname);
    // console.log("this.hostname: "+this.hostname)
    this.createForms();
    // this.logger.debug("Debug message");
    // this.logger.info("Info message");
    // this.logger.log("Default log message");
    // this.logger.warn("Warning message");
    // this.logger.error("Error message", "statsd");
  }

  createForms() {
    // user links form validations
    this.loginForm = this.fb.group({
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      password: new FormControl('', Validators.compose([
        Validators.minLength(8),
        Validators.required,
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]+$')
      ]))
    })
  }

  onLoginForm(value) {
    // console.log(value);
    var startLogin = performance.now(); 
    this.logger.log(`user ${value.email} is tring to login.`);
    this.userService.login(value).subscribe(loginRes => {
      var durationLogin = performance.now() - startLogin;
      this.logger.log(`user ${value.email},login request,${durationLogin}`, "statsd");
      this.loginRes = loginRes;
      // console.log("this.loginRes: " + this.loginRes.message)
      if (this.loginRes.message === "no_record") {
        alert("You haven't register!");
        this.logger.error(`user ${value.email} hasn't register.`);
      }
      // correct password && get token
      else if (this.loginRes.message === "success" && this.loginRes.token) {
        this.logger.log(`user ${value.email} login successfully.`);
        // console.log(this.loginRes.token)
        var temp: any = {};
        temp.email = value.email;
        temp.token = this.loginRes.token;
        // console.log(JSON.stringify(temp));
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        localStorage.setItem(value.email, JSON.stringify(temp));
        this.router.navigateByUrl('/booklist/' +value.email);
      }
      else if (this.loginRes.message === "wrong") {
        alert("Wrong Password!");
        this.logger.error(`user ${value.email} input wrong passwprd.`);
      }
      // else {
      //   console.log(this.loginRes.message);
      // }
    });
  }

  register() {
    this.router.navigateByUrl('register');
  };

  resetpsd() {
    this.router.navigateByUrl('resetpwd');
  };

}

