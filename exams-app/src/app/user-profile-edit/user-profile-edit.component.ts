import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { Organization } from '../exams/exams.module';
import { UserLoginService } from '../user-login.service';
import { UserPreferencesService } from '../user-preferences.service';

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

  organization:Organization = null
  organizations:Array<Organization> = []

  constructor(
    private fb: FormBuilder,
    private userLogin: UserLoginService,
    private examImprovisation: ExamenesImprovisacionService,
    private router: Router,
    private userPreferencesService: UserPreferencesService
    , private userLoginService: UserLoginService    
  ) { }

  ngOnInit(): void {
    this.organization = this.userPreferencesService.getCurrentOrganization()
    this.userPreferencesService.getOrganizations().then( organizations =>{
      this.organizations = organizations
    })

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

  onPasswordResetEmail(){
    this.userLogin.sendPasswordResetEmail(this.userLogin.getUserEmail()).then( () =>{
      alert("Un email ha sido enviado a su correo electronico")
      this.router.navigate(['/']);
    },
    reason => {
      alert("ERROR: " + reason)
    }) 
  } 
  onOrganizationChange($event){
    //console.debug($event)
    const organization = $event.value
    this.userPreferencesService.setCurrentOrganization(organization)
  }  
  onDone(){
    this.router.navigate(['/']);
  }
  isEmailVerified(){
    return this.userLoginService.getIsEmailVerified()
  }

  isLoggedIn(){
    return this.userLoginService.getIsloggedIn()
  }  
}
