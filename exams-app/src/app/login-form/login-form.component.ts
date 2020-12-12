import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserLoginService } from '../user-login.service';
import { UserLoginCredentials } from '../UserLoginCredentials';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent {
  loginForm = this.fb.group({
    username: [null, Validators.required],
    password: [null, Validators.required]
  });

  username:string;
  password:string;

  constructor(private fb: FormBuilder, private route: ActivatedRoute, 
    private router: Router, 
      private userLoginService: UserLoginService) {}

  onSubmit() {
    console.log("login was submitted");
    this.userLoginService.login(this.username, this.password).subscribe(data => {
      console.log( "User login submit" + data );
      
      if( data ){
        var user:UserLoginCredentials= data;
        localStorage.setItem('exams.app', JSON.stringify(user));
        this.gotoWelcomeUser();
      }
      else {
        localStorage.setItem('exams.app', null);
        this.userLoginService.logout().subscribe( );
        alert("usuario invalido. try again")
      }
    });
    
  }

  gotoWelcomeUser() {
    this.router.navigate(['/ExamenesPendientes']);
  }
}
