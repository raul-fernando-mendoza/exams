import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VminstanceService {

  constructor(   private http: HttpClient) { }

  public vminstanceApiInterface(action, project, zone, instanceName=null): Observable<Object> {

    var url = environment.computeURL

    var request_data = {
      "service":"compute",
      "action":action,
      "project":project,
      "zone":zone,
      "instanceName":instanceName
    }

    console.log( JSON.stringify(request_data, null, 2))
    var myheaders = new HttpHeaders({'Content-Type': 'application/json'});


    return this.http.post(url, request_data, {headers: myheaders})
  }  
}
