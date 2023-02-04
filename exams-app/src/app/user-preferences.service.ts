import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';

import { db } from  'src/environments/environment';
import { Organization } from './exams/exams.module';
import { UserLoginService } from './user-login.service';

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService {
  private organizationSubject : Subject<Organization> = new Subject<Organization>();
  organization:Organization = null

  constructor(private userLoginService: UserLoginService) { 

    this.userLoginService.onLoginEvent().subscribe(
      (user) => {
        if (user) {
          //a new user has loggin old organization is not valid any more
          console.log("navigation has received notification that login has Completed:")
          let storedOrganization = this.getStoredOrganization()  
          //now validate if the stored organization is valid
          this.isOrganizationValid( storedOrganization ).then( isValid =>{
            if( isValid ){
              this.organization = storedOrganization
              this.setCurrentOrganization( this.organization )
            }
            else{
              // the stored organization is not valid use the default organization
              this.getDefaultOrganization().then( defaultOrganization =>{
                  this.organization = defaultOrganization
                  this.setCurrentOrganization( this.organization )
              })
            }
          })
        }
        else{
          //there is not user use the default organization
          this.getDefaultOrganization().then( defautOrganization => {
            this.organization = defautOrganization
            this.setCurrentOrganization(this.organization)
          })
        }
      }
    ); 

    let storedOrganization = this.getStoredOrganization()  
    //now validate if the stored organization is valid
    this.isOrganizationValid( storedOrganization ).then( isValid =>{
      if( isValid ){
        this.organization = storedOrganization
        
      }
      else{
        // the stored organization is not valid use the default organization
        this.getDefaultOrganization().then( defaultOrganization =>{
            this.organization = defaultOrganization
            this.setCurrentOrganization( this.organization )
        })
      }
    })
  }

  // the the new default organization and notify all subscriptors
  setCurrentOrganization(organization:Organization){
    this.organization = organization
    localStorage.setItem('organizationId', JSON.stringify(organization) ) 
    this.organizationSubject.next( organization )   
  }
  getStoredOrganization():Organization{
    let organization = null
    try {
      let jsonOrganization:string = localStorage.getItem('organizationId')
      organization = JSON.parse( jsonOrganization )
    }
    catch( e ){
      console.log("error reading organization")
    }
    return organization 
  }  
  //get the previusly read organization
  // if not read the one stored and validate vs the user
  // else resove to the default organization
  getCurrentOrganization():Organization{
    if( this.organization == null){
      this.organization = this.getStoredOrganization()
    }
    return this.organization
  }
  getCurrentOrganizationId():string{
    if( this.organization == null )
      throw(" this should never happend")
    return this.organization.id

  }


  getOrganizations():Promise<Array<Organization>>{
    
    //const defaultOrg = window.location.hostname == "localhost" ||  window.location.hostname == "thoth-qa.web.app" ? "raxacademy": window.location.hostname
    return new Promise<Array<Organization>>((resolve, reject)=>{
      if (this.userLoginService.getUserUid()!=null) {
        var claims = this.userLoginService.getClaims()
        var orgs:Set<string> = new Set<string>()
        claims.map( c =>{
          const role = c.split("-")
          if( role.length == 3 && role[0] == "role" ){
            orgs.add(role[2])
          }
        })

        var organizations:Organization[] = []
        var map = Array.from(orgs).map(organization_id =>{
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
            resolve(organizations)
          }
          else{ 
            this.getDefaultOrganization().then( (defaultOrganization)=>{
              resolve([defaultOrganization])
            })           
          }
        })
      }
      else{
        resolve( [] )
      }
    })
  }

  getDefaultOrganization():Promise<Organization>{
    return new Promise<Organization>((resolve, reject) =>{
      db.collection("organizations")
      .where("isDefaultOrganization","==",true)
      .where("isDeleted","==", false).get().then( set =>{
        let default_organization:Organization = null
        set.docs.map( doc =>{
          const organization:Organization = doc.data() as Organization
          default_organization = organization
        })
        resolve(default_organization)
      },
      reason =>{
        console.error("ERROR: reading defuult organizations:" + reason)
        reject(reason)
      })
    })
  }
  getOrganization(organization_id):Promise<Organization>{
    return new Promise<Organization>((resolve, reject) =>{
      db.collection("organizations").doc(organization_id).get().then( doc =>{
        let organization:Organization = doc.data() as Organization
        resolve(organization)
      })
      reason =>{
          console.error("ERROR: reading defuult organizations:" + reason)
          reject(reason)
      }
    })
  }

  isOrganizationValid( organization:Organization ):Promise<boolean>{
    return new Promise<boolean>( (resolve, reject) =>{
      if( organization == null){
        resolve(false)
      }
      this.getOrganizations().then( (organizations)=>{
        if( organizations.length > 0){
          let organization_is_valid = false
          for( let i=0; i<organizations.length; i++){
            if( organizations[i].id == organization.id){
              organization_is_valid = true
              break
            }
          }
          resolve( organization_is_valid);
        }
        else{
          resolve( false )
        }
      },
      reject =>{
        resolve(false)
      })
    })

  }

  onOrganizationChangeEvent(): Observable<any> {
    return this.organizationSubject;
  } 
    
}
