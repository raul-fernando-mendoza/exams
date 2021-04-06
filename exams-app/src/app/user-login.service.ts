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
  //private user_email:string=null
  //private user_uid:string=null
  private user_idtoken:string=null
  private user = null;
  private user_claims = null;
  //private user_displayName = null;
  //private isloggedIn = false;

  


  constructor(private http: HttpClient 
    ,private examenesImprovisacionService:ExamenesImprovisacionService
    ,private router: Router) { 
    this.loginSubject = new Subject<boolean>();

    try{
      this.user = JSON.parse( localStorage.getItem('user') )
      this.user_idtoken = localStorage.getItem('user_idtoken')
      this.user_claims = JSON.parse(localStorage.getItem("user_claims") )
    }
    catch{
      this.reset()
    }
    
  }
  
  reset(){
    this.user=null
    localStorage.setItem('user', null)
    this.user_claims = null
    localStorage.setItem('user_claims',null)
    this.user_idtoken = null
    localStorage.setItem('user_idtoken',null)
  }

  register(email,password) {
    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential:firebase.auth.UserCredential) => {
      // Signed in 
      var user:firebase.User = userCredential.user;
      console.log(user.uid)
      
      userCredential.user.sendEmailVerification()
      .then(() => {
        alert("Un email de verificacion ha sido enviado a su email:" + user.email)
        // ...
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        alert("error sending the confirmation email:" + errorCode + " " + error.message)
      });

      this.LoginEvent(null)
      
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      alert("error:" + error)
      // ..
    });
  }  

  loginWithEmail(email, password){
    this.reset()

    firebase.auth().signInWithEmailAndPassword(email, password).then(userCredentials => {
      this.login(userCredentials)
    })
    .catch( error =>{
      alert("Error in loging:" + error)
    })
     


  }  


  signInWithPopup(){
    this.reset()
   
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    firebase.auth().signInWithPopup(provider).then(userCredentials => {
      this.login(userCredentials)
    })
    .catch( error =>{
      alert("Error in loging with popup:" + error)
    })
     
  }

  login( userCredentials: firebase.auth.UserCredential){
    let user = userCredentials.user;
    
    this.user = { "email":user.email, "displayName":user.displayName, "emailVerified":user.emailVerified, "uid":user.uid}
    localStorage.setItem('user', JSON.stringify( this.user ) )

    console.log("user.email" + this.user.email)
    console.log("user.uid:" + this.user.uid)
    

    //now get the id token
    firebase.auth().currentUser.getIdToken(true).then(idToken => {
      //id token retrieved
      console.log("idToken:" + idToken)
      this.user_idtoken = idToken
      localStorage.setItem('user_idtoken',this.user_idtoken)
      //now get the roles
      firebase.auth().currentUser.getIdTokenResult()
      .then((idTokenResult) => {
        console.log(idTokenResult.claims)
        this.user_claims = idTokenResult.claims
        
        localStorage.setItem("user_claims", JSON.stringify(this.user_claims) ) 
        this.LoginEvent(this.user.email)
      })
      .catch((error) => {
       alert("error retriving claims"+ error);
      });         
    }).catch(function(error) {
      alert("the id token could not be retrieved")
    });

  }

  sendEmailLink(){
    firebase.auth().currentUser.sendEmailVerification().then(function(result) {
      alert("email sent")
    },
    function(reason:any){
      alert("ERROR logout reason:" + reason)
    });
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
    return (this.user)?this.user.email:null
  }
  getDisplayName(){
    return (this.user)?this.user.displayName:null
  }
  getUserIdToken(){
    return this.user_idtoken
  } 
  getIsloggedIn(){
    return (this.user)?true:false
  }   
  getIsEmailVerified(){
    return (this.user)?this.user.emailVerified:false
  }
}
