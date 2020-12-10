import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TestApplication } from './TestApplication';

@Injectable({
  providedIn: 'root'
})
export class TestApplicationService {
  private baseUrl: string;
  private testApplicationUrl: string;
  constructor(private http: HttpClient) { 
    this.baseUrl = "http://localhost:8080/";
    this.testApplicationUrl = this.baseUrl + 'testApplicationsService';
  }
  public testApplications(token:string): Observable<TestApplication[]> {
    const params = new HttpParams()
      .set('token', token);    
    return this.http.get<TestApplication[]>(this.testApplicationUrl, {params});
    
  }   
}
