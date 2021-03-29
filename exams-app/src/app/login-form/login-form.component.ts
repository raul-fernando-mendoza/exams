import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ExamenesImprovisacionService} from '../examenes-improvisacion.service'
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
    this.userLoginService.onLoginEvent().subscribe(
      (user) => {
          if (user) {
            console.log("login form receive notification login success navigatin to examenes improvisacion")
            this.router.navigate(['/ExamenesImprovisacion']);
          } 
      }
    ); 
  }


  onLoginWithEmail(){
    var user = this.loginForm.controls.username.value
    var password = this.loginForm.controls.password.value
    this.userLoginService.loginWithEmail(user, password)
  }

  register(){
    var user = this.loginForm.controls.username.value
    var password = this.loginForm.controls.password.value
    this.userLoginService.register(user, password)    
  }
  onLogout(){
    //alert("going to call login with Logout")
    this.userLoginService.logout()
  }

  gotoWelcomeUser() {
    this.router.navigate(['/ExamenesImprovisacion']);
  }
}
