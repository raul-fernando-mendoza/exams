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
  applicationDates = []
  selectedDay = null
  releasedOnly = null

  examenes: ExamenesImprovisacionItem[] = [];  

  organization_id = null

  unsubscribe = null

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
    }
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


    
    var qry

    qry = db.collectionGroup('parameterGrades')
      .where("organization_id", "==", this.organization_id)
      .where("evaluator_uid", "==", this.userLoginService.getUserUid())       

      //if( !this.isShowAll ){
        qry = qry.where("isCompleted", '==', false)  
      //}

      if( this.selectedDay ){
        qry = qry.where("applicationDay", "==", this.dateFormatService.getDayId(this.selectedDay) )
      }

      if( this.unsubscribe ){
        this.unsubscribe()
      }

      this.submitting = true
      this.unsubscribe = qry.onSnapshot( set => {
        this.examenes.length = 0
        
        console.log("exams found:" + set.docs.length)
              
        var map = set.docs.map( doc =>{
          const parameterGrade:ParameterGrade = doc.data()
          var examGrade_id = doc.ref.path.split("/")[1]
          return this.addParameterGrade(examGrade_id, parameterGrade)
        })
        Promise.all(map).then(()=>{
          this.submitting = false
          this.examenes.sort( (a,b) =>{
          var ap = a as ExamenesImprovisacionItem
          var bp = b as ExamenesImprovisacionItem
          if( ap.examGrade.applicationDay == bp.examGrade.applicationDay ){
            return a.examGrade.title > b.examGrade.title ? 1 : -1
          }
          else{
            return a.examGrade.applicationDate < b.examGrade.applicationDate ? 1 : -1
          }
        })
        this.updateTable()
      },
      reason =>{
        console.log("error on filter snapshot:" + reason)
      })
    },
    reason =>{
      console.error("Error: reading exam list" + reason)
      alert("ERROR reading examGrades:" + reason)
      this.submitting = false
    })
  } 
  addParameterGrade(examGrade_id:string,parameterGrade:ParameterGrade):Promise<void>{
    return new Promise<void>((resolve, reject) =>{
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
        this.getUser(parameterGrade.evaluator_uid).then(user =>{
          obj.approver = user
        }) 
      )  
      transaction.push(
        new Promise<void>( (resolve, reject) =>{
          this.examImprovisacionService.getExamGrade(examGrade_id).then( examGrade =>{
            var localTransactions = []
            obj.examGrade = examGrade
            localTransactions.push(
              this.examImprovisacionService.getExam( examGrade.materia_id, examGrade.exam_id).then( exam =>{
                obj.exam = exam
                resolve()
              },
              reason =>{
                console.log("ERROR reading exam:" + reason)
                resolve()
              })
            )
            localTransactions.push(
              this.examImprovisacionService.getMateria( examGrade.materia_id).then( materia =>{
                obj.materia = materia
                resolve()
              },
              reason =>{
                console.log("ERROR materia cannot be read:" + reason)
                resolve()
              })
            )
            localTransactions.push(
              this.getUser(examGrade.student_uid).then(student =>{
                obj.student = student
                resolve()
              },
              reason =>{
                console.log("ERROR student cannot be read:" + reason)
                resolve()
              }) 
            )   
            Promise.all( localTransactions ).then( () =>{
              resolve()
            },
            reason=>{
              console.log("ERROR localtransaction:" + reason)
              resolve()
            })         
          },
          reason =>{
            console.log("ERROR loading examgrade:" + reason)
            resolve() //will ignore the fact we can not read some records
          })
  
        })
      )
      Promise.all(transaction).then(()=>{
        if( obj.examGrade && obj.examGrade.isDeleted == false ){
              this.examenes.push(obj)
        }        
        resolve()
      },
      reason =>{
        console.log("some errors has been found:" + reason)
        reject()
      })
    })
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
