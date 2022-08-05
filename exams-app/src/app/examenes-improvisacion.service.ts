import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { db, environment } from 'src/environments/environment';
import { MateriaEnrollment, Organization, User } from './exams/exams.module';
import * as uuid from 'uuid';
import { Timestamp } from 'rxjs/internal/operators/timestamp';

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
curl -m 70 -X POST https://us-central1-thoth-qa.cloudfunctions.net/deleteCertificateMateriaEnrollmentPost \
-H "Authorization:bearer $(gcloud auth print-identity-token)" \
-H "Content-Type:application/json" \
-d '{}'
  */
  public certificateDeleteInterface(action, token, request_data): Observable<Object> {

    var url = environment.certificatesDeleteURL 

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
/*
  curl -m 70 -X POST https://us-central1-thoth-qa.cloudfunctions.net/createCertificateMateriaEnrollmentPost \
  -H "Authorization:bearer $(gcloud auth print-identity-token)" \
  -H "Content-Type:application/json" \
  -d '{}' 
  */
  public certificateCreateInterface(action, token, request_data): Observable<Object> {

    var url = environment.certificatesCreateURL 

    console.log( JSON.stringify(request_data, null, 2))
    var myheaders = new HttpHeaders({'Content-Type': 'application/json' });


    return this.http.post(url, JSON.stringify(request_data, null, 0), {headers: myheaders})
  }

  createMateriaEnrollment(organizationId:string, materiaId:string, studentId:string):Promise<void>{
    var id = uuid.v4()
    var _resolve
    var _reject
    return new Promise<void>((resolve, reject) =>{
      _resolve = resolve
      _reject = reject

      db.collection('materiaEnrollments')
      .where("student_uid", "==", studentId)
      .where("materia_id", "==", materiaId)
      .where("isDeleted","==",false)
      .get().then( set =>{
        if( set.docs.length == 0){
          const materiaEnrollment:MateriaEnrollment = {
            id:id,
            organization_id:organizationId,
            student_uid:studentId,
            materia_id:materiaId,
            isDeleted:false
          }          
          db.collection('materiaEnrollments').doc(id).set(materiaEnrollment).then( () =>{
            _resolve()
          },
          reason =>{
            alert("la alumna ya esta enrollada en esta materia.")
          })
        }
        else{
          _reject()
        }
      })
    })
    
  }  
  formatTimeStamp(t):string{
    const date = t.toDate()    
    return date.toISOString().split('T')[0] 
  }
  printDate(t):string{   
    if( t.toDate ){
      const date = t.toDate()    
      return date.toISOString().split('T')[0] 
    }
    else{
      return t.toISOString().split('T')[0] 
    }
  }  
}
