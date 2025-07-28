import { Injectable } from '@angular/core';
import { environment } from './../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

declare var grecaptcha: any;

@Injectable({
  providedIn: 'root'
})
export class RecaptchaService {

  addedStyle:HTMLStyleElement|null = null

  constructor(private http: HttpClient) { }

  public validateCaptchaToken(action:string, recaptchaToken:string): Observable<Object> {

    var url = environment.recaptcha.url
    
    var myparams = {
      "siteKey": environment.recaptcha.siteKey ,
      "token": recaptchaToken,
      "action": action      
    }
    

    var myheaders = new HttpHeaders({
      Accept: "application/json"
    });

    return this.http.get(url, {params : myparams, headers: myheaders})
  }  
  validateCaptcha(action:string):Promise<boolean> {
    return new Promise( (resolve, reject) =>{
      var thiz = this
      grecaptcha.enterprise.ready(() => {
        grecaptcha
          .enterprise.execute(environment.recaptcha.siteKey, { action: action })
          .then((token: string) => {
            /*Here, your service sends the token and other information to the backend and waits for the response.*/
            console.log("token:" + token)
            thiz.validateCaptchaToken( action, token ).subscribe( {
              next: (data:any)=>{
                console.log( data["score"] )
                //alert( data["score"] )
                if( data["score"] >= 0.5 ){
                  resolve(true)
                }
                else{
                  resolve(false)
                }
              },
              error: (err)=>{
                console.log(err)
                //alert(JSON.stringify(err))
                reject(err)
              }
            })          
          });
      });    
    })
  }

  showRecaptcha() {
    const styleTag = document.createElement('style');

    // Step 2: Add CSS rules to the style element
    styleTag.innerHTML = `
    .grecaptcha-badge { 
      visibility: visible !important;
    }
    `;
    
    // Step 3: Append the style tag to the document's head
    this.addedStyle = document.head.appendChild(styleTag);
  }  
  hideRecaptcha(){
    if(this.addedStyle){
      document.head.removeChild(this.addedStyle)
    }    
  }
}
