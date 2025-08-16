import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { AbstractControl, EmailValidator, FormGroup, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BusinessService } from '../business.service';
import { UserLoginService } from '../user-login.service';
import { UserPreferencesService } from '../user-preferences.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatGridListModule } from '@angular/material/grid-list';


interface UserItem{
  uid:string
  email:string
  displayName:string
  fg:FormGroup
  claims:WritableSignal<Array<string>>
}

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule   

    ,FormsModule
    ,ReactiveFormsModule
    ,MatFormFieldModule
    ,MatInputModule 

    ,MatProgressSpinnerModule  
    ,MatMenuModule 
    ,MatGridListModule
  ], 
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {

  roles = ['role-admin','role-readonly','role-evaluador','role-estudiante'];

  users_formarray = new UntypedFormArray([])

  organization_id = null 

  submitting = signal(false) 
  userList = signal(new Array<UserItem>())
  

  constructor(private businessService: BusinessService
    , private userLoginService: UserLoginService
    , private fb: UntypedFormBuilder
    , private router: Router
    , private userPreferencesService:UserPreferencesService) { 
      this.organization_id = userPreferencesService.getCurrentOrganizationId()
  }


  ngOnInit(): void {


    this.userLoginService.getUserIdToken().then( 
      token =>{
        this.reloadUserList(token)
        //this.reloadRolesList(token)
      },
      err => {
        if( err.status == 401 ){
          this.router.navigate(['/loginForm']);
        }
        else{
          alert("ERROR al leer lista de improvisacion:" + err.error)
        }      
      }
    )
  }

  reloadUserList(token){
    this.submitting.set(false)

    
    var request = {
    }
    let thiz = this

    this.businessService.authApi("getUserList", token, request).subscribe({
      next(data){
        thiz.submitting.set(false)
        var users = data["result"]
        let newUserItems = new Array<UserItem>()
        for( const user of users){
          let userItem:UserItem = {
            uid:user.uid,
            email: user.email,
            displayName: user.displayName,
            fg: thiz.fb.group({
              displayName:[user.displayName?user.displayName:""]
            }),
            claims: signal([])
          }
          let claims = []
          for( const claim in user.claims){
            var claimValue = user.claims[claim]
            if( claim.split("-")[0] == 'role' && claim.split("-")[2] == thiz.organization_id){
                 claims.push(claim)
            }
            if( claim == 'displayName'){
              userItem.fg.controls.displayName.setValue( claimValue )
              userItem.displayName = claim
            }
          }
          userItem.claims.set(claims)
          newUserItems.push(userItem)
        }
        newUserItems.sort( (a, b) => {
          if( a.email >= b.email )
            return 1
          else
            return -1
        } )
        thiz.userList.set(newUserItems)
      },
      error(reason){
        alert("error llamando a users list:" + reason.error)
      }
    });
  }

  

  addRole(user:UserItem, role_id:string){
    for(let i=0; i<user.claims().length; i++){
      
      if( user.claims()[i] == role_id){
        alert("El role el usuario ya tiene el rol:" +  role_id)
        return 0
      }
    }
    var reques_addroles = {
        email:user.email,
        claims:{}
    }
    reques_addroles["claims"][role_id] = true
    let thiz = this

    this.userLoginService.getUserIdToken().then( token => { 
      this.businessService.authApiInterface("addClaim", token, reques_addroles).subscribe({
        next(data){
          let claims = user.claims()
          claims.push( role_id )
          user.claims.set(claims.slice())
        },
        error(reason){
          alert("error retriving the users:" + reason.errorCode + " " + reason.errorMessage)
        }
      }) 
    },
    error =>{
      alert("token error:" + error.errorCode + " " + error.errorMessage)
    })
  }
  
  delRole(user:UserItem, role:string){
    var request = {
        email:user.email,
        claim:role
    }
    this.userLoginService.getUserIdToken().then( token => {
      this.businessService.authApiInterface("removeClaim", token, request).subscribe({
        next(data){
        
          let claims = user.claims()
          for( let i =0 ; i< user.claims().length; i++){
            if(  claims[i] == role){
              claims.splice(i,1)
            }
          }
          user.claims.set(claims.slice())
        
        },
        error(reason){
          alert("error borrando el rol:" + reason.errorMessage)
        }
      })
    },
    error => {
      alert("token error:" + error.errorCode + " " + error.errorMessage)
    })  
  }

  onChangeUserDisplayName(user){
    var req = {
        email:user.email,  
        claims:{     
          displayName:user.fg.controls.displayName.value
        }
    }
    this.userLoginService.getUserIdToken().then( token => {
      this.businessService.authApiInterface("addClaim", token, req).subscribe({
        next(data){
          console.log("displayName changed")
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
  deleteUser(userEmail){

    if( !confirm("Esta seguro de querer borrar el usuario:"+ userEmail) ){
      return
    }

    var request = {
        email:userEmail
    }

    var thiz = this
    this.userLoginService.getUserIdToken().then( token => {
      this.businessService.authApiInterface("removeUser", token, request).subscribe({
        next(data){
          console.log("user removed")
          thiz.reloadUserList(token)
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

}
