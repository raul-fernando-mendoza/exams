import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, signal, ViewChild, WritableSignal } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable } from '@angular/material/table';
import { Router } from '@angular/router';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { CriteriaGrade, ExamGrade, ParameterGrade } from '../exams/exams.module';
import { UserLoginService } from '../user-login.service';

import { db } from 'src/environments/environment';
import { NodeTableRow,NodeTableDataSource } from '../node-table/node-table-datasource';
import { UserPreferencesService } from '../user-preferences.service';
import { DateFormatService } from '../date-format.service';
import { FormBuilder } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MatInputModule } from '@angular/material/input';
import { MatTableModule} from '@angular/material/table';
import { MatPaginatorModule} from '@angular/material/paginator';
import { MatDatepickerModule} from '@angular/material/datepicker';
import { MatToolbarModule} from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { UserSelectorComponent } from '../user-selector/user-selector.component';
import { MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'app-exam-table',
  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule   
   
    ,FormsModule
    ,ReactiveFormsModule
    ,MatFormFieldModule
    ,MatInputModule 

    ,MatTableModule
    ,MatPaginatorModule
    ,MatDatepickerModule
    ,MatToolbarModule
    
    ,MatProgressSpinnerModule
    ,MatMenuModule
    ,UserSelectorComponent
    ,MatSortModule
  ],    
  templateUrl: './exam-table.component.html',
  styleUrls: ['./exam-table.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ExamTableComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatTable) table: MatTable<NodeTableRow>;

  examGradeList:NodeTableRow[] = []

  dataSource = signal<NodeTableDataSource>(new NodeTableDataSource(this.examGradeList));

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['applicationDate', 'titulo', 'alumna', 'completed', 'score',  'release', 'unrelease','delete'];

  released = false
  periodicRefresh = false
  
  applicationDate:Date = null
  studentId:string|null = null

  submitting = signal(true)
  showDeleted = false

  organization_id = null

  snapshots:Array<any> = []

  filterForm = this.fb.group({
    studentUid:[""]
  })
  
  constructor( 
      private router: Router
    , private userLoginService: UserLoginService
    , private examImprovisacionService: ExamenesImprovisacionService
    , private userPreferencesService:UserPreferencesService
    , public dateFormatService:DateFormatService
    , public fb:FormBuilder
    ,private changeDetectorRef: ChangeDetectorRef
  ) {
    this.organization_id = userPreferencesService.getCurrentOrganizationId()

  }

  toFixed(num, fixed){
    if(num == null){
      return null
    }
    else{
      num = Math.trunc(num*100)/100
      return num
    }
  }


  ngOnInit() {
    var saved_applicationDate = localStorage.getItem('applicationDate')
    if (saved_applicationDate && saved_applicationDate != 'null'){
      try{
        this.applicationDate = new Date( saved_applicationDate )
      }
      catch(e){
        this.applicationDate == null
      }
    }  
    var studentUid = localStorage.getItem('studentUid')
    if( studentUid ){
      this.filterForm.controls.studentUid.setValue( studentUid )
    }

    this.update()
  }
  ngAfterViewInit() {
    this.loadExamGrades().then( ()=>{
      this.updateList()
    })       
  }
  update(){
    this.loadExamGrades().then( ()=>{
      this.updateList() 
    }) 
  }
  updateList(){
    this.changeDetectorRef.detectChanges()
    let nodeTableDataSource = new NodeTableDataSource(this.examGradeList)
    this.dataSource.set(nodeTableDataSource);
    this.dataSource().paginator = this.paginator;
    this.table.dataSource = this.dataSource();   
  }

  loadExamGrades():Promise<void>{
    var _resolve = null
    return new Promise<void>((resolve, reject) =>{  
      _resolve = resolve

      this.examGradeList.length = 0

      var qry = db.collection("examGrades")
      .where("organization_id", "==", this.organization_id)
      .where( "isDeleted", "==", false)

      var saved_applicationDate = localStorage.getItem('applicationDate')
      if( saved_applicationDate && saved_applicationDate != 'null'){
        var d:Date = new Date(saved_applicationDate)
        var dateId = this.dateFormatService.getDayId(d)
        qry = qry.where( "applicationDay", "==", dateId )
      }

      var studentUid = localStorage.getItem('studentUid')
      if( studentUid ){
        qry = qry.where("student_uid","==", studentUid)
      }
      if( this.snapshots.length > 0){
        this.snapshots.map( func =>{
          func()
        })
        this.snapshots.length = 0
      }
      if( !this.applicationDate && !studentUid){
        qry = qry.orderBy("applicationDate", "desc")
        qry = qry.limit(100)
      }

      this.submitting.set(true)
      var unsubscribe = qry.onSnapshot( set =>{
        this.examGradeList.length = 0
        let m = set.docs.map( doc =>{
          let examGrade:ExamGrade = doc.data() as ExamGrade
          var d:any = examGrade.applicationDate
          console.log( d.toDate("applicationDate", "desc") )

          let node:NodeTableRow = {
            obj:{
              "id":examGrade.id,
              "applicationDate":d.toDate(),
              "materia_id":examGrade.materia_id,
              "materia_name":null,
              "student_uid":examGrade.student_uid,
              "student_name":null,
              "title":examGrade.title,
              "score":this.toFixed(examGrade.score,2),
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
            if( doc.exists ){
              node.obj["materia_name"] = doc.data().materia_name
            }
          })
          this.examImprovisacionService.getUser(examGrade.student_uid).then( user =>{
            let displayName = this.userLoginService.getDisplayNameForUser(user)
            node.obj['student_name'] = displayName
          })

          return this.loadParameterGrades(examGrade.id,node.children)
          
        })
        Promise.all(m).then( () =>{
          this.submitting.set(false)
          console.log("End loading Exams")
          this.examGradeList.sort( (a,b) =>{
            if( this.dateFormatService.formatDate(a.obj["applicationDate"]) == this.dateFormatService.formatDate(b.obj["applicationDate"]) ){
              if ( a.obj["title"] ){
                return a.obj["title"] > b.obj["title"] ? 1 : -1
              }
              if( a.obj["label"] ){
                return a.obj["label"] > b.obj["label"] ? 1 : -1
              }
              
            }
            else{
              return a.obj["applicationDate"] < b.obj["applicationDate"] ? 1 : -1
            }
          })
          _resolve()
        }) 
        .catch(reason =>{
          console.error("Error waiting for parameters:" + reason)
          reject()
        }) 
      },
      reason =>{
        console.log(reason)
        alert("Error loading exams grades:" + reason)
      })
      this.snapshots.push( unsubscribe )
    })        
      
  }

  loadParameterGrades(examGrade_id, parent:NodeTableRow[]):Promise<void>{
    var _resolve = null
    return new Promise<void>((resolve, reject) =>{  
      _resolve = resolve
      let qry = db.collection("examGrades/" + examGrade_id + "/parameterGrades")
      .where("isCurrentVersion", "==",true)


      var unsubscribe = qry.onSnapshot( set =>{
        parent.length = 0
        let m = set.docs.map( doc =>{
          console.log("loading ParameterGrades for:" + examGrade_id)
          let parameterGrade = doc.data() as ParameterGrade

          let node:NodeTableRow = {
            obj:{
              "examGrade_id":examGrade_id,
              "parameterGrade_id":parameterGrade.id,
              "label":parameterGrade.label,
              "score":this.toFixed( parameterGrade.score,2),
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
        parent.sort( (a,b) =>{
          return a.obj["label"] > b.obj["label"] ? 1 : -1
        })
        console.log("End loading ParameterGrades")
        _resolve()
      },
      reason =>{
        alert( "error reading exams:" + reason)
      })
     
      this.snapshots.push( unsubscribe )
    })        
      
  }


  onDelete(title, examGrade_id){
    if( !confirm("Esta seguro de querer borrar todos los examenes de::" + title ) ){
      return
    }
    else{
      db.collection("examGrades").doc(examGrade_id).update({
        isDeleted:true,
        updated_on:new Date()
      }).then(()=>{
        console.log("examGrade has been deleted")
        db.collection("examGrades/" + examGrade_id + "/parameterGrades").get().then(
          set =>{
            var all_promises = set.docs.map( doc =>{
              return doc.ref.update({"isDeleted":true})
            })
            Promise.all( all_promises ).then(
              () => {
                this.update()
              }
            )
            
          }
        )        
      },
      reason=>{
        console.log("ERROR removing examGrade:" + reason)
      })
    }
  }
  
  updateRelease(row:NodeTableRow, value:boolean){

 
    db.collection("examGrades").doc(row.obj["id"]).update({
      isReleased:value,
      updated_on:new Date()
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

  
  onCreate(){
    this.router.navigate(['/ExamenImprovisacionFormComponent']);
  }  

  onEditParameterGrade(examGrade_id, parameterGrade_id){
      this.router.navigate(['/examGrade-parameterGrade-apply',{examGrade_id:examGrade_id,parameterGrade_id:parameterGrade_id}]);
  } 
  ngOnDestroy(): void {
    this.snapshots.map( func =>{
      func()
    })
  }   
  onReset(examGrade_id, parameterGrade_id, title){
    if( !confirm("Esta seguro de querer limpiar:" +  title) ){
      return
    }    

    this.resetExamGradeParameter(examGrade_id, parameterGrade_id).then( ()=>{
      this.update()
    })
    .catch( ()=>{
      console.log("ERROR: reseteando el examen")
    })

  }  
  resetExamGradeParameter(examGrade_id, parameterGrade_id):Promise<void>{

    return new Promise<void>( (resolve, reject) => {

     
      let parameterGradeDoc = db.collection('examGrades/' + examGrade_id + '/parameterGrades').doc(parameterGrade_id)


      parameterGradeDoc.collection('criteriaGrades').get().then( criteriaSet =>{
        let criteriaMap = criteriaSet.docs.map( criteriaDoc =>{
          return this.resetCriteria(criteriaDoc)
        })
        Promise.all( criteriaMap ).then( ()=>{
          parameterGradeDoc.update({
            isCompleted:false,
            score:10, 
            evaluator_comment:null     
          }).then( () =>{
            resolve()
          })         
          
        })
        .catch( () =>{
          reject()
        })        
      })
      .catch( () =>{
        reject()
      })
    })

    
  }


  resetCriteria(criteriaDoc):Promise<void>{
    return new Promise<void>( (resolve, reject)=>{
      let criteriaGrade:CriteriaGrade = criteriaDoc.data() as CriteriaGrade
      criteriaDoc.ref.update({
        score:10,
        earnedPoints:criteriaGrade.availablePoints
      })
      criteriaDoc.ref.collection('aspectGrades').get().then( aspectGradeSet =>{
        let aspectMap = aspectGradeSet.docs.map( aspectGradeDoc=>{
          return aspectGradeDoc.ref.update({
            score:1,
            missingElements:null
          })
        })
        Promise.all( aspectMap ).then( ()=>{
          resolve()
        })
        .catch( () =>{
          reject()
        })
      })
      .catch( () =>{
        reject()
      })

    })
  }  

  onRemoveParameterGrade(examGrade_id, parameterGrade_id, title){
    if( !confirm("Esta seguro de querer eliminar:" +  title) ){
      return
    }    

    var req = {
      collection:"examGrades/" + examGrade_id + "/parameterGrades",
      id:parameterGrade_id
    }

    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.firestoreApiInterface("deleteCollectionObject", token, req).subscribe(
        {
          next(data){ 
            var res = data["result"] 
            //now update the examGrade updated_on

            db.collection("examGrades/").doc(examGrade_id).update({"updated_on": new Date()}).then(
              ()=>{
                console.log("examgrade has been updated for updated_on")
              },
              reason=>{
                alert("Error removiendo parameter:" + reason)
              }
            ) 
          },   
          error(reason){  
            alert( "ERROR: removiendo parameter:" + JSON.stringify(reason))
          },
          complete(){
            console.log("never called")
          }
        }
      )
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    }) 
  }
  examStudentChange(studentUid) {
    console.log("student selection:" + studentUid)
    localStorage.setItem('studentUid', studentUid ? studentUid : "", )     
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
}
