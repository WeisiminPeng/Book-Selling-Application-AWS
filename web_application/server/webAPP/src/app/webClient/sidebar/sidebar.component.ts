import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SidebarComponent } from '@syncfusion/ej2-angular-navigations';
import { DomSanitizer } from '@angular/platform-browser';

import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarWebComponent implements OnInit {

  public cart: string;
  public sellList: string;
  public personalInfo: string;
  public bookList:string;

  @ViewChild('sidebar')
  public sidebar: SidebarComponent;
  public isOpen: boolean = true;
  public closeOnDocumentClick: boolean = true;
  public type: string = 'Push';

  public useremail: string;

  constructor(private logger: NGXLogger, public routes: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.useremail = this.routes.snapshot.paramMap.get('useremail').split('_')[0];
    this.cart = '/cart/'+this.useremail;
    this.sellList = '/selllist/'+this.useremail;
    this.personalInfo ='/' + this.useremail;
    this.bookList = '/booklist/'+this.useremail;
  }

  public onCreated(args: any) {
    this.sidebar.isOpen = false;
    this.sidebar.element.style.visibility = '';
  }

  showSidebar(): void {
    this.sidebar.show();
  }

  signOut(): void {
    this.logger.log(`user ${this.useremail} has signout.`);
    localStorage.removeItem(this.useremail);
    // localStorage.removeItem("hostname");
    // localStorage.clear();
    this.router.navigateByUrl('');
  }

}
