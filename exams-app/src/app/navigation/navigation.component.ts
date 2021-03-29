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

  userLogged = false
  user_name = ""
  isAdmin = false
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver
    , private router: Router
    , private userLoginService: UserLoginService) {}

  ngOnInit() {

    this.isAdmin = this.userLoginService.hasRole("admin")

    if( this.userLoginService.getIsloggedIn() ){
      this.userLogged = true
      this.user_name = this.userLoginService.getUserEmail()
      this.router.navigate(['/ExamenesImprovisacion']); 
      
    }
    else{
      this.userLogged = false
      this.user_name = "Please login"
      this.router.navigate(['/home']); 
    }
    
    this.userLoginService.onLoginEvent().subscribe(
      (user_name) => {
          this.isAdmin = this.userLoginService.hasRole("admin")
          if (user_name) {
            console.log("navigation has received notification that login has Completed:" + user_name)
            this.userLogged = true
            this.user_name = user_name
            this.router.navigate(['/ExamenesImprovisacion']);
          } else {
            console.log("navigation Logout has been received")
            this.userLogged=false
            this.user_name = null
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
}
