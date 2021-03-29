import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import firebase from 'firebase/app';
import "firebase/auth";
import { ExamenesImprovisacionService } from './examenes-improvisacion.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserLoginService {
  private loginSubject : Subject<any>;
  private user_email:string=null
  private user_uid:string=null
  private user_idtoken:string=null
  private user_claims = null;
  private user_displayName = null;
  private isloggedIn = false;


  constructor(private http: HttpClient 
    ,private examenesImprovisacionService:ExamenesImprovisacionService
    ,private router: Router) { 
    this.loginSubject = new Subject<boolean>();
    
  }
  
  reset(){
    this.user_email=null
    this.user_uid=null
    this.user_idtoken=null
    this.user_claims = null
    this.user_displayName = null
    this.isloggedIn = false   
  }

  register(email,password) {
    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential:firebase.auth.UserCredential) => {
      // Signed in 
      var user:firebase.User = userCredential.user;
      console.log(user.uid)
      alert("welcome:" + email)
      this.router.navigate(['/loginForm']);
      
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      alert("error:" + error)
      // ..
    });
  }  

  loginWithEmail(email, password){
    this.user_email = null
    this.user_uid = null
    this.user_idtoken = null
    this.user_claims = null
    firebase.auth().signInWithEmailAndPassword(email, password).then(userCredential => {
      // Signed in
      var user = userCredential.user;
      this.user_email = user.email
      console.log("user.email" + user.email)
      console.log("user.uid:" + user.uid)
      this.user_uid = user.uid
      this.user_displayName = user.displayName
      this.isloggedIn = true
      //now get the id token
      firebase.auth().currentUser.getIdToken(true).then(idToken => {
        //id token retrieved
        console.log("idToken:" + idToken)
        this.user_idtoken = idToken
        //now get the roles
        firebase.auth().currentUser.getIdTokenResult()
        .then((idTokenResult) => {
          console.log(idTokenResult.claims)
          this.user_claims = {}
          // Confirm the user is an Admin.
          for(const claim in idTokenResult.claims){
            this.user_claims[claim] = idTokenResult.claims[claim]
            console.log("claims:" + claim + ":" + idTokenResult.claims[claim])
          }
          this.LoginEvent(this.user_email)
        })
        .catch((error) => {
         alert("error retriving claims"+ error);
        });         
      }).catch(function(error) {
        alert("the id token could not be retrieved")
      });

    })
    .catch( error =>{
      alert("Error in loging:" + error)
    })
     


  }  


  signInWithPopup(){
    this.user_email = null
    this.user_displayName = null
    this.user_uid = null
    this.user_idtoken = null
    this.user_claims = null
   
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    firebase.auth().signInWithPopup(provider).then(userCredential => {
      // Signed in
      var user = userCredential.user;
      this.user_email = user.email
      console.log("user.email" + user.email)
      console.log("user.uid:" + user.uid)
      this.user_uid = user.uid
      this.user_displayName = user.displayName
      //now get the id token
      firebase.auth().currentUser.getIdToken(true).then(idToken => {
        //id token retrieved
        console.log("idToken:" + idToken)
        this.user_idtoken = idToken
        this.isloggedIn = true
        //now get the roles
        firebase.auth().currentUser.getIdTokenResult()
        .then((idTokenResult) => {
          console.log(idTokenResult.claims)
          this.user_claims = {}
          // Confirm the user is an Admin.
          for(const claim in idTokenResult.claims){
            this.user_claims[claim] = idTokenResult.claims[claim]
            console.log("claims:" + claim + ":" + idTokenResult.claims[claim])
          }
          this.LoginEvent(this.user_email)
        })
        .catch((error) => {
         alert("error retriving claims"+ error);
        });         
      }).catch(function(error) {
        alert("the id token could not be retrieved")
      });

    })
    .catch( error =>{
      alert("Error in loging:" + error)
    })
     
  }

  logout(){
    this.reset()    
    firebase.auth().signOut().then(function(result) {

    },
    function(reason:any){
      alert("ERROR logout reason:" + reason)
    });
    this.LoginEvent(null)
  }

  LoginEvent(user: any): void {
    this.loginSubject.next(user);
  }

  onLoginEvent(): Observable<any> {
      return this.loginSubject;
  } 

  hasRole(role){
    if(this.user_claims!=null && this.user_claims[role] == true)
      return true;
    return false
  }
  getUserEmail(){
    return this.user_email
  }
  getDisplayName(){
    return this.user_displayName
  }
  getUserIdToken(){
    return this.user_idtoken
  } 
  getIsloggedIn(){
    return this.isloggedIn
  }   
}
