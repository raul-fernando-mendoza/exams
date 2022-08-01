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
import { stringify } from '@angular/compiler/src/util';

import { db } from 'src/environments/environment';
import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import * as firebase from 'firebase';
import { assertNotNull } from '@angular/compiler/src/output/output_ast';



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
  displayedColumns = [ "title", 'materia', 'estudiante', 'maestro', 'parametro', 'fechaApplicacion', 'completed',"id"];
  

  evaluator_name = null
  evaluator_email = null
  student_uid = null
  student_email = null
  hideCompleted = true
  periodicRefresh = false
  applicationDates = []
  applicationDate = null
  releasedOnly = null

  datavalues: ExamenesImprovisacionItem[] = [];  

  constructor( 
      private router: Router
    , private userLoginService: UserLoginService
    , private examImprovisacionService: ExamenesImprovisacionService
    ) {
      

  }

  submitting = false

  open_transactions:Set<string> = new Set()

  transactionStart(id){
    this.open_transactions.add(id)
  }
  updateTable(){
      this.dataSource = new ExamenesImprovisacionDataSource(this.datavalues);
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
      const index = this.displayedColumns.indexOf('maestro', 0);
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

  updateList( token , hideCompleted,  applicationDate){
    var showClosed = null
    if ( hideCompleted == true ){
      showClosed = false
    }
    else{
      showClosed = null
    }

    this.datavalues.length = 0
    var qry
    if( this.userLoginService.hasRole("admin")){
      qry = db.collectionGroup('parameterGrades')
      .where("owners", "array-contains" ,this.userLoginService.getUserUid())
      .where("applicationDate","==", applicationDate)
      .where("isDeleted", "==", false)
    }
    else{
      qry = db.collectionGroup('parameterGrades')
      .where("evaluator_uid", "==", this.userLoginService.getUserUid())
      .where("applicationDate","==", applicationDate)
      .where("isDeleted", "==", false)   
      .where("isCompleted", '==', false)   
    }
    
    qry.get().then( set => {
      console.log("set" + set.docs.length)
            
      var map = set.docs.map( doc =>{

        var parameterGrade:ParameterGrade = {
          id:doc.data().id,
          label:doc.data().label,
          evaluator_uid:doc.data().evaluator_uid,
          isCompleted:doc.data().isCompleted,
          applicationDate:doc.data().applicationDate,
          criteriaGrades:[]
        }
       
        
        
        var examGrade_id = doc.ref.path.split("/")[1]
      
  

        var obj:ExamenesImprovisacionItem = {
          exam:null,
          examGrade:null,
          parameterGrade: parameterGrade, 
          materia: null,
          student: null,
          approver:null,
          isCompleted:parameterGrade.isCompleted
        }

        this.getUser(parameterGrade.evaluator_uid).then(doc =>{
          obj.approver = doc
        })        
        this.datavalues.push(obj)

        return db.collection("examGrades").doc(examGrade_id).get().then(doc =>{
          
          let examGrade:ExamGrade = {
            id:doc.data().id,
            title:doc.data().title,
            exam_id:doc.data().exam_id,
            materia_id:doc.data().materia_id,
            student_uid:doc.data().student_uid,
            applicationDate:doc.data().applicationDate.toDate()
          }
          obj.examGrade = examGrade


          db.collection("exams").doc(examGrade.exam_id).get().then( doc =>{
            obj.exam = {
              id:doc.data().id,
              label:doc.data().label
            }
          })
    
          this.getUser(examGrade.student_uid).then(user=>{
            obj.student = user
          })

          db.collection("materias").doc(examGrade.materia_id).get().then( doc =>{
            obj.materia ={
              id:doc.data().id,
              materia_name:doc.data().materia_name
            }
          },
          reason =>{
            console.error("ERROR reading materia:" + reason)
          })
        },
        reason =>{
          console.error("ERROR: reading examGrade")
        })


      })
      Promise.all(map).then(()=>{
        this.datavalues.sort( (a,b) =>{
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
    return this.userLoginService.hasRole("admin")
  }
  isReadOnly(){
    return this.userLoginService.hasRole("readonly")
  }
  isEvaluador(){
    return this.userLoginService.hasRole("evaluador")
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
  async getUser(uid){
    var userReq = {
      "uid":uid
    }      

    const response = await this.examImprovisacionService.authApiInterface("getUser", null, userReq)
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
