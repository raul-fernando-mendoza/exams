import { Component ,OnInit, resolveForwardRef} from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
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


  organizations:Organization[] = Array()
  organization_id:string
  p_organization_id:string


  
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
      this.organization_id = this.userPreferencesService.getCurrentOrganizationId()
    }

  ngOnInit() {
    
      this.userLoginService.onLoginEvent().subscribe(
        (user) => {
            if (user && user.email) {
              console.log("navigation has received notification that login has Completed:")
              this.updateOrganizations().then( ()=>{
                if( this.organizations.length > 0){
                  const current_organization_id = this.userPreferencesService.getCurrentOrganizationId()
                  let organization_exist = false
                  for( let i=0; i<this.organizations.length; i++){
                    if( this.organizations[i].id == current_organization_id){
                      this.organization_id = this.organizations[0].id
                      organization_exist = true
                      break;
                    }
                  }
                  if( organization_exist == false){
                    this.organization_id = this.organizations[0].id
                    this.userPreferencesService.setCurrentOrganizationId(this.organization_id)
                  }
                }
                this.router.navigate(['/home']);
              })
              
              
            }
            if (user == null) {
              console.log("navigation Logout has been received")
              this.updateOrganizations().then( () =>{
                this.organization_id = this.organizations[0].id
                this.userPreferencesService.setCurrentOrganizationId(this.organization_id)
                this.router.navigate(['/home']);
              })
            }
        }
      ); 

      this.organization_id = this.userPreferencesService.getCurrentOrganizationId()

      this.updateOrganizations().then( () =>{
        if( this.userPreferencesService.getCurrentOrganizationId() == null){
          this.organization_id = this.organizations[0].id
          this.userPreferencesService.setCurrentOrganizationId(this.organization_id)
        }
      })
         
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
    return this.userLoginService.hasRole("role-admin-" + this.organization_id)
  }
  isReadOnly(){
    return this.userLoginService.hasRole('role-readonly-' + this.organization_id)
  }
  isEvaluator(){
    return this.userLoginService.hasRole('role-evaluador-' + this.organization_id)
  }  
  isStudent(){
    return this.userLoginService.hasRole('role-estudiante-' + this.organization_id)
  }    
  getUserName(){
    return (this.userLoginService.getDisplayName())?this.userLoginService.getDisplayName():this.userLoginService.getUserEmail()
  }

  updateOrganizations():Promise<void>{
    this.organizations.length = 0
    return new Promise<void>((resolve, reject)=>{
      if (this.userLoginService.getUserUid()!=null) {
        var claims = this.userLoginService.getClaims()
        var orgs = []
        claims.map( c =>{
          const role = c.split("-")
          if( role.length == 3 && role[0] == "role" ){
            orgs.push(role[2])
          }
        })

        var organizations:Organization[] = []
        var map = orgs.map(organization_id =>{
          return db.collection("organizations").doc(organization_id).get().then( doc =>{
            var organization:Organization = doc.data() as Organization
            organizations.push(
              organization
            )
          },
          reason=>{
            console.log("ERROR reading organizations:" + reason)
          })
        })
        Promise.all(map).then( ()=>{
          if( organizations.length > 0){
            organizations.sort( (a,b) => { return a.organization_name > b.organization_name ? 1:-1} )
            organizations.map( o => { this.organizations.push(o)})
            resolve()
          }
          else{
            db.collection("organizations")
            .where("organization_name","==", window.location.hostname == "localhost" ? "raxacademy.com": window.location.hostname)
            .where("isDeleted","==",false)
            .limit(1)
            .get()
            .then( set => {
              set.docs.map( doc => {
                const organization:Organization = doc.data() as Organization
                this.organizations.push(organization)
                resolve()
              })
            },
            reason =>{
              console.error("ERROR: reading organizations:" + reason)
              reject()
            })                
          }
        })
      }
      else{
        db.collection("organizations")
        .where("organization_name","==", window.location.hostname == "localhost" ? "raxacademy.com": window.location.hostname)
        .where("isDeleted","==",false)
        .limit(1)
        .get()
        .then( set => {
          set.docs.map( doc => {
            const organization:Organization = doc.data() as Organization
            this.organizations.push(organization)
            resolve()
          })
        },
        reason =>{
          console.error("ERROR: reading organizations:" + reason)
          reject()
        })
      } 
    })
  }

  onOrganizationChange($event){
    //console.debug($event)
    const organization_id = $event.value
    this.userPreferencesService.setCurrentOrganizationId(organization_id)
    let currentUrl = this.router.url;
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
        this.router.navigate([currentUrl]);
        console.log(currentUrl);
    });
  }
  
}
