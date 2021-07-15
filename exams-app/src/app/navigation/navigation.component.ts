import { Component ,OnInit} from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { UserLoginService } from '../user-login.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent {


  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver
    , private router: Router
    , private userLoginService: UserLoginService) {}

  ngOnInit() {
    this.userLoginService.onLoginEvent().subscribe(
      (user_name) => {
          if (user_name) {
            console.log("navigation has received notification that login has Completed:" + user_name)
            this.router.navigate(['/home']);
          } else {
            console.log("navigation Logout has been received")
            this.router.navigate(['/home']);
          }
      }
    );    
  }

  login(){
    this.router.navigate(['/login-selector'])
  }
  Register(){
    this.router.navigate(['/register',{"isRegister":true}])
  }  
  logout(){
    this.userLoginService.logout()
    this.router.navigate(['/loginForm']);
  }
  isEmailVerified(){
    return this.userLoginService.getIsEmailVerified()
  }

  isLoggedIn(){
    return this.userLoginService.getIsloggedIn()
  }
  isAdmin(){
    return this.userLoginService.hasRole("admin")
  }
  isReadOnly(){
    return this.userLoginService.hasRole('readonly')
  }
  isEvaluator(){
    return this.userLoginService.hasRole('evaluador')
  }  
  isStudent(){
    return this.userLoginService.hasRole('estudiante')
  }    
  getUserName(){
    return (this.userLoginService.getDisplayName())?this.userLoginService.getDisplayName():this.userLoginService.getUserEmail()
  }
  
}
