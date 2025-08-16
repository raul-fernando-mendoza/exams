import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { BusinessService } from '../business.service';
import { Organization } from '../exams/exams.module';
import { UserLoginService } from '../user-login.service';
import { UserPreferencesService } from '../user-preferences.service';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MatInputModule } from '@angular/material/input';
import {MatTabsModule} from '@angular/material/tabs';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';

@Component({
  selector: 'app-user-profile-edit',

  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule   
   
    ,FormsModule
    ,ReactiveFormsModule
    ,MatFormFieldModule
    ,MatInputModule 
    ,MatTabsModule
    ,MatCardModule
    ,MatDividerModule
  ],   
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
    private businessService: BusinessService,
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
    let thiz = this
    this.userLogin.getUserIdToken().then( token => {
      this.businessService.authApiInterface("addClaim", token, req).subscribe({
        next(data){
          console.log("displayName changed")
          thiz.userLogin.setLocalClaim("displayName",newName)
        },
        error(reason){
          alert("error changing user name:" + reason.errorMessage)
        }
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
