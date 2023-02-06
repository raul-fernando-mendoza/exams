import { Component ,OnInit, resolveForwardRef} from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { async, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { UserLoginService } from '../user-login.service';
import { Organization } from '../exams/exams.module';
import { db } from 'src/environments/environment';
import { UserPreferencesService } from '../user-preferences.service';
import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import * as uuid from 'uuid';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent {

  organization:Organization = null
  
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver
    , private router: Router
    , private route: ActivatedRoute
    , private userLoginService: UserLoginService
    , private userPreferencesService: UserPreferencesService) {
    }

  ngOnInit() {
      this.userPreferencesService.onOrganizationChangeEvent().subscribe( organization =>{
        this.organization = organization
        this.router.navigate(['/home'])
      })
      this.organization = this.userPreferencesService.getCurrentOrganization()
  }

  login(){
    this.router.navigate(['/loginForm'])
  }
  Register(){
    this.router.navigate(['/register',{"isRegister":true}])
  }  
  home(){
    this.router.navigate(['/'])
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
    return this.userLoginService.hasRole("role-admin-" + this.organization.id)
  }
  isReadOnly(){
    return this.userLoginService.hasRole('role-readonly-' + this.organization.id)
  }
  isEvaluator(){
    return this.userLoginService.hasRole('role-evaluador-' + this.organization.id)
  }  
  isStudent(){
    return true
  }    
  getUserName(){
    return this.userLoginService.getDisplayName()
  }
  getOrganizationName():string{
    if( this.organization )
      return this.organization.organization_name
    else return null
  }

  onConference(){
    window.location.href = "https://openvidu.raxacademy.com";
  }
}
