import { Component, OnInit } from '@angular/core';
import { EmailValidator, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { UserLoginService } from '../user-login.service';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {

  roles = [];

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
        this.reloadRolesList(token)
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
    var request = {
      user:[{
        uid:"",
        displayName:"",
        email:""
      }],
      orderBy:{
        "user.email":""
      }
    }

    this.examImprovisacionService.chenequeApiInterface("get", token, request).subscribe(
      data => {
        var users = data["result"]
        for( const user of users){
          var user_group = this.fb.group({
            uid:[user.uid],
            email:[user.email],
            displayName:[user.displayName],
            roles: new FormArray([])
          })
          this.users_formarray.push(user_group)
          this.loadUserRoles(token, user, user_group.controls.roles as FormArray)
        }
      },
      error => {
        alert("error retriving the users:" + error.error)
      }
    );
  }

  reloadRolesList(token){
    var request_roles = {
      role:[{
        id:""
      }]
    }

    this.examImprovisacionService.chenequeApiInterface("get", token, request_roles).subscribe(
      data => {
        this.roles = data["result"]
      },
      error => {
        alert("error retriving the users:" + error.error)
      }
    );

  }  

  reloadUsers(token){
    this.users_formarray.clear()
    var request = {
      user:[{
        uid:"",
        displayName:"",
        email:""
      }],
      orderBy:{
        "user.email":""
      }
    }
    this.examImprovisacionService.chenequeApiInterface("get", token, request).subscribe(
      data => {
        var users = data["result"]
        for( const user of users){
          var user_group = this.fb.group({
            uid:[user.uid],
            email:[user.email],
            displayName:[user.displayName],
            roles: new FormArray([])
          })
          this.users_formarray.push(user_group)
          this.loadUserRoles(token, user, user_group.controls.roles as FormArray)
        }
      },
      error => {
        alert("error retriving the users:" + error.error)
      }
    );    
  }


  loadUserRoles(token, user, roles_formarray:FormArray){
    var request_roles = {
      user:{
        "email":user.email
      }
    }
    this.examImprovisacionService.chenequeApiInterface("getClaims", token, request_roles).subscribe(
      data => {
        user["roles"] = []
        //console.log("roles for " + user.email + " roles:" + data["result"])
        for( const key in data["result"]){
          var role_formgroup = this.fb.group({
            id:[key]
          })
          roles_formarray.push(role_formgroup)
        }
      },
      error => {
        console.log("error retriving roles:"  + error.error)
      }
    );  
  }

  addRole(user:FormGroup, role_id:string){

    var roles_fa = user.controls.roles as FormArray

    for(let i=0; i<roles_fa.controls.length; i++){
      let role_fg:FormGroup = roles_fa.controls[i] as FormGroup
      if( role_fg.controls.id.value == role_id){
        alert("El role el usuario ya tiene el rol:" +  role_id)
        return 0
      }
    }
    var reques_addroles = {
      user:{
        email:user.controls.email.value,
        role:role_id
      }
    }
    this.userLoginService.getUserIdToken().then( token => { 
      this.examImprovisacionService.chenequeApiInterface("addClaim", token, reques_addroles).subscribe(
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
    var reques_delroles = {
      user:{
        email:user.controls.email.value,
        role:role
      }
    }
    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.chenequeApiInterface("removeClaim", token, reques_delroles).subscribe(
        data => {
        var roles_fa: FormArray = user.controls.roles as FormArray
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
    var reques_updateDisplayName = {
      user:{
        displayName:user.controls.displayName.value,
        where:{
          uid:user.controls.uid.value
        }
      }

    }
    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.chenequeApiInterface("update", token, reques_updateDisplayName).subscribe(
        data => {
          console.log("displayName changed")
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
  deleteUser(userEmail){

    if( !confirm("Esta seguro de querer borrar el usuario:"+ userEmail) ){
      return
    }

    var request = {
      user:{
        email:userEmail
      }

    }
    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.chenequeApiInterface("removeUser", token, request).subscribe(
        data => {
          console.log("user removed")
          this.reloadUsers(token)
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
