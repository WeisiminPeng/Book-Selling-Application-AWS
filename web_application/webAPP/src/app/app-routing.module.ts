import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './webClient/login/login.component';
import { RegisterComponent } from './webClient/register/register.component';
import { UserDetailInfoComponent } from './webClient/user-detail-info/user-detail-info.component';
// import { SidebarComponent } from './webClient/sidebar/sidebar.component';
import { BooklistComponent } from './webClient/booklist/booklist.component';
import { SelllistComponent } from './webClient/selllist/selllist.component';
import { CartComponent } from './webClient/cart/cart.component';
import { CreateBookComponent } from './webClient/create-book/create-book.component';
import { ModifyBookComponent } from './webClient/modify-book/modify-book.component';
import { ResetPasswordComponent } from './webClient/reset-password/reset-password.component';
import { ResetEmailComponent } from './webClient/reset-email/reset-email.component';


const routes: Routes = [
  {

    path: '',
    component: LoginComponent
  },
  {

    path: 'resetpwd',
    component: ResetPasswordComponent
  },
  {

    path: 'reset/:info',
    component: ResetEmailComponent
  },
  {

    path: 'register',
    component: RegisterComponent
  },
  {

    path: 'booklist/:useremail',
    component: BooklistComponent 
  },
  {

    path: 'selllist/:useremail',
    component: SelllistComponent
  },
  {

    path: 'cart/:useremail',
    component: CartComponent
  },
  {

    path: 'createBook/:useremail',
    component: CreateBookComponent
  },
  {

    path: 'updateBook/:useremail_bookid',
    component: ModifyBookComponent
  },
  {

    path: ':useremail',
    component: UserDetailInfoComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
