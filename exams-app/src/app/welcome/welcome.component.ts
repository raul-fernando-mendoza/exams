import { Component, OnInit } from '@angular/core';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { UserLoginService } from '../user-login.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {

  constructor(private userLoginService:UserLoginService
    , private examenesImprovisacionService:ExamenesImprovisacionService) { }

  
  ngOnInit(): void {
   
  }
  isEmailVerified(): boolean{
    return this.userLoginService.getIsEmailVerified()
  }

  emailVerify(): void{
    /*
    var userEmail = this.userLoginService.getUserEmail()

    var request = {
      user:{
        email:userEmail
      }
    }

    var token = this.userLoginService.getUserEmail()

    this.examenesImprovisacionService.chenequeApiInterface("sendEmailVerification",token,request).subscribe(
      data => {
        alert("email sent:" + data["result"] )
      },
      error => {
        alert("email was not sent" + error)
      }
    )  
    */
   this.userLoginService.sendEmailLink()
  }
  isLoggedIn() : boolean{
    return this.userLoginService.getIsloggedIn()
  }

  
}
