import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

import firebase from "firebase/app"


@Injectable({
  providedIn: 'root'
})
export class ExamenesImprovisacionService {
  
  private loginSubject : Subject<any>;

  private baseUrl: string;
  private examUrl: string;
  constructor(private http: HttpClient) { 
    var hostname = window.location.hostname
    /*
    if(hostname==="localhost"){
      hostname= "https://celtic-bivouac-307316.uc.r.appspot.com/"
    }
    this.baseUrl = "http://" + hostname +":80/flask/exam_app";
    */
    this.baseUrl = "https://celtic-bivouac-307316.uc.r.appspot.com"
                    

    this.loginSubject = new Subject<boolean>();

  }
  public getExamsImproApplication(token, estudiante_id, maestro_id, completado,parameter_completado): Observable<Object> {

    var url = this.baseUrl + "/getObject"
    const params = new HttpParams()
      .set('token', token); 

    var request_data = {
        "exam_impro_ap":[{
            "id":"",
            "fechaApplicacion":"",
            "completado":"",
            "estudiante":{
                "nombre":"",
                "apellidoPaterno":"",
                "apellidoMaterno":""
            }
        }]
    }
    var myheaders = new HttpHeaders({'Content-Type': 'application/json'});

    return  this.http.post(url, request_data, {headers: myheaders});

  }

  public getExamsImproTypes(token): Observable<Object> {

    var url = this.baseUrl + "/getObject"
    const params = new HttpParams()
      .set('token', token); 

    var request_data = {
        "exam_impro_type":[{
            "id":"",
            "label":""
        }]
    }
    var myheaders = new HttpHeaders({'Content-Type': 'application/json'});

    return  this.http.post(url, request_data, {headers: myheaders});

  }

  public getExamsImproEstudiantes(token): Observable<Object> {

    var url = this.baseUrl + "/getObject"
    const params = new HttpParams()
      .set('token', token); 

    var request_data = {
        "estudiante":[{
            "id":"",
            "nombre":"",
            "apellidoPaterno":"",
            "apellidoMaterno":""
        }]
    }
    var myheaders = new HttpHeaders({'Content-Type': 'application/json'});

    return  this.http.post(url, request_data, {headers: myheaders});

  }

  public getExamsImproParameters(token, exam_impro_type_id): Observable<Object> {

    var url = this.baseUrl + "/getObject"
    const params = new HttpParams()
      .set('token', token); 

    var request_data = {
        "exam_impro_parameter":[{
            "id":"",
            "exam_impro_type_id":exam_impro_type_id,
            "label":"",
            "exam_impro_criteria":[{
              "id":"",
              "label":"",
              "initially_selected":""
            }]
        }]
    }
    var myheaders = new HttpHeaders({'Content-Type': 'application/json'});

    return  this.http.post(url, request_data, {headers: myheaders});

  }  


  public getExamsImproApplicationParameter(token, estudiante_id, maestro_id, completado,parameter_completado): Observable<Object> {

    var url = this.baseUrl + "/getObject"
    const params = new HttpParams()
      .set('token', token); 

    var request_data = {
      "exam_impro_ap_parameter":[{
        "id":"",
        "maestro_id":"",
        "completado":0,
        "maestro":{
            "id":"",
            "nombre":"",
            "apellidoPaterno":"",
            "apellidoMaterno":""
        },
        "exam_impro_ap":{
            "id":"",
            "fechaApplicacion":"",
            "estudiante":{
                "nombre":"",
                "apellidoPaterno":"",
                "apellidoMaterno":""
            }
        }
      }]
    }
     
    var myheaders = new HttpHeaders({'Content-Type': 'application/json'});

    return  this.http.post(url, request_data, {headers: myheaders});
  }   

  public getExamImproTypes(token): Observable<Object> {

    const params = new HttpParams()
      .set('token', token); 

    var request_data = {
      "exam_impro_type":{
        "id":"",
        "label":"",
        "exam_impro_parameter":{
            "id":"",
            "exam_impro_type_id":"",
            "label":""
        }
      },
      "orderBy":{
          "exam_impro_parameter.label":"desc",
          "exam_impro_type.id":"asc"
      }
    };
    var myheaders = new HttpHeaders({'Content-Type': 'application/json'});

    return  this.http.post(this.baseUrl + "/getObject", request_data, {headers: myheaders});
  }    

  public addExamImpro(token, exam_impr_type_id, estudiante_id, fechaApplicacion): Observable<Object> {

    const params = new HttpParams()
      .set('token', token); 

    var request_data = {
      "exam_impro_criteria":{  
        "label":"some new criteria 2",
        "exam_impro_parameter_id":1
      }
    };
    var myheaders = new HttpHeaders({'Content-Type': 'application/json'});

    return  this.http.post(this.examUrl, request_data, {headers: myheaders});
  }    
  public addExamImproApAdd(token, completado, fechaApplication, estudiante_id, exam_impro_type_id): Observable<Object> {

    var url = this.baseUrl + "/addObject"

    const params = new HttpParams()
      .set('token', token); 

    var request_data = {
      "exam_impro_ap":{  
          "completado":completado,
          "fechaApplicacion":fechaApplication,
          "estudiante_id":estudiante_id,
          "exam_impro_type_id":exam_impro_type_id
      }
    }
   
    var myheaders = new HttpHeaders({'Content-Type': 'application/json'});

    return  this.http.post(url, request_data, {headers: myheaders});
  }   

  public addExamImproApParameterAdd(token, exam_impro_application_id, completado, exam_impro_parameter_id, maestro_id): Observable<Object> {

    var url = this.baseUrl + "/addObject"

    const params = new HttpParams()
      .set('token', token); 

    var request_data = {
      "exam_impro_ap_parameter":{  
          "exam_impro_application_id":exam_impro_application_id,
          "completado":completado,
          "exam_impro_parameter_id":exam_impro_parameter_id,
          "maestro_id":maestro_id
      }
    }
   
    var myheaders = new HttpHeaders({'Content-Type': 'application/json'});

    return  this.http.post(url, request_data, {headers: myheaders});
  }   


  public chenequeApiInterface(action, data): Observable<Object> {

    var url = this.baseUrl + "/api"

    var user = JSON.parse(localStorage.getItem('exams.app'))
    var token = ""
    if( user ){
      token = user["token"]
    }

    var request_data = {
      "service":"cheneque",
      "database":"entities",
      "action":action,
      "token":token,
      "data":data
    }
   
    var myheaders = new HttpHeaders({'Content-Type': 'application/json'});

    return  this.http.post(url, request_data, {headers: myheaders});
  }
  
  LoginEvent(opening: any): void {
    this.loginSubject.next(opening);
  }

  onLoginEvent(): Observable<any> {
      return this.loginSubject;
  } 
  
  logout(){
    localStorage.setItem('exams.app', null);
    this.LoginEvent(null)
  }

  hasRole(role){
    var user = JSON.parse(localStorage.getItem('exams.app'));

    if( !user  ){
      return false
    }
    for( let i =0; i<user.user_role.length; i++){
      let r = user.user_role[i]
      if( r.role_id == role ){
        return true
      }
    }
    return false
  }
  getEstudianteID(){
    var estudianteId = null

    var user = JSON.parse(localStorage.getItem('exams.app'));

    if( user  ){
      estudianteId = user.user_attribute.estudiante_id
    }
    return estudianteId
  }
  getMaestroID(){
    var userId = null
    var user = JSON.parse(localStorage.getItem('exams.app'));

    if( user  ){
      return  user.user_attribute.maestro_id
    }
    return userId
  }  

  register() {
    firebase.auth().createUserWithEmailAndPassword("rfmh24hr@gmail.com", "Argos4905")
    .then((userCredential) => {
      // Signed in 
      var user = userCredential.user;
      // ...
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      // ..
    });
  }  

  login(email, password){
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Signed in
      var user = userCredential.user;
      // ...
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
    });  

    firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) {
      console.log("idToken:" + idToken)
      //python
      //decoded_token = auth.verify_id_token(id_token)
      //uid = decoded_token['uid']
    }).catch(function(error) {
      console.log("the id token could not be retrieved")
    });
    
   
  }
}
