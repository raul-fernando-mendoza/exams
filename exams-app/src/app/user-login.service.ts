import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { UserLoginCredentials } from './UserLoginCredentials';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UserLoginService {
  private baseUrl: string;
  private usersUrl: string;
  private currentUserUrl:string;
  private logoutUrl: string;
  constructor(private http: HttpClient) { 
    this.baseUrl = "http://localhost:8080/";
    this.usersUrl = this.baseUrl + 'loginService';
    this.currentUserUrl = this.baseUrl +  "currentUserService";
    this.logoutUrl = this.baseUrl + "logoutService";
  }
  public login(userName:string,password:string): Observable<UserLoginCredentials> {
    const params = new HttpParams()
      .set('username', userName)
      .set('password', password);     
    return this.http.get<UserLoginCredentials>( this.usersUrl, {params});
  }  
  public currentUser(token:string): Observable<UserLoginCredentials[]> {
    const params = new HttpParams()
      .set('token', token);    
    return this.http.get<UserLoginCredentials[]>(this.currentUserUrl, {params});
  }  
  public logout(): Observable<string[]> {
    return this.http.get<string[]>(this.logoutUrl);
  }  

}
