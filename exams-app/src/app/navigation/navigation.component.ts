import { Component ,OnInit} from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamenesImprovisacionService} from '../examenes-improvisacion.service'

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent {

  userLogged = false
  user_name = ""
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver
    , private router: Router
    , private examImprovisacionService: ExamenesImprovisacionService) {}

  ngOnInit() {

    var user = JSON.parse(localStorage.getItem('exams.app'));
    if( user ){
      this.userLogged = true
      this.user_name = user["user_name"] 
      this.router.navigate(['/ExamenesImprovisacion']); 
      
    }
    else{
      this.userLogged = false
      this.user_name = ""
      this.router.navigate(['/loginForm']);
    }
    
    this.examImprovisacionService.onLoginEvent().subscribe(
      (user) => {
          if (user) {
            this.userLogged = true
            this.user_name = user["user_name"]
          } else {
            this.userLogged=false
            this.user_name = ""
          }
      }
    );    
  }

  login(){
    this.router.navigate(['/loginForm']);
  }
  logout(){
    this.examImprovisacionService.logout()
    this.router.navigate(['/loginForm']);
  }
}
