import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
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
    password: [null, Validators.required],
    recaptchaReactive:[null, Validators.required],
  });
  isRegister = false

  token: string|undefined;

  constructor(private fb: UntypedFormBuilder, private route: ActivatedRoute, 
    private router: Router, 
    private userLoginService:UserLoginService) {
      this.isRegister = ( this.route.snapshot.paramMap.get('isRegister') == "true" )
      this.token = undefined;
  }

  ngOnInit() {

  }
  
  onLoginWithEmail(){

    if( this.loginForm.valid ){

        var user = this.loginForm.controls.username.value
        var password = this.loginForm.controls.password.value

        this.userLoginService.loginWithEmail(user, password).then( () =>{
          this.router.navigate(['/']);
        },
        reason => {
          alert("ERROR: " + reason)
        })
    }
    else{
      let msg =  "ERROR: usuario o password son incorrectos"
      if( this.loginForm.controls["recaptchaReactive"].valid == false){
        msg = "ERROR: por favor complete el captcha"
      }
      alert( msg )
    }
  }

  register(){
    if( this.loginForm.valid ){

      var userName = this.loginForm.controls.username.value
      var password = this.loginForm.controls.password.value
      this.userLoginService.register(userName, password).then( user =>{
        this.userLoginService.loginWithEmail(userName, password).then( () =>{
          this.router.navigate(['/']);
        },
        reason => {
          alert("ERROR: " + reason)
        })
      })  
    }
    else{
      let msg =  "ERROR: usuario o password son incorrectos"
      if( this.loginForm.controls["recaptchaReactive"].valid == false){
        msg = "ERROR: por favor complete el captcha"
      }
      alert( msg )
    }        
  }
  onLogout(){
    //alert("going to call login with Logout")
    this.userLoginService.logout()
  }

}
