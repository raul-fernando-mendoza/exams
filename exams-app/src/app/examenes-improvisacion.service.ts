import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ExamenesImprovisacionService {
  
  private apiURL: string = environment.apiURL;
  constructor(private http: HttpClient) { 

  }
  
 /*
  public chenequeApiInterface(action, token, data): Observable<Object> {

    var url = this.apiURL 

    var request_data = {
      "service":"cheneque",
      "database":"entities",
      "action":action,
      "token":token,
      "data":data
    }


   
    var myheaders = new HttpHeaders({'Content-Type': 'application/json'});


    return this.http.post(url, request_data, {headers: myheaders})
  }
*/
public firestoreApiInterface(action, token, data): Observable<Object> {

  var url = this.apiURL 

  var request_data = {
    "service":"firestore",
    "database":"notused",
    "action":action,
    "token":token,
    "data":data
  }

  console.log( JSON.stringify(request_data, null, 2))
  var myheaders = new HttpHeaders({'Content-Type': 'application/json'});


  return this.http.post(url, request_data, {headers: myheaders})
}

public authApiInterface(action, token, data): Observable<Object> {

  var url = this.apiURL 

  var request_data = {
    "service":"auth",
    "action":action,
    "token":token,
    "data":data
  }

  var myheaders = new HttpHeaders({'Content-Type': 'application/json'});


  return this.http.post(url, request_data, {headers: myheaders})
}


public gsApiInterface(action, token, data): Observable<Object> {

  var url = this.apiURL 

  var request_data = {
    "service":"gs",
    "bucket":"celtic-bivouac-307316.appspot.com",
    "action":action,
    "token":token,
    "data":data
  }

  var myheaders = new HttpHeaders({'Content-Type': 'application/json'});


  return this.http.post(url, request_data, {headers: myheaders})
}


}
