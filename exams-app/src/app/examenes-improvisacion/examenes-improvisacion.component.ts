import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { ExamenesImprovisacionDataSource, ExamenesImprovisacionItem } from './examenes-improvisacion-datasource';
import { ExamenesImprovisacionService} from '../examenes-improvisacion.service'
import { ActivatedRoute, Router } from '@angular/router';
import { UserLoginService } from '../user-login.service';
import { ExamGrade, ExamGradeMultipleRequest, ParameterGrade, ParameterGradeRequest } from '../exams/exams.module';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';




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
  displayedColumns = ['materia', "title", 'estudiante', 'maestro', 'tipo', 'parametro', 'fechaApplicacion', 'completado',"id"];
  

  applicationDate = null
  evaluador_uid
  completado
  applicationDates = []

  constructor( 
      private fb: FormBuilder 
    , private route: ActivatedRoute
    , private router: Router
    , private userLoginService: UserLoginService
    , private examImprovisacionService: ExamenesImprovisacionService
    ) {
      

  }

  submitting = false
  
  ngOnInit() {
    console.log("on init called")

    if( this.isAdmin() || this.isReadOnly() ){
      this.completado = null
      this.evaluador_uid = null
      this.applicationDate = null
    }
    else{
      this.completado = false
      this.evaluador_uid = this.userLoginService.getUserUid()
      this.applicationDate = new Date().toISOString().slice(0, 10)
    }

    if( this.isReadOnly() ){
      const index = this.displayedColumns.indexOf('maestro', 0);
      if (index > -1) {
         this.displayedColumns.splice(index, 1);
      }
    }

    


    this.userLoginService.getUserIdToken().then(
      token => {
        this.getApplicationDates(token)
        this.updateList(token, this.completado, this.evaluador_uid, this.applicationDate ? this.applicationDate: null)
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

  updateList( token , completado, evaluador_uid , applicationDate){
    var request:ExamGradeMultipleRequest = {
      examGrades:[{
        id:null,
        exam_id:null,
        exam_label:null,

        course: null,
        completed: null,
        applicationDate:applicationDate,
      
        student_uid:null,
        student_name:null,
      
        title:null,
        expression:null,

        score:null,
      
        parameterGrades:[
          {
            id: null,
            idx: null,
            label: null,
            scoreType: null,
            score:null,
            evaluator_uid:evaluador_uid,
            evaluator_name:null,
         
            completed:completado
          
          }
        ]
      }]
    }
    if (applicationDate == null){
      request["orderBy"]={
        "applicationDate":"asc",
        "id":"asc"
      }      
    }
      
    this.examImprovisacionService.firestoreApiInterface("get", token, request).subscribe(
      result => { 
        var examImprovisationArray:ExamGrade[] = result["result"];
        let datavalues: ExamenesImprovisacionItem[] = [];
        for(var i=0; examImprovisationArray!=null && i<examImprovisationArray.length;i++){
          let examGrade:ExamGrade = examImprovisationArray[i]
          for( var j=0; j< examGrade.parameterGrades.length; j++){
            let parameterGrade:ParameterGrade = examGrade.parameterGrades[j]
      
            //console.log(exam.id)
            var obj:ExamenesImprovisacionItem = {
              examGrade_id:examGrade.id,
              parameterGrade_id: parameterGrade.id, 
              materia: examGrade.course,
              title: examGrade.title,
              student_name: examGrade.student_name,
              maestro:parameterGrade.evaluator_name,
              tipo: examGrade.exam_label,
              parametro:parameterGrade.label,
              fechaApplicacion:examGrade.applicationDate.toString().substring(0, 10), 
              completado: parameterGrade.completed,
              calificacion:(parameterGrade.score)?parameterGrade.score:0
            }
            datavalues.push(obj)
          }
        }  
        
        this.dataSource = new ExamenesImprovisacionDataSource(datavalues);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.table.dataSource = this.dataSource;            
    
      },
      error => {
        if( error.error && error.error instanceof String && error.error.search("token")){
          console.log("ERROR al leer lista de examenes:" + error.status + " " + error.error)
          this.router.navigate(['/loginForm'])
        }
        else{
          alert("ha habido un error por favor reintente")
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
  gotoLogin() {
    this.router.navigate(['/loginForm']);
  }  
  onRemove(row){
    if( !confirm("Esta seguro de querer borrar el examen:" + row.materia + " " + row.estudiante + " " + row.maestro + " " + row.tipo + " " +  row.parametro + " " + row.fechaApplicacion) ){
      return
    }    
    this.submitting=true
    var request:ParameterGradeRequest = {
      parameterGrades:{
        id:row.parameterGrade_id
      }
    }

    
    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.firestoreApiInterface("delete", token, request).subscribe(
        data => {
          this.submitting=false
          console.log("delete compled successfully")
          this.ngOnInit()
        },
        error =>{
          this.submitting=false
          alert("error en delete:" + error.error)
        }
      )
    },
    error => {
      alert("ERROR al leer lista de examenes:" + error.errorCode + " " + error.errorMessage)
    })
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

  onRefresh(){
    if( this.timerId != null ){
      console.log("removing timeout")
      clearInterval(this.timerId);
      this.timerId = null
    }
    else{
      console.log("adding timeout")
      this.ngOnInit()
      this.timerId = setInterval(
        () => { 
          console.log("calling refresh")
          this.ngOnInit() 
        }
        , 20000);
    }
  }
  getApplicationDates(token){
    var applicationDates = [""]

    var req = {
      examGrades:[{
        applicationDate:null
      }]
    }
    this.examImprovisacionService.firestoreApiInterface("get", token, req).subscribe(
      data => {
        var resultSet = data["result"]  
        for( var i=0; i<resultSet.length; i++){
          let a = resultSet[i]["applicationDate"] 
          if( applicationDates.indexOf(a) === -1 ){
            applicationDates.push(a)
          }
        }
      },
      error => {
        alert("error getApplicationDates "  + error.errorCode + " " + error.errorMessage)
    })    
    this.applicationDates = applicationDates  
  }
  applicationDateChange(){
    console.log("date changed to:" + this.applicationDate)
    this.userLoginService.getUserIdToken().then(
      token => {
        this.updateList(token, this.completado, this.evaluador_uid, this.applicationDate ? this.applicationDate: null)
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
