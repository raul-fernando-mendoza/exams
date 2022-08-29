import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { UserLoginService } from '../user-login.service';

@Component({
  selector: 'app-user-profile-edit',
  templateUrl: './user-profile-edit.component.html',
  styleUrls: ['./user-profile-edit.component.css']
})
export class UserProfileEditComponent implements OnInit {

  userFG = this.fb.group({
    email: [this.userLogin.getUserEmail()],
    displayName:[this.userLogin.getDisplayName()], 

  })

  constructor(
    private fb: FormBuilder,
    private userLogin: UserLoginService,
    private examImprovisation: ExamenesImprovisacionService
  ) { }

  ngOnInit(): void {
  }
  onDisplayNameChange(event){
    this.displayNameChange()

  }
  displayNameChange(){
    var newName = this.userFG.controls.displayName.value
    var req = {
        email:this.userFG.controls.email.value,  
        claims:{     
          displayName:newName
        }
    }
    this.userLogin.getUserIdToken().then( token => {
      this.examImprovisation.authApiInterface("addClaim", token, req).then(
        data => {
          console.log("displayName changed")
          this.userLogin.setLocalClaim("displayName",newName)
        },
        error => {
          alert("error changing user name:" + error.error)
      })
    },
    error => {
      alert("token error:" + error.errorCode + " " + error.errorMessage)
    })
  }  
}
