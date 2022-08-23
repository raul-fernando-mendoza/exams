import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserLoginService } from '../user-login.service';


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
  isRegister = false

  constructor(private fb: FormBuilder, private route: ActivatedRoute, 
    private router: Router, 
    private userLoginService:UserLoginService) {
      this.isRegister = ( this.route.snapshot.paramMap.get('isRegister') == "true" )
  }

  ngOnInit() {

  }
  
  onLoginWithEmail(){
    var user = this.loginForm.controls.username.value
    var password = this.loginForm.controls.password.value
    this.userLoginService.loginWithEmail(user, password).then( () =>{
      this.router.navigate(['/']);
    },
    reason => {
      console.error("ERROR: " + reason)
    })
  }

  register(){
    var user = this.loginForm.controls.username.value
    var password = this.loginForm.controls.password.value
    this.userLoginService.register(user, password).then( user =>{
      this.router.navigate(['/loginForm',{}])
    })    
  }
  onLogout(){
    //alert("going to call login with Logout")
    this.userLoginService.logout()
  }
}
