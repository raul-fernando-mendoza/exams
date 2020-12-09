import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../user';
import { UserLoginService } from '../user-login.service';
 
@Component({
  selector: 'app-user-login-form',
  templateUrl: './user-login-form.component.html',
  styleUrls: ['./user-login-form.component.css']
})
export class UserLoginFormComponent implements OnInit {

  constructor(private route: ActivatedRoute, 
    private router: Router, 
      private userLoginService: UserLoginService) { }

  username: string = "";
  pass: string = "";
 

  ngOnInit(): void {
  }

  onSubmit() {
    console.log("login was submitted");
    this.userLoginService.login(this.username, this.pass).subscribe(data => {
      console.log( "User login submit" + data );
      
      var users =  data;

      if( users.length > 0 && users[0] ){
        var user:User= users[0];
        localStorage.setItem('exams.app', JSON.stringify(user));
        alert( "welcome" + user.username);
        this.gotoWelcomeUser();
      }
      else {
        this.userLoginService.logout().subscribe( );
        alert("usuario invalido. try again")
      }
    });
    
  }

  gotoWelcomeUser() {
    this.router.navigate(['/loginCurrentUser']);
  }
}
