import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import firebase from 'firebase/app';
import "firebase/auth";
import { Router } from '@angular/router';
import { User } from './exams/exams.module';


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
    ,private router: Router) { 
    this.loginSubject = new Subject<boolean>();

    try{
      this.user =  JSON.parse( localStorage.getItem('user') ) //{ "email":"olduser", "displayName":"olddisplayname", "emailVerified":false, "uid":"UI1234"}
      this.user_idtoken = localStorage.getItem('user_idtoken') // ""eyJhbGciOiJSUzI1NiIsImtpZCI6IjMwMjUxYWIxYTJmYzFkMzllNDMwMWNhYjc1OTZkNDQ5ZDgwNDI1ZjYiLCJ0eXAiOiJKV1QifQ.eyJhZG1pbiI6dHJ1ZSwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL2NlbHRpYy1iaXZvdWFjLTMwNzMxNiIsImF1ZCI6ImNlbHRpYy1iaXZvdWFjLTMwNzMxNiIsImF1dGhfdGltZSI6MTYyMjI5NTcwOCwidXNlcl9pZCI6IlIxbE8wSGRPRnBjWDFadXIyTlRGdzAzdkxlWTIiLCJzdWIiOiJSMWxPMEhkT0ZwY1gxWnVyMk5URncwM3ZMZVkyIiwiaWF0IjoxNjIyMjk1NzA5LCJleHAiOjE2MjIyOTkzMDksImVtYWlsIjoicmF1bF9mZXJuYW5kb19tZW5kb3phQGhvdG1haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbInJhdWxfZmVybmFuZG9fbWVuZG96YUBob3RtYWlsLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.HNDI1PyS87LtA_ToJQ6hjFIpQAKIm02Uyu44WyA5fy1HC-M6UmBxHv0KdzboDPyetVmS64UkcrHy6dgWu8XbBG1UtYKszbeBG88fLEV9FIMGyt_JuxH_hrDHsUq-6NstSz_My4eJ69bbVirOmskipNtp-wB_4vYl9US81TB0_9Uxrv6pzIEAxNCxQXSIYAxgUNXsjWcM4QeqYVA5x3EIbOcnQ3DQP_6Ht9hVfJvxCI1O3loUQmnqiYe5kIeJlIzqlFgPHZ4INEtcOAZen6yQKX3I12BhuHvLYHdPZ6Coxb5jB2PT8iktG6U_Q1gHw8IMwfsB3ECuRwOn9oK5PzgbnQ""
      this.user_claims = JSON.parse(localStorage.getItem("user_claims") ) // {"admin":true }
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

  register(email,password):Promise<firebase.User> {
    return new Promise( (resolve, reject) =>{
      firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((userCredential:firebase.auth.UserCredential) => {
        // Signed in 
        var user:firebase.User = userCredential.user;
        console.log(user.uid)
        
        userCredential.user.sendEmailVerification()
        .then(() => {
          alert("Un email de verificacion ha sido enviado a su email:" + user.email)
          resolve( user )
        })
        .catch((error) => {
          var errorCode = error.code;
          var errorMessage = error.message;
          alert("error sending the confirmation email:" + errorCode + " " + errorMessage)
          reject(error)
        });      
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        alert("ERROR registering user:" + error)
        reject(error)
      });
    })  
  }  

  loginAnonymously(){
    this.reset()

    firebase.auth().signInAnonymously().then(userCredentials => {
      let user = userCredentials.user;
      //now get the id token
      firebase.auth().currentUser.getIdToken(true).then(idToken => {
        //id token retrieved
        console.log("idToken:" + idToken)
        
        this.LoginEvent(user)
        
      }).catch(function(error) {
        alert("the id token could not be retrieved")
      });
  
    })
    .catch( error =>{
      alert("Error in loging:" + error.code + " " + error.message)
    })
  }


  loginWithEmail(email, password):Promise<void>{
    var _resolve
    var _reject
    return new Promise<void>((resolve, reject) => {
      _resolve = resolve
      _reject = reject
      this.reset()

      firebase.auth().signInWithEmailAndPassword(email, password).then(userCredentials => {
        let user = userCredentials.user;
      
        this.user = { "email":user.email, "displayName":user.displayName, "emailVerified":user.emailVerified, "uid":user.uid}
        localStorage.setItem('user', JSON.stringify( this.user ) )
    
        console.log("user.email" + this.user.email)
        console.log("user.uid:" + this.user.uid)
        
    
        //now get the id token
        firebase.auth().currentUser.getIdToken(true).then(idToken => {
          //id token retrieved
          //console.log("idToken:" + idToken)
          this.user_idtoken = idToken
          localStorage.setItem('user_idtoken',this.user_idtoken)
          //now get the roles
          firebase.auth().currentUser.getIdTokenResult()
          .then((idTokenResult) => {
            console.log(idTokenResult.claims)
            this.user_claims = idTokenResult.claims
            
            localStorage.setItem("user_claims", JSON.stringify(this.user_claims) ) 
            this.LoginEvent(this.user)
            _resolve()
          })
          .catch((error) => {
           console.error("error retriving claims"+ error);
           _reject(error)
          });         
        }).catch(function(error) {
          console.error("the id token could not be retrieved")
          _reject(error)
        });
    
      })
      .catch( error =>{
        console.error("Error in loging:" + error.code + " " + error.message)
        _reject(error)
      })
  
    })
     


  }  

  


  signInWithPopup():Promise<User>{
    return new Promise<User>((resolve, reject)=>{

    
      this.reset()
    
      var provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      firebase.auth().signInWithPopup(provider).then(userCredentials => {
        this.login(userCredentials).then( user =>{
          resolve(user)
        },
        reason =>{
          reject(reason)
        })
      })
      .catch( error =>{
        alert("Error in loging with popup:" + error)
      })
    })  
  }

  login( userCredentials: firebase.auth.UserCredential):Promise<User>{
    return new Promise<User>((resolve, reject)=>{
      
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
          this.LoginEvent(this.user) 
          resolve(this.user)          
        })
        .catch((error) => {
          alert("error retriving claims"+ error);
          reject(error)
        });         
      }).catch(function(error) {
        alert("the id token could not be retrieved")
        reject( error)
      });
    })  
  }

  sendEmailLink(){
    firebase.auth().currentUser.sendEmailVerification().then(function(result) {
      alert("email sent")
    },
    function(reason:any){
      alert("ERROR send email de verificacion:" + reason)
    });
  }

  sendPasswordResetEmail(email):Promise<void>{
    return firebase.auth().sendPasswordResetEmail(email)
  }

  logout(){
    this.reset()    
    firebase.auth().signOut().then(function(result) {

    },
    function(reason:any){
      console.error("ERROR logout reason:" + reason)
    });
    this.LoginEvent(null)
  }

  LoginEvent(user: any): void {
    this.loginSubject.next(user);
  }

  onLoginEvent(): Observable<any> {
      return this.loginSubject;
  } 

  isAnonymous(): boolean{
    if( firebase && firebase.auth() && firebase.auth().currentUser && firebase.auth().currentUser.isAnonymous ){
      return true;
    }
    else return false
  }

  hasRole(role){
    if(this.user_claims!=null && this.user_claims[role] == true)
      return true;
    return false
  }
  getUserUid(){
    return (this.user)?this.user.uid:null
  }  
  getUserEmail(){
    return (this.user)?this.user.email:null
  }
  getDisplayName(){
    let displayName = "unknown" 
    if(this.user){
      if(this.user_claims && this.user_claims["displayName"]){
        displayName = this.user_claims.displayName
      } 
      else if( this.user.displayName ){
        displayName = this.user.displayName
      }
      else displayName =  this.user.email
      
    }
    return displayName
  }
  getDisplayNameForUser(user){
    let displayName = "unknown" 
    if(user){
      if(user.claims && user.claims["displayName"]){
        displayName = user.claims.displayName
      } 
      else if( user.displayName ){
        displayName = user.displayName
      }
      else displayName =  user.email
      
    }
    return displayName
  }

  getClaims():string[]{
    var claims:string[] = [] 
    for (const property in this.user_claims) {
      claims.push(property)
    }
    return claims
  }
  setLocalClaim(property, value){
     this.user_claims[property] = value
     localStorage.setItem("user_claims", JSON.stringify(this.user_claims) ) 
  }  
  getUserIdToken():Promise<String> {
    if( firebase && firebase.auth() && firebase.auth().currentUser ){
      return new Promise<String>((resolve, reject) => {
        console.log("firebase user:" + firebase.auth().currentUser.email) 
        firebase.auth().currentUser.getIdToken().then(
          idToken =>{
            if ( this.user_idtoken != idToken ){
              console.log("******** Got a new ID token:" + this.user_idtoken + " " + idToken)
            }
            else{
              console.log("Got same token")
            }
            this.user_idtoken = idToken
            localStorage.setItem('user_idtoken',this.user_idtoken) 
            resolve(idToken);
          }
        )
      })
    }
    console.log("firebase is null return previous saved token")
    return new Promise<String>((resolve, reject) => {
      resolve(this.user_idtoken);
    })
  }

  getIsloggedIn(){
    return (this.user != null)?true:false
  }   
  getIsEmailVerified(){
    return (this.user)?this.user.emailVerified:false
  }


}
