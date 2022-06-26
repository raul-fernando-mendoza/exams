import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { ExamenesImprovisacionDataSource, ExamenesImprovisacionItem } from './examenes-improvisacion-datasource';
import { ExamenesImprovisacionService} from '../examenes-improvisacion.service'
import { ActivatedRoute, Router } from '@angular/router';
import { UserLoginService } from '../user-login.service';
import { ExamGrade, ExamGradeMultipleRequest, ParameterGrade, ParameterGradeRequest } from '../exams/exams.module';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { stringify } from '@angular/compiler/src/util';




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
  displayedColumns = ['materia', "title", 'estudiante', 'maestro', 'tipo', 'parametro', 'fechaApplicacion', 'completed',"id"];
  

  evaluator_name = null
  evaluator_email = null
  student_uid = null
  student_email = null
  hideCompleted = true
  periodicRefresh = false
  applicationDates = []
  applicationDate = null
  releasedOnly = null

  constructor( 
      private router: Router
    , private userLoginService: UserLoginService
    , private examImprovisacionService: ExamenesImprovisacionService
    ) {
      

  }

  submitting = false
  
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

    if( applicationDate == null || applicationDate == "" ){
      applicationDate = null
    }
    else{
      applicationDate = applicationDate.toISOString().split('T')[0]
    }

    var request:ExamGradeMultipleRequest = {
      examGrades:[{
        id:null,
        exam_id:null,
        exam_label:null,

        completed: null,
        applicationDate:applicationDate,
      
        student_email:this.student_email,
        student_name:null,
        student_uid:null,
      
        title:null,
        expression:null,

        score:null,
        certificate_url:null,

        released:this.releasedOnly,
      
        parameterGrades:[
          {
            id: null,
            idx: null,
            label: null,
            scoreType: null,
            score:null,
            evaluator_uid:null,
            evaluator_email:this.evaluator_email,
            evaluator_name:null,
         
            completed:showClosed
          
          }
        ]
      }]
    }

    this.submitting = true
    var startTime =  new Date().getTime();
      
    this.examImprovisacionService.firestoreApiInterface("get", token, request).subscribe(
      result => { 
        this.submitting = false
        var endTime = new Date().getTime()
        const diffTime = Math.abs(endTime - startTime);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        console.log(diffTime + " milliseconds");

        var examImprovisationArray:ExamGrade[] = result["result"];
        let datavalues: ExamenesImprovisacionItem[] = [];

        let applicationDates = []

        for(var i=0; examImprovisationArray!=null && i<examImprovisationArray.length;i++){
          let examGrade:ExamGrade = examImprovisationArray[i]
          for( var j=0; j< examGrade.parameterGrades.length; j++){
            let parameterGrade:ParameterGrade = examGrade.parameterGrades[j]
            let application_date_src = examGrade.applicationDate.toString().substring(0, 10)
            //console.log(exam.id)
            var obj:ExamenesImprovisacionItem = {
              examGrade_id:examGrade.id,
              parameterGrade_id: parameterGrade.id, 
              materia: examGrade.exam_label,
              title: examGrade.title,
              student_name: examGrade.student_name,
              maestro:parameterGrade.evaluator_name,
              tipo: examGrade.exam_label,
              parametro:parameterGrade.label,
              fechaApplicacion:application_date_src, 
              completed: parameterGrade.completed,
              calificacion:(parameterGrade.score)?parameterGrade.score:0,
              certificate_url:examGrade.certificate_url,
              student_email:examGrade.student_email
            }
            datavalues.push(obj)
          }
          
        }  
        
        this.dataSource = new ExamenesImprovisacionDataSource(datavalues);
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
        console.log("update completed")          
    
      },
      error => {
        this.submitting = false
        if( error.error && error.error instanceof String && error.error.search("token")){
          console.log("ERROR al leer lista de examenes:" + error.status + " " + error.error)
          this.router.navigate(['/loginForm'])
        }
        else{
          alert("ha habido un error al leer la lista de examenes:" + error.error)
          console.log("error:" + error.error)
        }
      }
    )        
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
}
