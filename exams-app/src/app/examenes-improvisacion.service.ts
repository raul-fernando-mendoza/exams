import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { db, storage, environment } from 'src/environments/environment';
import { Aspect, Criteria, Exam, ExamGrade, Materia, MateriaEnrollment, Organization, Parameter, ParameterGrade, Revision, User, VideoMarker } from './exams/exams.module';
import * as uuid from 'uuid';
import { FileLoadedEvent } from './file-loader/file-loader.component';
import { UserLoginService } from './user-login.service';
import { UserPreferencesService } from './user-preferences.service';

export interface FileLoaded{
  path:string
  url:string
}

@Injectable({
  providedIn: 'root'
})
export class ExamenesImprovisacionService {
  
  

  
  constructor(
     private http: HttpClient
    ) { 

    

  }
    
  
  public firestoreApiInterface(action, token, data, options = null): Observable<Object> {

    var url = environment.chenequeURL

    var request_data = {
      "service":"firestore",
      "database":"notused",
      "action":action,
      "token":token,
      "data":data,
      "options":options
    }

    console.log( JSON.stringify(request_data, null, 2))
    var myheaders = new HttpHeaders({'Content-Type': 'application/json'});


    return this.http.post(url, request_data, {headers: myheaders})
  }
  public examServiceApiInterface(action, token, data, options = null): Observable<Object> {

    var url = environment.examServicesURL

    var request_data = {
      "service":"examServices",
      "database":"notused",
      "action":action,
      "token":token,
      "data":data,
      "options":options
    }

    console.log( JSON.stringify(request_data, null, 2))
    var myheaders = new HttpHeaders({'Content-Type': 'application/json'});


    return this.http.post(url, request_data, {headers: myheaders})
  }

    public authApi(action, token, data): Observable<Object> {

    var url = environment.authURL

    var request_data = {
      "service":"auth",
      "action":action,
      "token":token,
      "data":data
    }

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

  getMateriasEnrolled(organizationId:string, studentUid:string):Promise<Array<Materia>>{
    return new Promise<Array<Materia>>((resolve, reject) =>{
      var materias:Array<Materia> = Array<Materia>()

      db.collection('materiaEnrollments')
      .where("organization_id","==", organizationId)
      .where("student_uid", "==", studentUid)
      .where("isDeleted","==",false)
      .get().then( set =>{
        var allPromeses = set.docs.map( doc =>{
          let enrollment:MateriaEnrollment = doc.data() as MateriaEnrollment
          return db.collection('materias').doc(enrollment.materia_id).get().then( materiaDoc =>{
            var materia = materiaDoc.data() as Materia
            if (materia.isDeleted == false){
              materias.push(materia)
            }
          }) 
        })
        Promise.all(allPromeses).then(() =>{
          materias.sort((a,b)=>a["materia_name"] > b["materia_name"] ? 1 : -1)
          resolve(materias)
        })
        
      },
      reason=>{
        console.log("Error retriving enrollments:" + reason)
      })
    })
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
    return new Promise<MateriaEnrollment>((resolve, reject) =>{
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
      },
      error =>{
        reject(error)
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


  fileLoaded(db_collection:string, id:string, e:FileLoadedEvent):Promise<FileLoaded>{
    return new Promise<FileLoaded>( (resolve, reject) =>{
      db.collection(db_collection).doc(id).get().then( doc =>{
        var promises = []
        var docExists = false
        if( doc.exists ){
          //first erase the old value if existed
          docExists = true

          var oldFilePath:string =doc.data()[e.property + "Path"]
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
        }

        Promise.all( promises ).then( () =>{
          //now update the values in materia
          let storageRef = storage.ref( e.fileFullPath )
          storageRef.getDownloadURL().then( url =>{
              var values = {}
              values[e.property + "Path"]=e.fileFullPath                       
              values[e.property + "Url"]=url     
              if( docExists == true ){   
                db.collection(db_collection).doc(id).update(values).then( () =>{
                  console.log("property has been update:" + e.property + " " + e.fileFullPath)
                  var fileLoaded = {
                    path:e.fileFullPath,
                    url:url
                  }
                  resolve( fileLoaded )
                },
                reason =>{
                  alert("ERROR: writing property:" + reason)
                  reject(reason)
                })        
              }
              else{
                db.collection(db_collection).doc(id).set(values).then( () =>{
                  console.log("property has been set:" + e.property + " " + e.fileFullPath)
                  var fileLoaded = {
                    path:e.fileFullPath,
                    url:url
                  }
                  resolve( fileLoaded )                  
                },
                reason =>{
                  alert("ERROR: writing property:" + reason)
                  reject(reason)
                })                  
              }  
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

  getCriteria( materiaId, examId, parameterId ):Promise<Array<Criteria>>{
    return new Promise<Array<Criteria>>( (resolve, reject) =>{
      db.collection('materias/' + materiaId + '/exams/' + examId + '/parameters/' + parameterId + "/criterias").get().then( criteriasSet =>{
        var criterias = new Array<Criteria>()
        criteriasSet.docs.map( criteriaDoc =>{
          var criteria:Criteria = criteriaDoc.data() as Criteria
          criterias.push( criteria )
        })
        criterias.sort( (a,b) => a.label > b.label ? 1 : -1)
        resolve(criterias)
      },
      reason =>{
        console.log("ERROR getCriteria" + reason)
      })
    })

  }

  getExams( materiaId ):Promise<Array<Exam>>{
    return new Promise<Array<Parameter>>( (resolve,reject) =>{
      db.collection('materias/' + materiaId + '/exams/').where("isDeleted","==",false).get().then( examSet =>{
        var exams = new Array<Exam>()
        examSet.docs.map( examDoc =>{ 
          let exam:Exam = examDoc.data() as Exam
          exams.push( exam )
        })
        exams.sort( (a,b) => a.label > b.label ? 1 : -1 )
        resolve( exams )
      },
      reason =>{
        console.log("ERROR getExams:" + reason)
        reject( reason )
      })
    })
  }  
  getParameters( materiaId, examId):Promise<Array<Parameter>>{
    return new Promise<Array<Parameter>>( (resolve,reject) =>{
      db.collection('materias/' + materiaId + '/exams/' + examId + "/parameters").get().then( parametersSet =>{
        var parameters = new Array<Parameter>()
        parametersSet.docs.map( parameterDoc =>{ 
          let parameter:Parameter = parameterDoc.data() as Parameter
          parameters.push( parameter )
        })
        parameters.sort( (a,b) => a.label > b.label ? 1 : -1 )
        resolve( parameters )
      },
      reason =>{
        console.log("Error getParameters:" + reason )
        reject( reason )
      })
    })
  }   
  getAspect( materiaId, examId, parameterId, criteriaId):Promise<Array<Aspect>>{
    return new Promise<Array<Parameter>>( (resolve,reject) =>{
      db.collection('materias/' + materiaId + '/exams/' + examId + "/parameters/" + parameterId + "/criterias/" + criteriaId + "/aspects/").get().then( aspectSet =>{
        var aspects = new Array<Aspect>()
        aspectSet.docs.map( aspectDoc =>{ 
          let aspect:Aspect = aspectDoc.data() as Parameter
          aspects.push( aspect )
        })
        aspects.sort( (a,b) => a.label > b.label ? 1 : -1 )
        resolve( aspects )
      },
      reason =>{
        console.log("ERROR getAspect:" + reason)
      })
    })
  }  
  getExam( materiaId, examId ):Promise<Exam>{
    return new Promise<Exam>( (resolve,reject) =>{
      db.collection('materias/' + materiaId + "/exams").doc(examId).get().then( doc =>{
        var exam = doc.data() as Exam
        resolve( exam )
      },
      reason =>{
        console.log("ERROR getExam:" + reason)
        reject(reason)
      })
    })
  } 

  getExamGrade( examGradeId ):Promise<ExamGrade>{
    return new Promise<ExamGrade>( (resolve,reject) =>{
      db.collection('examGrades').doc(examGradeId).get().then( doc =>{
        var examGrade = doc.data() as ExamGrade
        resolve( examGrade )
      },
      reason =>{
        console.log("ERROR getExamGrade:" + reason)
        reject(reason)
      })
    })
  }  
  getParameterGrades( examGradeId ):Promise<Array<ParameterGrade>>{
    return new Promise<Array<ParameterGrade>>( (resolve,reject) =>{
      db.collection('examGrades/' + examGradeId + "/parameterGrades").get().then( set =>{
        var parameterGrades = new Array<ParameterGrade>()
        set.docs.map( parameterGradeDoc =>{
          let parameterGrade = parameterGradeDoc.data() as ParameterGrade
          parameterGrades.push( parameterGrade )
        })
        resolve( parameterGrades )
      },
      reason =>{
        console.log("error getParameterGrades:" + reason)
        reject( reason )
      })
    })
  }  
  getMateria( materiaId ):Promise<Materia>{
    return new Promise<Materia>( (resolve,reject) =>{
      db.collection('materias').doc(materiaId).get().then( doc =>{
        var materia = doc.data() as Materia
        resolve( materia )
      },
      reason =>{
        console.log("ERROR getMateria:" + reason)
        reject(reason)
      })
    })
  }

  createRevision(revision:Revision):Promise<void>{    
    return db.collection("Revision" ).doc(revision.id).set(
      revision
    ).then( ()=>{
      console.log("revision added")
    },
    reason =>{
      alert("ERROR: adding revision" + reason)
    })
  }  
  updateRevision(revision:Revision):Promise<void>{
    
    return db.collection("Revision" ).doc(revision.id).update(
      revision
    ).then( ()=>{
      console.log("revision updated")
    },
    reason =>{
      alert("ERROR: updateRevision revision" + reason)
    })
  }  
  getRevision(id:string):Promise<Revision>{
    
    return new Promise<Revision>((resolve,reject) =>{
      db.collection("Revision" ).doc(id).get().then( doc => {
        if( doc.exists ){
          var revision = doc.data() as Revision
          resolve( revision)
        }
        else{
          reject( "revision:" + id + "not exist")
        }
      })
    })
  }
  saveObject(collection:string, obj:{id:string}):Promise<void>{
    return db.collection(collection ).doc(obj.id).set(
      obj
    ).then( ()=>{
      console.log(collection, " added ", obj.id)
    },
    reason =>{
      alert("ERROR: adding " + collection + reason)
    })
  }
  getObject(collection:string, id:string):Promise<any>{
    
    return new Promise<Revision>((resolve,reject) =>{
      db.collection(collection ).doc(id).get().then( doc => {
        if( doc.exists ){
          var obj:any = doc.data() 
          resolve( obj )
        }
        else{
          reject( "revision:" + id + "not exist")
        }
      })
    })
  }  
  
}
