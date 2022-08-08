import { nullSafeIsEquivalent } from '@angular/compiler/src/output/output_ast';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { Router } from '@angular/router';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { copyObj, ExamGrade, ExamGradeMultipleRequest, ExamGradeRequest, ParameterGrade } from '../exams/exams.module';
import { UserLoginService } from '../user-login.service';

import * as uuid from 'uuid';
import { db } from 'src/environments/environment';
import { NodeTableRow,NodeTableDataSource } from '../node-table/node-table-datasource';
import { UserPreferencesService } from '../user-preferences.service';

@Component({
  selector: 'app-exam-table',
  templateUrl: './exam-table.component.html',
  styleUrls: ['./exam-table.component.css']
})
export class ExamTableComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<NodeTableRow>;

  examGradeList:NodeTableRow[] = []

  dataSource: NodeTableDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['titulo', 'alumna', 'completed', 'score',  'release', 'unrelease','delete'];

  released = false
  periodicRefresh = false
  applicationDates = []
  applicationDate:Date = null

  submmiting = false
  showDeleted = false

  organization_id = null

  
  constructor( 
      private router: Router
    , private userLoginService: UserLoginService
    , private examImprovisacionService: ExamenesImprovisacionService
    , private userPreferencesService:UserPreferencesService
  ) {
    this.organization_id = userPreferencesService.getCurrentOrganizationId()

  }


  ngOnInit() {
    this.update()
  }
  ngAfterViewInit() {
    this.sort.active = 'title'
    this.sort.direction = 'asc'    
  }

  update(){
    this.loadExamGrades().then( ()=>{
      this.updateList()
    })
  }
  updateList(){
    this.dataSource = new NodeTableDataSource(this.examGradeList);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;   
  }

  loadExamGrades():Promise<void>{
    var _resolve = null
    return new Promise<void>((resolve, reject) =>{  
      _resolve = resolve

      this.examGradeList.length = 0

      var saved_applicationDate = localStorage.getItem('applicationDate')
      if (saved_applicationDate && saved_applicationDate != 'null'){
        this.applicationDate = new Date( saved_applicationDate )
      }      

      db.collection("examGrades")
      .where("organization_id", "==", this.organization_id)
      .where( "isDeleted", "==", false)
      .where( "applicationDate", "==", this.applicationDate)
      .get().then( set =>{
        let m = set.docs.map( doc =>{
          let examGrade:ExamGrade = doc.data() as ExamGrade
          let node:NodeTableRow = {
            obj:{
              "id":examGrade.id,
              "materia_id":examGrade.materia_id,
              "materia_name":null,
              "student_uid":examGrade.student_uid,
              "student_name":null,
              "title":examGrade.title,
              "score":examGrade.score,
              "isReleased":examGrade.isReleased,
              "isCompleted":examGrade.isCompleted
            },
            opened:false,
            children:[],
            nodeClass:"examGrade",
            isLeaf:false

            
          }
          this.examGradeList.push(node)
          db.collection("materias").doc(examGrade.materia_id).get().then(doc=>{
            node.obj["materia_name"] = doc.data().materia_name
          })
          this.examImprovisacionService.getUser(examGrade.student_uid).then( user =>{
            node.obj['student_name'] = user.claims["displayName"] || user.displayName || user.email
          })

          return this.loadParameterGrades(examGrade.id,node.children)
          
        })
        Promise.all(m).then( () =>{
          console.log("End loading Exams")
          _resolve()
        }) 
        .catch(reason =>{
          console.error("Error waiting for parameters:" + reason)
        }) 
      })
    })        
      
  }

  loadParameterGrades(examGrade_id, parent:NodeTableRow[]):Promise<void>{
    var _resolve = null
    return new Promise<void>((resolve, reject) =>{  
      _resolve = resolve
      db.collection(`examGrades/${examGrade_id}/parameterGrades`)
      .get().then( set =>{
        let m = set.docs.map( doc =>{
          let parameterGrade = {
            id:doc.data().id,
            label:doc.data().label,
            score:doc.data().score,
            isCompleted:doc.data().isCompleted,
            idx:doc.data().idx
          }
          let node:NodeTableRow = {
            obj:{
              "examGrade_id":examGrade_id,
              "parameterGrade_id":parameterGrade.id,
              "label":parameterGrade.label,
              "score":parameterGrade.score,
              "isCompleted":parameterGrade.isCompleted,
              "idx":parameterGrade.idx
            },
            opened:false,
            children:[],
            nodeClass:"parameterGrade",
            isLeaf:true
          }
          parent.push(node)          
        })

        console.log("End loading ParameterGrades")
        _resolve()
      })
      .catch( reason =>{
        console.log("error loading parameterGrades" + reason)
      })
    })        
      
  }


  onDelete(title, examGrade_id){
    
    

    if( !confirm("Esta seguro de querer borrar todos los examenes de::" + title ) ){
      return
    }
    else{
      db.collection("examGrades").doc(examGrade_id).update({
        isDeleted:true
      }).then(()=>{
        console.log("examGrade has been deleted")
        this.update()
      },
      reason=>{
        console.log("ERROR removing examGrade:" + reason)
      })
    }

  }
  
  updateRelease(row:NodeTableRow, value:boolean){

 
    db.collection("examGrades").doc(row.obj["id"]).update({
      isReleased:value
    }).then( ()=>{
      console.log("examGrade was released")
      this.update()
    },
    reason =>{
      console.log("Examgrade release failed:" + reason)
    })
  

  }
  isAdmin(){
    return this.userLoginService.hasRole("role-admin-" + this.organization_id)
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
        this.update()
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
  onCreate(){
    this.router.navigate(['/ExamenImprovisacionFormComponent']);
  }  

  onEditParameterGrade(examGrade_id, parameterGrade_id){
    this.router.navigate(['/ei-ap-parameter-form-component',{examGrade_id:examGrade_id,parameterGrade_id:parameterGrade_id}]);
  }  
}
