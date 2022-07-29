import { Component ,OnInit, resolveForwardRef} from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { UserLoginService } from '../user-login.service';
import { Organization } from '../exams/exams.module';
import { db } from 'src/environments/environment';
import { UserPreferencesService } from '../user-preferences.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent {


  organizations:Organization[] = Array()
  organizationId
  
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver
    , private router: Router
    , private userLoginService: UserLoginService
    , private userPreferencesService: UserPreferencesService) {}

  ngOnInit() {
    
      this.userLoginService.onLoginEvent().subscribe(
        (user) => {
            if (user && user.email) {
              console.log("navigation has received notification that login has Completed:")
              this.updateOrganizations().then( ()=>{
                this.router.navigate(['/home']);
              })
              
              
            }
            if (user == null) {
              console.log("navigation Logout has been received")
              this.updateOrganizations().then( () =>{
                this.router.navigate(['/home']);
              })
            }
        }
      ); 

      this.organizationId = this.userPreferencesService.getCurrentOrganizationId()

      this.updateOrganizations()
         
  }

  login(){
    this.router.navigate(['/login-selector'])
  }
  Register(){
    this.router.navigate(['/register',{"isRegister":true}])
  }  
  logout(){
    this.organizations.length = 0
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

  updateOrganizations():Promise<void>{
    this.organizations.length = 0

    var _resolve
    return new Promise<void>((resolve, reject)=>{
      _resolve = resolve
      if (this.userLoginService.getUserUid() == null){
        resolve()
        return
      }

      console.log("current user changed to:" + this.userLoginService.getUserUid())
      db.collection("organizations")
      .where("members","array-contains",this.userLoginService.getUserUid())
      .where("isDeleted","==",false)
      .get()
      .then( 
        set =>{
          var map = set.docs.map(doc =>{
            var organization:Organization = {
              id:doc.id,
              organization_name:doc.data().organization_name,
              isDeleted:new Boolean(doc.data().isDeleted).valueOf()
            }
            this.organizations.push(
              organization
            )
            console.log( doc.id  )
            console.log( doc.data() )      
          })
          Promise.all(map).then( ()=>{
            if (this.organizations.length > 0) {
              this.userPreferencesService.setCurrentOrganizationId(this.organizations[0].id)
            }
            _resolve()
          })
        },
        reason => {
          console.error("ERROR retriving organizations:" + reason)
        }
      )  
  
    })
  }

  onOrganizationChange($event){
    console.debug($event)
    this.userPreferencesService.setCurrentOrganizationId($event.value)
    this.router.navigate(['/home']);
  }
  
}
