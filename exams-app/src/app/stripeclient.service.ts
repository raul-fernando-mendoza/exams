import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StripeclientService {

  constructor(private http:HttpClient) { }

  charge() :Promise<Object>{

    var url = "http://localhost:4242/create-payment-intent"

    var request_data = {
      items: [{ id: "photo-subscription" }],
      currency: "usd"
    }


   
    var myheaders = new HttpHeaders({'Content-Type': 'application/json'});

    return  this.http.post(url, request_data, {headers: myheaders}).toPromise();
    //this.stripeScriptTag.StripeInstance.confirmCardPayment    
  }
}
