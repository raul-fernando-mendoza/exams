import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { db, environment } from 'src/environments/environment';
import { Organization, User } from './exams/exams.module';


@Injectable({
  providedIn: 'root'
})
export class ExamenesImprovisacionService {
  
  

  
  constructor(private http: HttpClient) { 

  }
    
  
  public firestoreApiInterface(action, token, data): Observable<Object> {

    var url = environment.chenequeURL

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


  public authApiInterface(action, token, data): Promise<Object> {

    var url = environment.authURL

    var request_data = {
      "service":"auth",
      "action":action,
      "token":token,
      "data":data
    }

    var myheaders = new HttpHeaders({'Content-Type': 'application/json'});


    return this.http.post(url, request_data, {headers: myheaders}).toPromise()
  }


  public gsApiInterface(action, token, data): Observable<Object> {

    var url = environment.gsApiUrl
    var bucket = environment.certificatesBucket

    var request_data = {
      "service":"gs",
      "bucket":bucket,
      "action":action,
      "token":token,
      "data":data
    }

    var myheaders = new HttpHeaders({'Content-Type': 'application/json'});


    return this.http.post(url, request_data, {headers: myheaders})
  }
  /*
  var request_data = {
      "certificateId":"102" ,
      "studentName":"Claudia Gamboa",
      "materiaName":"Salsa",
      "label1":"www.raxacademy.com",
      "label2":"Experta",
      "label3":"Abanicos",
      "label4":"Virginia Gamboa",
      "color1":"black",
      "color2":"red"
    }
  */
  public certificateInterface(action, token, request_data): Observable<Object> {

    var url = environment.certificatesURL 

    console.log( JSON.stringify(request_data, null, 2))
    var myheaders = new HttpHeaders({'Content-Type': 'application/json' });


    return this.http.post(url, JSON.stringify(request_data, null, 0), {headers: myheaders})
  }

  async getUser(uid){
    var userReq = {
      "uid":uid
    }      

    const response = await this.authApiInterface("getUser", null, userReq)
    const user = response["result"]
    var result:User = {
      "uid" : user["uid"],
      "email" : user["email"],
      "displayName" : (user["displayName"] != null && user["displayName"] != '')? user["displayName"] : user["email"],
      "claims" : user["claims"]
    }
    
    return result
  }  

}
