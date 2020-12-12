import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Exam } from './Exam';

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private baseUrl: string;
  private examUrl: string;
  constructor(private http: HttpClient) { 
    this.baseUrl = "http://localhost:8080/";
    this.examUrl = this.baseUrl + 'ExamsService';
  }
  public Exams(token:string): Observable<Exam[]> {
    const params = new HttpParams()
      .set('token', token);    
    return this.http.get<Exam[]>(this.examUrl, {params});
    
  }   
}
