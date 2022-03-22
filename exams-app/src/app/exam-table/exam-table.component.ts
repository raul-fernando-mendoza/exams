import { nullSafeIsEquivalent } from '@angular/compiler/src/output/output_ast';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { Router } from '@angular/router';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { ExamenesImprovisacionItem } from '../examenes-improvisacion/examenes-improvisacion-datasource';
import { ExamGrade, ExamGradeMultipleRequest, ExamGradeRequest, ParameterGrade } from '../exams/exams.module';
import { UserLoginService } from '../user-login.service';
import { ExamTableDataSource } from './exam-table-datasource';

@Component({
  selector: 'app-exam-table',
  templateUrl: './exam-table.component.html',
  styleUrls: ['./exam-table.component.css']
})
export class ExamTableComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<ExamGrade>;
  dataSource: ExamTableDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['titulo', 'completed', 'released', 'release', 'unrelease','delete'];

  released = false
  periodicRefresh = false
  applicationDates = []
  applicationDate = null

  constructor( 
      private router: Router
    , private userLoginService: UserLoginService
    , private examImprovisacionService: ExamenesImprovisacionService
  ) {
    

  }


  ngOnInit() {
    

    this.released = localStorage.getItem('released') === 'true' ? true : false

    this.userLoginService.getUserIdToken().then(
      token => {
        this.updateList(token,  this.released, this.applicationDate ? this.applicationDate: null)
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

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }

  updateList( token ,  released:boolean , applicationDate){
    
   
   
    var hideReleased = null
    if( released ){
      hideReleased = true
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

        course: null,
        completed: null,
        applicationDate:applicationDate,
      
        student_email:null,
        student_name:null,
      
        title:null,
        expression:null,

        score:null,
        certificate_url:null,

        released:null,
      
        parameterGrades:[
          {
            id: null,
            idx: null,
            label: null,
            scoreType: null,
            score:null,
            evaluator_uid:null,
            evaluator_email:null,
            evaluator_name:null,
         
            completed:null
          
          }
        ]
      }]
    }


    var startTime =  new Date().getTime();
      
    this.examImprovisacionService.firestoreApiInterface("get", token, request).subscribe(
      result => { 
        var endTime = new Date().getTime()
        const diffTime = Math.abs(endTime - startTime);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        console.log(diffTime + " milliseconds");

        var examGradeArray:ExamGrade[] = result["result"];
    
        this.dataSource = new ExamTableDataSource(examGradeArray);
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

  onDelete(title, id){

    if( !confirm("Esta seguro de querer borrar todos los examenes de::" + title ) ){
      return
    }

    var req:ExamGradeRequest = {
      examGrades:{
        id:id
      }
    }
    console.log(JSON.stringify(req,null,2))
    
    this.userLoginService.getUserIdToken().then( token => {

      this.examImprovisacionService.firestoreApiInterface("delete", token, req).subscribe(data => {
        console.log("examgrade removed")
        this.applicationFilterChange(null)
      },
      error => {
        alert("error examgrade removed"  + error.errorCode + " " + error.errorMessage)
        console.log( "error:" + error.error )      
      }) 
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })  

  }
  
  updateRelease(row:ExamGrade, value:boolean){

    //calculate average
    var total = 0.0
    row.parameterGrades.forEach( parameter => {                              
                                    total = total + parameter.score
                                  }
                                )
    var score = Number((total / row.parameterGrades.length).toFixed(2))

    var req:ExamGradeRequest = {
      examGrades:{
        id:row["id"],
        released:value,
        score:score
      }
    }
    console.log(JSON.stringify(req,null,2))
    
    this.userLoginService.getUserIdToken().then( token => {

      this.examImprovisacionService.firestoreApiInterface("update", token, req).subscribe(data => {
        console.log("examgrade release")
        row.released = value
        
      },
      error => {
        alert("error examgrade release"  + error.errorCode + " " + error.errorMessage)
        console.log( "error:" + error.error )
      
      }) 
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    
    })  

  }
  isAdmin(){
    return this.userLoginService.hasRole("admin")
  }
  applicationFilterChange(e){
    if ( e instanceof MatDatepickerInputEvent ){
      if ( e.value == null ){
        this.applicationDate = null
      }
      else this.applicationDate = e.value
    }
    console.log("date changed to:" + this.applicationDate)
    localStorage.setItem('released' , this.released.toString())
    localStorage.setItem('applicationDate', this.applicationDate ? this.applicationDate.toISOString() : null)    
    this.userLoginService.getUserIdToken().then(
      token => {
        this.updateList(token,  this.released, this.applicationDate ? this.applicationDate: null)
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
}