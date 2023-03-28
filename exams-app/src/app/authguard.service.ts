import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { UserLoginService } from './user-login.service';

@Injectable({
  providedIn: 'root'
})
export class AuthguardService {

  constructor(
    private router: Router,
    private userLoginService:UserLoginService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    if (!this.userLoginService.getIsloggedIn() ) {

      var intendedParameters = {
        intendedPath:route.url[0].path
      }
      for (const property in route.url[0].parameters) {
        intendedParameters[property]=route.url[0].parameters[property]
      }

      this.router.navigate(['/loginForm',intendedParameters]);
      return false;
    }
    return true;
  }


}
