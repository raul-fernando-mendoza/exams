import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { DateFormatService } from '../date-format.service';



@Component({
  selector: 'app-examenes-improvisacion',
  templateUrl: './examenes-improvisacion.component.html',
  styleUrls: ['./examenes-improvisacion.component.css'] 
})
export class ExamenesImprovisacionComponent implements  OnInit, OnDestroy {
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
  isShowAll = true
  periodicRefresh = false
  selectedDay = null
  releasedOnly = null

  examenes: ExamenesImprovisacionItem[] = [];  

  organization_id = null

  unsubscribe = null
  parameterUnsubscribes = new Map()

  
  constructor( 
      private router: Router
    , private userLoginService: UserLoginService
    , private examImprovisacionService: ExamenesImprovisacionService
    , private userPreferencesService: UserPreferencesService
    , private dateFormatService: DateFormatService
    ) {
      
      this.organization_id = userPreferencesService.getCurrentOrganizationId()
  }
  ngOnDestroy(): void {
    if( this.unsubscribe ){
      this.unsubscribe()
      console.log("unsubscribe called")
      this.parameterUnsubscribes.forEach( (value, key) =>{
        value()
      })      
    }
  }

  submitting = false


  updateTable(){
    console.log("update table")
      this.dataSource = new ExamenesImprovisacionDataSource(this.examenes);
      /*
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
      */

      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.table.dataSource = this.dataSource;  
  }  
  
  ngOnInit() {
    console.log("on init called")

    var saved_applicationDate = localStorage.getItem('applicationDate')
    if (saved_applicationDate && saved_applicationDate != 'null'){
      this.selectedDay = new Date( saved_applicationDate )
    }
    
    this.userLoginService.getUserIdToken().then(
      token => {
        this.updateList()
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
    var saved_applicationDate = localStorage.getItem('applicationDate')
    if (saved_applicationDate && saved_applicationDate != 'null'){
      this.selectedDay = new Date( saved_applicationDate )
    }
    
    this.isShowAll = String(localStorage.getItem('isShowAll')) == "true"

    this.userLoginService.getUserIdToken().then(
      token => {
        this.updateList()
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

  updateList(){
    console.log("update list started")
    this.examenes.length = 0
    this.submitting = true

    var userUid= this.userLoginService.getUserUid()



    var qry = db.collection('examGrades')
      .where("organization_id", "==", this.organization_id)
      .where("evaluators", "array-contains",userUid)
      .where("isCompleted", '==', false)  
      .where("isDeleted","==",false)
      

    if( this.selectedDay ){
      qry = qry.where("applicationDay", "==", this.dateFormatService.getDayId(this.selectedDay) )
    }
    if( this.unsubscribe ){
      console.log("exam list unsubscribe")
      this.unsubscribe()
      
    }
    console.log("onSnapshot")
    this.unsubscribe = qry.onSnapshot( set => {
      console.log("onsnapshot haspendingWrite:" + set.metadata.hasPendingWrites)
      console.log("onsnapshot fromcache:" + set.metadata.fromCache)
      console.log("onsnapshot length:" + set.docs.length)
      this.submitting = true

      console.log("unsubscribe parameters")
      this.parameterUnsubscribes.forEach( (value, key) =>{
        value()
      })
      this.parameterUnsubscribes.clear()

      this.examenes.length = 0;
      console.log("mapping exams")
      var map = set.docs.map( doc =>{        
        const examGrade:ExamGrade = doc.data()
        return this.addDbParameterGrade( examGrade)
      })
      Promise.all(map).then(()=>{
        this.submitting = false
        this.examenes.sort( (a,b) =>{
          var ap = a as ExamenesImprovisacionItem
          var bp = b as ExamenesImprovisacionItem
          if( this.dateFormatService.getDayId(new Date(ap.examGrade.applicationDate)) == this.dateFormatService.getDayId(new Date(bp.examGrade.applicationDate)) ){
            return a.examGrade.title > b.examGrade.title ? 1 : -1
          }
          else{
            return a.examGrade.applicationDate < b.examGrade.applicationDate ? 1 : -1
          }
        })
        console.log("end sorting parameters")
        this.updateTable()
        
      })       
    },
    reason =>{
      alert("ERROR reading list of exams to approve:" + reason)
      this.submitting = false
    })
  }
  addDbParameterGrade(examGrade:ExamGrade ):Promise<void>{  
    return new Promise<void>((resolve, reject) =>{
      console.log("subscribe to parameters of exam" + examGrade.id)
      let parameterUnsubscribe = db.collection('examGrades/' + examGrade.id + "/parameterGrades")
        .where("evaluator_uid", "==", this.userLoginService.getUserUid())
        .where("version","==", 0)      
        .where("isCompleted", '==', false) 
        .onSnapshot( set =>{
          console.log("exams found:" + set.docs.length)
          console.log("first remove all the parameter related to this examgradeid")          
          for(let i=this.examenes.length; i>0; i--){
            if( this.examenes[i-1].examGrade.id == examGrade.id ){
              this.examenes.splice(i-1,1);
            }
          }
                  
          var map = set.docs.map( doc =>{
            const parameterGrade:ParameterGrade = doc.data() as ParameterGrade
            var obj:ExamenesImprovisacionItem = {
              exam:null,
              examGrade:examGrade,
              parameterGrade: parameterGrade, 
              materia: null,
              studentDisplayName: null,
              approverDisplayName:null,
              isCompleted:parameterGrade.isCompleted
            }
            console.log("add parameter" + parameterGrade.label)
            this.examenes.push(obj)
            this.retriveDetails(obj)            
          })
          this.updateTable()
          resolve()
        },
        reason =>{
          console.error("Error: reading exam list" + reason)
          alert("ERROR reading parameterGrades:" + reason)
          this.submitting = false
        }
      )  
      this.parameterUnsubscribes.set(examGrade.id, parameterUnsubscribe)
    }) 
  } 
  retriveDetails( obj:ExamenesImprovisacionItem){
    console.log("retrive detail:" + obj.examGrade.exam_id)
    obj.approverDisplayName = this.userLoginService.getDisplayName()
    this.examImprovisacionService.getExam( obj.examGrade.materia_id, obj.examGrade.exam_id).then( exam =>{
      obj.exam = exam
    }
    ,reason =>{
      console.log("ERROR exam can not be read:" + reason)
    })

    console.log("retrive materia:" + obj.examGrade.materia_id)
    this.examImprovisacionService.getMateria( obj.examGrade.materia_id).then( materia =>{
      obj.materia = materia
    },
    reason =>{
      console.log("ERROR materia cannot be read:" + reason)
    })

    console.log("retrive user" + obj.examGrade.student_uid)
    this.getUser(obj.examGrade.student_uid).then(student =>{
      obj.studentDisplayName = this.getDisplayNameForUser(student)
    },
    reason =>{
      console.log("ERROR student cannot be read:" + reason)
    }) 

  }

  onCreate(){
    this.router.navigate(['/ExamenImprovisacionFormComponent']);
  }
  onReport(){
    this.router.navigate(['/eiReporte']);
  }
  onEdit(examGrade_id, parameterGrade_id){
    this.router.navigate(['/examGrade-parameterGrade-apply',{examGrade_id:examGrade_id,parameterGrade_id:parameterGrade_id}]);
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

  applicationFilterChange(e){
    if ( e instanceof MatDatepickerInputEvent ){
      if ( e.value == null ){
        this.selectedDay = null
      }
      else this.selectedDay = e.value
    }
    console.log("date changed to:" + this.selectedDay)
    localStorage.setItem('isShowAll' , this.isShowAll.toString())
    localStorage.setItem('applicationDate', this.selectedDay ? this.selectedDay : null)    
    this.userLoginService.getUserIdToken().then(
      token => {
        this.updateList()
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
        reject(null)
      })
    
    })

  }
  
  printApplicationDate(t:any){
    return this.dateFormatService.formatDate(t.toDate())
  }
  getDisplayNameForUser(user){
    return this.userLoginService.getDisplayNameForUser(user)
  }
  sortData($event){
    console.log("sort:" + $event)
    if( $event ){
      let json = { active:$event["active"], direction:$event["direction"]}
      localStorage.setItem('jsonExamenesSort' , JSON.stringify(json))
      this.updateTable()
    }
  }
}
