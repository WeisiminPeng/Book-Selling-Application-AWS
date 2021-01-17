import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './webClient/login/login.component';
import { RegisterComponent } from './webClient/register/register.component';
import { UserDetailInfoComponent } from './webClient/user-detail-info/user-detail-info.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule} from '@angular/material/button';
import { MatInputModule} from '@angular/material/input';
import { MatSelectModule} from '@angular/material/select';
import { HttpClientModule } from '@angular/common/http';
import { SidebarModule } from '@syncfusion/ej2-angular-navigations';


import { SidebarWebComponent } from './webClient/sidebar/sidebar.component';
import { BooklistComponent } from './webClient/booklist/booklist.component';
import { SelllistComponent } from './webClient/selllist/selllist.component';
import { CartComponent } from './webClient/cart/cart.component';
import { CreateBookComponent } from './webClient/create-book/create-book.component';
import { ModifyBookComponent } from './webClient/modify-book/modify-book.component';

import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import { TestComponent } from './webClient/test/test.component';

import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { environment } from '../environments/environment';
import { ResetPasswordComponent } from './webClient/reset-password/reset-password.component';
import { ResetEmailComponent } from './webClient/reset-email/reset-email.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    UserDetailInfoComponent,
    SidebarWebComponent,
    BooklistComponent,
    SelllistComponent,
    CartComponent,
    CreateBookComponent,
    ModifyBookComponent,
    TestComponent,
    ResetPasswordComponent,
    ResetEmailComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    HttpClientModule,
    SidebarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    LoggerModule.forRoot({
      serverLoggingUrl: `https://${environment.publicIP}:3000/logs/`,
      level: NgxLoggerLevel.TRACE,
      serverLogLevel: NgxLoggerLevel.TRACE,
      enableSourceMaps: true,
      disableConsoleLogging: false
    })
  ],
  providers: [MatDatepickerModule, ],
  bootstrap: [AppComponent]
})
export class AppModule { }
