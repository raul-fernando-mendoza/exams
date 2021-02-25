import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private baseUrl: string;
  private examUrl: string;
  constructor(private http: HttpClient) { 
    var hostname = window.location.hostname
    if(hostname==="localhost"){
      hostname= "192.168.15.12"
    }
    this.baseUrl = "http://" + hostname +":80/flask/exam_app";
    
    this.examUrl = this.baseUrl + '/requestapi';

  }
  public Exams(token, user_id): Observable<Object> {

    
    const params = new HttpParams()
      .set('token', token); 

    var request_data = {"what": "getExamenesPendientes", "user_id":user_id};
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

    //return  this.http.post(this.examUrl, request_data, {headers: myheaders});
    var customurl = "http://laquintacumbres.com/python/services_api.py"
   ;
    return  this.http.post(customurl, request_data, {headers: myheaders}); 
  }  
  public GetExamApplication(token:string, application_id:Number): Observable<Object> {
    const params = new HttpParams()
      .set('token', token); 

    var request_data = {"what": "getExamApplication", "application_id":application_id};
    var myheaders = new HttpHeaders({'Content-Type': 'application/json'});

    

    return  this.http.post(this.examUrl, request_data, {headers: myheaders});
  }  
}
