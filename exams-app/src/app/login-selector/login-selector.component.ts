import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserLoginService } from '../user-login.service';

@Component({
  selector: 'app-login-selector',
  templateUrl: './login-selector.component.html',
  styleUrls: ['./login-selector.component.css']
})
export class LoginSelectorComponent implements OnInit {

  constructor(private router: Router
    ,private userLoginService:UserLoginService) { }

  ngOnInit(): void {

  }
  onLoginWithEmail(){
    this.router.navigate(['/loginForm']);
  }  
  signInWithPopup() {
    //alert("going to call login with Login popup")
    this.userLoginService.signInWithPopup()
  }  
  register(){
    this.router.navigate(['/loginForm',{"isRegister":true}])
  }
}
