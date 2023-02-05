import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { db, storage, environment } from 'src/environments/environment';
import { MateriaEnrollment, Organization, User } from './exams/exams.module';
import * as uuid from 'uuid';
import { FileLoadedEvent } from './file-loader/file-loader.component';

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

  async getUser(uid):Promise<User>{
    var result:User = null
    var userReq = {
      "uid":uid
    }      

    const response = await this.authApiInterface("getUser", null, userReq)
    if( response["result"] ){
      const user = response["result"]
      result = {
        "uid" : user["uid"],
        "email" : user["email"],
        "displayName" : (user["displayName"] != null && user["displayName"] != '')? user["displayName"] : user["email"],
        "claims" : user["claims"]
      }
    }
    else{
      result = null
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
  hasEnrollments(organizationId:string, studentId:string):Promise<boolean>{
    var _resolve
    var _reject
    return new Promise<boolean>((resolve, reject) =>{
      _resolve = resolve
      _reject = reject

      db.collection('materiaEnrollments')
      .where("organization_id","==", organizationId)
      .where("student_uid", "==", studentId)
      .where("isDeleted","==",false)
      .get().then( set =>{
        if( set.docs.length > 0){
          resolve(true)
        }
        else{
          resolve(false)
        }
      })
    })
  }
  hasMateriaEnrollment(organizationId:string, materiaId:string, studentId:string):Promise<boolean>{
    var result = false
    var id = uuid.v4()
    var _resolve
    var _reject
    return new Promise<boolean>((resolve, reject) =>{
      _resolve = resolve
      _reject = reject

      db.collection('materiaEnrollments')
      .where("organization_id","==", organizationId)
      .where("student_uid", "==", studentId)
      .where("materia_id", "==", materiaId)
      .where("isDeleted","==",false)
      .get().then( set =>{
        if( set.docs.length == 0){
          resolve(false)
        }
        else{
          resolve(true)
        }
      })
    })
  }

  getMateriaEnrollment(organizationId:string, materiaId:string, studentId:string):Promise<MateriaEnrollment>{
    var result = false
    var id = uuid.v4()
    var _resolve
    var _reject
    return new Promise<MateriaEnrollment>((resolve, reject) =>{
      _resolve = resolve
      _reject = reject

      db.collection('materiaEnrollments')
      .where("organization_id","==", organizationId)
      .where("student_uid", "==", studentId)
      .where("materia_id", "==", materiaId)
      .where("isDeleted","==",false)
      .get().then( set =>{
        if( set.docs.length > 0){
          var doc= set.docs[0]
          var materiaEnrollment:MateriaEnrollment = doc.data() as MateriaEnrollment
          resolve(materiaEnrollment)
        }
        else{
          resolve(null)
        }
      })
    })
  }


  createMateriaEnrollment(organizationId:string, materiaId:string, studentId:string):Promise<void>{
    var id = uuid.v4()
    var _resolve
    var _reject
    return new Promise<void>((resolve, reject) =>{
      _resolve = resolve
      _reject = reject

      db.collection('materiaEnrollments')
      .where("organization_id","==", organizationId)
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
            alert("ERROR al enrollar:" + reason)
          })
        }
        else{
          _reject()
        }
      },
      reason =>{
        alert("ERROR: reading enrollment table:" + reason)
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

  public stripeCreatePaymentIntent(product_id, metadata): Observable<Object> {

    var url = environment.stripeCreatePaymentIntentURL

    var request_data = {
      "product_id":product_id,
      "metadata":metadata
    }

    var myheaders = new HttpHeaders({'Content-Type': 'application/json'});


    return this.http.post(url, request_data, {headers: myheaders})
  }


  public stripeGetProduct(product_id): Observable<Object> {

    var url = environment.stripeGetProductDefaultPriceURL

    var request_data = {
      "product_id":product_id
    }

    var myheaders = new HttpHeaders({'Content-Type': 'application/json'});


    return this.http.post(url, request_data, {headers: myheaders})
  }
  public stripeGetPaymentIntent(paymentIntent_id): Observable<Object> {

    var url = environment.stripeGetPaymentIntent

    var request_data = {
      "paymentIntentId":paymentIntent_id
    }

    var myheaders = new HttpHeaders({'Content-Type': 'application/json'});


    return this.http.post(url, request_data, {headers: myheaders})
  }  

  fileLoaded(db_collection, id, e:FileLoadedEvent){
    db.collection(db_collection).doc(id).get().then( data =>{
      //first erase the old value if existed
      var promises = []
      var oldFilePath:string =data[e.property + "Path"]
      if( oldFilePath && oldFilePath != e.fileFullPath){
        var storageOldRef = storage.ref( oldFilePath )
        
        var promiseDelete = storageOldRef.delete().then( () =>{
          console.log("old file was deleted:" + oldFilePath )
        })
        .catch( reason => {
          console.log("old file could not be deleted")      
        })
        promises.push(promiseDelete)
      }  
      //now update the values of properties to kick a reload of the data page
      var values = {}
      values[e.property + "Path"]=null                       
      values[e.property + "Url"]=null
      var remove = db.collection(db_collection).doc(id).update(values).then( () =>{
        console.log("property has been update:" + e.property + " " + e.fileFullPath)
      },
      reason =>{
        alert("ERROR: writing property:" + reason)
      }) 
      promises.push( remove )

      Promise.all( promises ).then( () =>{
        //now update the values in materia
        let storageRef = storage.ref( e.fileFullPath )
        storageRef.getDownloadURL().then( url =>{
            var values = {}
            values[e.property + "Path"]=e.fileFullPath                       
            values[e.property + "Url"]=url        
            db.collection(db_collection).doc(id).update(values).then( () =>{
              console.log("property has been update:" + e.property + " " + e.fileFullPath)
            },
            reason =>{
              alert("ERROR: writing property:" + reason)
            })        
        })       
      })
    }) 
  }  
  fileDeleted(db_collection, id, e:FileLoadedEvent){
      console.log("file deleted:" + e.fileFullPath)
      var values = {}
      values[e.property + "Path"]=null                       
      values[e.property + "Url"]=null
      db.collection(db_collection).doc(id).update(values).then( () =>{
        console.log("property has been update:" + e.property + " " + e.fileFullPath)
      },
      reason =>{
        alert("ERROR: writing property:" + reason)
      })      
  }
  getVideoId(videoPath){
    return videoPath.split("/").reverse()[0]
  }
}
