import { IfStmt } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { UserLoginService } from '../user-login.service';
import { UserDetails } from '../UserDetails';

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.css']
})
export class UserLoginComponent implements OnInit {

  users:UserDetails[] = [{"password":"_Argos4905","authorities":[{"authority":"_ROLE_ADMIN"},{"authority":"_ROLE_USER"}],"token":"abcd","enabled":true,"credentialsNonExpired":true,"accountNonExpired":true,"username":"_claudia","accountNonLocked":true}]
  user:UserDetails = this.users[0];

  constructor(private userLoginService: UserLoginService) { }

  ngOnInit(): void {
    
    var savedUser:UserDetails = JSON.parse(localStorage.getItem('exams.app'));
    console.log("saved user"+ savedUser);
    if( savedUser ){
      this.userLoginService.currentUser(savedUser.token).subscribe(data => {
        var users:UserDetails[] =  data;
        if( users.length > 0 ){
          this.user = users[0];
          console.log( "user-login-component:" + this.user );
        }
      })
    }
  
  }

}
