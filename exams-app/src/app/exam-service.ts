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
    this.baseUrl = "http://192.168.15.12:80/flask/exam_app";
    this.examUrl = this.baseUrl + '/requestapi';
  }
  public Exams(token:string): Observable<Object> {
    const params = new HttpParams()
      .set('token', token); 

    var request_data = {"what": "getExamenesPendientes", "user_id":"raul"};
    //var myheaders = new HttpHeaders({'Content-Type': 'text/html'});
    var myheaders = new HttpHeaders({'Content-Type': 'application/json'});

    /*
    this.http.post<any>(this.examUrl, request_data, {headers: myheaders}).subscribe(data => {
      alert(data);
      var a = data.what;
    })
    */
    return  this.http.post(this.examUrl, request_data, {headers: myheaders});

    //return this.http.get<Exam[]>(this.examUrl, {params});
    
  }   
  public SaveExamen(token:string, data:Object): Observable<Object> {
    const params = new HttpParams()
      .set('token', token); 

    var request_data = {"what": "SaveExamen", "entities":data};
    var myheaders = new HttpHeaders({'Content-Type': 'application/json'});

    return  this.http.post(this.examUrl, request_data, {headers: myheaders});
  }  
  public GetExamen(token:string, data:Object): Observable<Object> {
    const params = new HttpParams()
      .set('token', token); 

    var request_data = {"what": "GetExamen", "entities":data};
    var myheaders = new HttpHeaders({'Content-Type': 'application/json'});

    return  this.http.post(this.examUrl, request_data, {headers: myheaders});
  }  

}
