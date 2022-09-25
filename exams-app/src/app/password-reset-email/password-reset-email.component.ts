import { Component, OnInit } from '@angular/core';
import { UserLoginService } from '../user-login.service';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-password-reset-email',
  templateUrl: './password-reset-email.component.html',
  styleUrls: ['./password-reset-email.component.css']
})
export class PasswordResetEmailComponent implements OnInit {
  passwordResetForm = this.fb.group({
    email: [null, Validators.required],
    recaptchaReactive:[null, Validators.required],
  });

  constructor(
    private userLoginService:UserLoginService,
    private fb: FormBuilder,
    private router: Router) { }

  ngOnInit(): void {
  }

  onSubmit(){
    if( this.passwordResetForm.valid ){

      var email = this.passwordResetForm.controls.email.value
      this.userLoginService.sendPasswordResetEmail(email).then( () =>{
        alert("Un email ha sido enviado a su correo electronico")
        this.router.navigate(['/']);
      },
      reason => {
        alert("ERROR: " + reason)
      })
  }
  else{
    let msg =  "ERROR: email es incorrecto"
    if( this.passwordResetForm.controls["recaptchaReactive"].valid == false){
      msg = "ERROR: por favor complete el captcha"
    }
    alert( msg )
  }
  }

}
