import { Component, OnInit } from '@angular/core';
import { AbstractControl, EmailValidator, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { UserLoginService } from '../user-login.service';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {

  roles = ['admin','readonly','evaluador','estudiante'];

  users_formarray = new FormArray([])

  constructor(private examImprovisacionService: ExamenesImprovisacionService
    , private userLoginService: UserLoginService
    , private fb: FormBuilder
    , private router: Router) { 

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
    this.users_formarray.clear()
    var request = {
    }

    this.examImprovisacionService.authApiInterface("getUserList", token, request).subscribe(
      data => {
        var users = data["result"]
        for( const user of users){
          var user_group = this.fb.group({
            uid:[user.uid],
            email:[user.email],
            displayName:[user.displayName],
            claims: new FormArray([])
          })

          var claims_array = user_group.controls.claims as FormArray
          for( const claim in user.claims){
            var claimValue = user.claims[claim]
            if( claim == "displayName"){
              if( claimValue != null )
                user_group.controls.displayName.setValue( claimValue ) 
            }
            else{
              var role_formgroup = this.fb.group({
                id:[claim],
                value:[claimValue]
              })
              claims_array.push(role_formgroup)
            }
          }
          this.users_formarray.push(user_group)
        }
        this.users_formarray.controls.sort( (a, b) => {
          var ag:FormGroup = a as FormGroup
          var bg:FormGroup = b as FormGroup
          if( ag.controls.email.value >= bg.controls.email.value )
            return 1
          else
            return -1
        } )
      },
      error => {
        alert("error retriving the users:" + error.error)
      }
    );
  }

  

  addRole(user:FormGroup, role_id:string){

    var roles_fa = user.controls.claims as FormArray

    for(let i=0; i<roles_fa.controls.length; i++){
      let role_fg:FormGroup = roles_fa.controls[i] as FormGroup
      if( role_fg.controls.id.value == role_id){
        alert("El role el usuario ya tiene el rol:" +  role_id)
        return 0
      }
    }
    var reques_addroles = {
        email:user.controls.email.value,
        claims:{}
    }
    reques_addroles["claims"][role_id] = true
    this.userLoginService.getUserIdToken().then( token => { 
      this.examImprovisacionService.authApiInterface("addClaim", token, reques_addroles).subscribe(
        data => {
          var role_fg:FormGroup = this.fb.group({
            id:[role_id]
          }) 
          roles_fa.push(role_fg)
        },
        error => {
          alert("error retriving the users:" + error.errorCode + " " + error.errorMessage)
        }
      ); 
    },
    error =>{
      alert("token error:" + error.errorCode + " " + error.errorMessage)
    })
  }
  
  delRole(user:FormGroup, role:string){
    var request = {
        email:user.controls.email.value,
        claim:role
    }
    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.authApiInterface("removeClaim", token, request).subscribe(
        data => {
        var roles_fa: FormArray = user.controls.claims as FormArray
        for( let i =0 ; i< roles_fa.controls.length; i++){
          var role_fg:FormGroup = roles_fa.controls[i] as FormGroup

          if(  role_fg.controls.id.value == role){
            roles_fa.removeAt(i)
          }
        }
        
        },
        error => {
          alert("error retriving the users:" + error.error)
        }
      )
    },
    error => {
      alert("token error:" + error.errorCode + " " + error.errorMessage)
    })  
  }

  onChangeUsenDisplayName(user){
    var req = {
        email:user.controls.email.value,  
        claims:{     
          displayName:user.controls.displayName.value
        }
    }
    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.authApiInterface("addClaim", token, req).subscribe(
        data => {
          console.log("displayName changed")
        },
        error => {
          alert("error changing user name:" + error.error)
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
    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.authApiInterface("removeUser", token, request).subscribe(
        data => {
          console.log("user removed")
          this.reloadUserList(token)
        },
        error => {
          alert("error changing user name:" + error.error)
        }
      )  
    },
    error => {
      alert("token error:" + error.errorCode + " " + error.errorMessage)
    })    
  }

}
