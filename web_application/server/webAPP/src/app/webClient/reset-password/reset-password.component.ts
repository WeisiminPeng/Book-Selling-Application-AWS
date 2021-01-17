import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { UserService } from '../services/user.service'
import { userData } from '../webapp.model';

import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  constructor(public userService: UserService, public routes: ActivatedRoute, private router: Router) { }

  private hostname = environment.publicIP;
  public useremail: string;
  public res: userData;

  ngOnInit(): void {
  }

  @ViewChild('fondovalor') fondovalor: ElementRef;

  resetpwd() {
    console.log(this.fondovalor.nativeElement.value);
    var useremail1: any = {};
    useremail1.email = this.fondovalor.nativeElement.value;
    this.useremail = JSON.stringify(useremail1);
    this.userService.reset(this.useremail).subscribe(resetRes => {
      this.res = resetRes;
      if(this.res.message == "success"){
        alert("successfully send request for reseting password!")
        this.router.navigateByUrl('');
      }
    });
  }

  cancel(){
    this.router.navigateByUrl('');
  }

}
