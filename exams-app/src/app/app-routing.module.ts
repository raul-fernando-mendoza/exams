import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserLoginFormComponent } from './user-login-form/user-login-form.component';
import { UserLoginComponent } from './user-login/user-login.component';

const routes: Routes = [
  { path: 'loginForm', component: UserLoginFormComponent },
  { path: 'loginCurrentUser', component: UserLoginComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
