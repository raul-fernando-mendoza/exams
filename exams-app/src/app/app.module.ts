import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UserLoginComponent } from './user-login/user-login.component';
import { HttpClientModule } from '@angular/common/http';
import { UserLoginService } from './user-login.service';
import { UserLoginFormComponent } from './user-login-form/user-login-form.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    UserLoginComponent,
    UserLoginFormComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule
  ],
  providers: [UserLoginService],
  bootstrap: [AppComponent]
})
export class AppModule { }
