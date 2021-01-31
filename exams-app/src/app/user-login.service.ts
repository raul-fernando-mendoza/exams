import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { UserLoginCredentials } from './UserLoginCredentials';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UserLoginService {
  private baseUrl: string;
  private examUrl: string;
  private token: string;
  constructor(private http: HttpClient) { 
    var hostname = window.location.hostname
    if(hostname==="localhost"){
      hostname= "192.168.15.12"
    }    
    this.baseUrl = "http://" + hostname +":80/flask/exam_app";
    this.examUrl = this.baseUrl + '/requestapi';
  }
  
  public login(data): Observable<Object> {
    const params = new HttpParams()
     

    var request_data = {"what": "loginUser", "entities":data};
    var myheaders = new HttpHeaders({'Content-Type': 'application/json'});

    return  this.http.post(this.examUrl, request_data, {headers: myheaders});
  }    
  public currentUser(token:string): Observable<UserLoginCredentials[]> {
    const params = new HttpParams()
      .set('token', token);    
    return this.http.get<UserLoginCredentials[]>(this.examUrl, {params});
  }  
  public logout(): Observable<string[]> {
    return this.http.get<string[]>("");
  }  

}
