import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ObservationService {
  private baseUrl: string;
  private Url: string;
  constructor(private http: HttpClient) {
    var hostname = window.location.hostname
    if(hostname==="localhost"){
      hostname= "192.168.15.12"
    }
    this.baseUrl = "http://" + hostname +":80/flask/exam_app";
    
    this.Url = this.baseUrl + '/requestapi';    
  }
  public GetObservation(token:string, tipo_examen_id:Number): Observable<Object> {
    const params = new HttpParams()
      .set('token', token); 

    var request_data = {"what": "getObservacion", "tipo_examen_id":tipo_examen_id};
    var myheaders = new HttpHeaders({'Content-Type': 'application/json'});

    return  this.http.post(this.Url, request_data, {headers: myheaders});
  }     
}
