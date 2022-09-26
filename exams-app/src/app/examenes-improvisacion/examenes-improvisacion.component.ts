import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { ExamenesImprovisacionDataSource, ExamenesImprovisacionItem } from './examenes-improvisacion-datasource';
import { ExamenesImprovisacionService} from '../examenes-improvisacion.service'
import { ActivatedRoute, Router } from '@angular/router';
import { UserLoginService } from '../user-login.service';
import { copyObj, ExamGrade, ExamGradeMultipleRequest, Exam, Materia, ParameterGrade, ParameterGradeRequest, User } from '../exams/exams.module';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

import { db } from 'src/environments/environment';
import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import * as firebase from 'firebase';
import { UserPreferencesService } from '../user-preferences.service';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';



@Component({
  selector: 'app-examenes-improvisacion',
  templateUrl: './examenes-improvisacion.component.html',
  styleUrls: ['./examenes-improvisacion.component.css'] 
})
export class ExamenesImprovisacionComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<ExamenesImprovisacionItem>;
  dataSource: ExamenesImprovisacionDataSource;


  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = [ "title", 'materia', 'estudiante', 'evaluador', 'parametro', 'fechaApplicacion', 'completed'];
  

  evaluator_name = null
  evaluator_email = null
  student_uid = null
  student_email = null
  hideCompleted = true
  periodicRefresh = false
  applicationDates = []
  applicationDate = null
  releasedOnly = null

  examenes: ExamenesImprovisacionItem[] = [];  

  organization_id = null

  constructor( 
      private router: Router
    , private userLoginService: UserLoginService
    , private examImprovisacionService: ExamenesImprovisacionService
    , private userPreferencesService: UserPreferencesService
    ) {
      
      this.organization_id = userPreferencesService.getCurrentOrganizationId()
  }

  submitting = false


  updateTable(){
      this.dataSource = new ExamenesImprovisacionDataSource(this.examenes);
      
      var examenesSort = localStorage.getItem('jsonExamenesSort')
      if( examenesSort ){
        var jsonExamenesSort = JSON.parse(examenesSort)
        this.sort.active = jsonExamenesSort["active"]
        this.sort.direction = jsonExamenesSort["direction"]  
      }
      else{
        this.sort.active = 'materia'
        this.sort.direction = 'asc'
      }
      

      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.table.dataSource = this.dataSource;  
  }  
  
  ngOnInit() {
    console.log("on init called")

    var saved_applicationDate = localStorage.getItem('applicationDate')
    if (saved_applicationDate && saved_applicationDate != 'null'){
      this.applicationDate = new Date( saved_applicationDate )
    }
    
    this.hideCompleted = String(localStorage.getItem('hideCompleted')) == "true"

    if( this.isAdmin() ){
      
      this.evaluator_email = null
      this.student_email = null
      
    }
    else if ( this.isReadOnly() ){
      this.evaluator_email = null
      this.student_email = null 
      this.releasedOnly = true
    }
    else if ( this.isEvaluador() ){
      this.hideCompleted = true
      this.evaluator_email = this.userLoginService.getUserEmail()
      this.student_email = null
    }
    else{
      this.hideCompleted = false
      this.evaluator_email = null
      this.student_email = this.userLoginService.getUserEmail()
    }

    if( this.isReadOnly() ){
      const index = this.displayedColumns.indexOf('evaluador', 0);
      if (index > -1) {
         this.displayedColumns.splice(index, 1);
      }
    }

    


    this.userLoginService.getUserIdToken().then(
      token => {
        this.updateList(token, this.hideCompleted,  this.applicationDate ? this.applicationDate: null)
      },
      error => {
        if( error.status == 401 ){
          this.router.navigate(['/loginForm']);
        }
        else{
          alert("ERROR al leer lista de improvisacion:" + error.errorCode + " " + error.errorMessage)
        }
      }
    )
  }

  update(){
    this.userLoginService.getUserIdToken().then(
      token => {
        this.updateList(token, this.hideCompleted,  this.applicationDate ? this.applicationDate: null)
      },
      error => {
        if( error.status == 401 ){
          this.router.navigate(['/loginForm']);
        }
        else{
          alert("ERROR al leer lista de improvisacion:" + error.errorCode + " " + error.errorMessage)
        }
      }
    )    
  }

  updateList( token , hideCompleted,  applicationDate){
    var showClosed = null
    if ( hideCompleted == true ){
      showClosed = false
    }
    else{
      showClosed = null
    }

    this.examenes.length = 0
    var qry
    if( this.isAdmin() ){
      qry = db.collectionGroup('parameterGrades')
      .where("organization_id", "==", this.organization_id)
      .where("isDeleted", "==", false)
      if( applicationDate ){
        qry = qry.where("applicationDate","==", applicationDate)      
      }
    }
    else{
      qry = db.collectionGroup('parameterGrades')
      .where("organization_id", "==", this.organization_id)
      .where("evaluator_uid", "==", this.userLoginService.getUserUid())
      .where("isDeleted", "==", false)   
      .where("isCompleted", '==', false)   
      if( applicationDate ){
        qry = qry.where("applicationDate","==", applicationDate)      
      }      
    }
    
    qry.get().then( set => {
      console.log("exams found:" + set.docs.length)
            
      var map = set.docs.map( doc =>{
        const parameterGrade:ParameterGrade = doc.data()
        var examGrade_id = doc.ref.path.split("/")[1]
        return this.addParameterGrade(examGrade_id, parameterGrade)
      })
      Promise.all(map).then(()=>{
        this.examenes.sort( (a,b) =>{
          if (a.examGrade.title > b.examGrade.title)
            return 1
          else if (a.examGrade.title < b.examGrade.title)
           return -1
          else if (a.parameterGrade.label > b.parameterGrade.label)
            return 1
          else return -1
        })
        this.updateTable()
      })
    },
    reason =>{
      console.error("Error: reading exam list" + reason)
      alert("ERROR reading examGrades:" + reason)
    })
  } 
  addParameterGrade(examGrade_id:string,parameterGrade:ParameterGrade):Promise<void>{
    var _resolve
    var _reject
    return new Promise<void>((resolve, reject) =>{
      _resolve = resolve
      _reject = reject

      var transaction:Promise<void>[] = []

      var obj:ExamenesImprovisacionItem = {
        exam:null,
        examGrade:null,
        parameterGrade: parameterGrade, 
        materia: null,
        student: null,
        approver:null,
        isCompleted:parameterGrade.isCompleted
      }
  
      transaction.push(
        this.getUser(parameterGrade.evaluator_uid).then(doc =>{
          obj.approver = doc
        }) 
      )  
      transaction.push(
        this.loadExamGrade(examGrade_id, obj)
      )
      Promise.all(transaction).then(()=>{
        this.examenes.push(obj)
        resolve()
      })
    })
  }

  loadExamGrade(examGrade_id:string, e:ExamenesImprovisacionItem):Promise<void>{
    return new Promise<void>((resolve, reject)=>{
      var transaction:Promise<void>[] = []
      db.collection("examGrades").doc(examGrade_id).get().then(doc =>{
        const examGrade= doc.data() as ExamGrade
        e.examGrade = examGrade
  

  
        transaction.push(
          this.getUser(examGrade.student_uid).then(user=>{
            e.student = user
          })
        )
        
        transaction.push(
          db.collection("materias").doc(examGrade.materia_id).get().then( doc =>{
            e.materia = doc.data() as Materia
          })
        )
        Promise.all(transaction).then(()=>{
          db.collection("materias/" + examGrade.materia_id + "/exams").doc(examGrade.exam_id).get().then( doc =>{
            e.exam = doc.data() as Exam
            resolve()
          })          
        },
        reason=>{
          reject()
        })
      })
    }) 
     

  }

  ngAfterViewInit() {
  }
  onCreate(){
    this.router.navigate(['/ExamenImprovisacionFormComponent']);
  }
  onReport(){
    this.router.navigate(['/eiReporte']);
  }
  onEdit(examGrade_id, parameterGrade_id){
    this.router.navigate(['/ei-ap-parameter-form-component',{examGrade_id:examGrade_id,parameterGrade_id:parameterGrade_id}]);
  }
  onGraph(student_email:string,applicationDate:Date ){
    this.router.navigate(['/examgrades-report',{student_email:student_email,applicationDate:applicationDate }]);
  }  
  gotoLogin() {
    this.router.navigate(['/loginForm']);
  }  
  
  isAdmin(){
    return this.userLoginService.hasRole("role-admin-" + this.organization_id)
  }
  isReadOnly(){
    return this.userLoginService.hasRole("role-readonly-" + this.organization_id)
  }
  isEvaluador(){
    return this.userLoginService.hasRole("role-evaluador-"  + this.organization_id)
  }

  timerId = null

  periodicRefreshChange(){
    
    if( this.periodicRefresh == false ){
      console.log("removing timeout")
      clearInterval(this.timerId);
      this.timerId = null
    }
    else{
      this.applicationFilterChange(null)
      console.log("adding timeout")
      this.timerId = setTimeout(
        () => { 
          console.log("calling refresh")
          this.periodicRefreshChange()
        }
        , 7000);
    }
  }
  applicationFilterChange(e){
    if ( e instanceof MatDatepickerInputEvent ){
      if ( e.value == null ){
        this.applicationDate = null
      }
      else this.applicationDate = e.value
    }
    console.log("date changed to:" + this.applicationDate)
    localStorage.setItem('hideCompleted' , this.hideCompleted.toString())
    localStorage.setItem('applicationDate', this.applicationDate ? this.applicationDate.toISOString() : null)    
    this.userLoginService.getUserIdToken().then(
      token => {
        this.updateList(token, this.hideCompleted, this.applicationDate ? this.applicationDate: null)
      },
      error => {
        if( error.status == 401 ){
          this.router.navigate(['/loginForm']);
        }
        else{
          alert("ERROR al leer lista de improvisacion:" + error.errorCode + " " + error.errorMessage)
        }
      }
    )    
  }
  getUser(uid):Promise<User>{
    return new Promise<User>( (resolve, reject) =>{
      var userReq = {
        "uid":uid
      }      
      this.examImprovisacionService.authApiInterface("getUser", null, userReq).then( response =>{
        const user = response["result"]
        resolve( user )
      },
      reason =>{
        console.log("Error retriving user:" + reason)
      })
    
    })

  }
  
  printApplicationDate(t){
    return this.examImprovisacionService.formatTimeStamp(t)
  }
  getDisplayNameForUser(user){
    return this.userLoginService.getDisplayNameForUser(user)
  }
  sortData($event){
    console.log("sort:" + $event)
    let json = { active:$event["active"], direction:$event["direction"]}
    localStorage.setItem('jsonExamenesSort' , JSON.stringify(json))
    this.updateTable()
  }

}
