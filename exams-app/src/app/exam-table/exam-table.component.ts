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
  applicationDate = null

  submmiting = false
  showDeleted = false

  
  constructor( 
      private router: Router
    , private userLoginService: UserLoginService
    , private examImprovisacionService: ExamenesImprovisacionService
  ) {
    

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
/*
    this.released = localStorage.getItem('released') === 'true' ? true : false

    this.userLoginService.getUserIdToken().then(
      token => { 
   
      var showReleased = false
      if( this.released ){
        showReleased = null
      }


      if( this.applicationDate == null || this.applicationDate == "" ){
        this.applicationDate = null
      }
      else{
        this.applicationDate = this.applicationDate.toISOString().split('T')[0]
      }


      var request :ExamGradeMultipleRequest = {
      

        examGrades:[{
          id:null,
          exam_id:null,          
          completed: null,
          applicationDate:this.applicationDate,
        
          student_email:null,
          student_name:null,
          student_uid:null,
        
          title:null,
          expression:null,

          score:null,
          certificate_url:null,

          released:showReleased,
          isDeleted:this.showDeleted?true:false,

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

      this.submmiting = true
      var startTime =  new Date().getTime();
        
      this.examImprovisacionService.firestoreApiInterface("get", token, request).subscribe(
        result => { 
          this.submmiting = false
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

    },
    error => {
      if( error.status == 401 ){
        this.router.navigate(['/loginForm']);
      }
      else{
        alert("ERROR al leer lista de improvisacion:" + error.errorCode + " " + error.errorMessage)
      }
    })   
    */
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
      .where( "owners","array-contains", this.userLoginService.getUserUid())
      .where( "isDeleted", "==", false)
      .where( "applicationDate", "==", this.applicationDate)
      .get().then( set =>{
        let m = set.docs.map( doc =>{
          let examGrade:ExamGrade = {
            id:doc.data().id,
            title:doc.data().title,
            materia_id:doc.data().materia_id,
            student_uid:doc.data().student_uid,
            score:doc.data().score,
            certificate_url:doc.data().certificate_url,
            isReleased:doc.data().isReleased,
            isCompleted:doc.data().isCompleted
          }
          let node:NodeTableRow = {
            obj:{
              "id":examGrade.id,
              "materia_id":examGrade.materia_id,
              "materia_name":null,
              "student_uid":examGrade.student_uid,
              "student_name":null,
              "title":examGrade.title,
              "score":examGrade.score,
              "certificate_url":examGrade.certificate_url,
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
      .where( "owners","array-contains", this.userLoginService.getUserUid()).get().then( set =>{
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

    /*

    var req:ExamGradeRequest = {
      examGrades:{
        id:id,
        isDeleted:true
      }
    }
    console.log(JSON.stringify(req,null,2))

    this.submmiting = true
    
    this.userLoginService.getUserIdToken().then( token => {

      this.examImprovisacionService.firestoreApiInterface("update", token, req).subscribe(data => {
        this.submmiting = false
        console.log("examgrade removed")
        this.applicationFilterChange(null)
      },
      error => {
        this.submmiting = false
        alert("error examgrade removed"  + error.errorCode + " " + error.errorMessage)
        console.log( "error:" + error.error )      
      }) 
    },
    error => {
      this.submmiting = false
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })  
  */
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

  updateExamReleased(examGrade:ExamGrade, value:boolean){
    /*
    //calculate average
    var total = 0.0
    examGrade.parameterGrades.forEach( parameter => {                              
                                    total = total + parameter.score
                                  }
                                )
    var score = Number((total / examGrade.parameterGrades.length).toFixed(2))
    var url = examGrade.certificate_url

    var req:ExamGradeRequest = {
      examGrades:{
        id:examGrade["id"],
        isReleased:value,
        score:score,
        certificate_url:url
      }
    }
    console.log(JSON.stringify(req,null,2))
    
    this.userLoginService.getUserIdToken().then( token => {

      this.examImprovisacionService.firestoreApiInterface("update", token, req).subscribe(data => {
        console.log("examgrade release")
        examGrade.isReleased = value   
        this.updateList()   
      },
      error => {
        alert("error examgrade release"  + error.errorCode + " " + error.errorMessage)
        console.log( "error:" + error.error )
      
      }) 
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    
    })  
    */
  }
  isAdmin(){
    return this.userLoginService.hasRole("admin")
  }

  crearCertificado(examGrade:ExamGrade, value:boolean){
/*
    var req = {
      "certificateId":examGrade.exam_id + "_" + examGrade.id + "_" + examGrade.student_uid + "_" + uuid.v4(),
      "masterName":examGrade.exam_typeCertificate,
      "logoName":examGrade.exam_iconCertificate,
      "studentName":examGrade.student_name,
      "materiaName":examGrade.exam_label,
      "label1":"",
      "label2":examGrade.exam_label,
      "label3":"",
      "label4":"",
      "color1":"black",
      "color2":"red"
    }


    console.log(JSON.stringify(req,null,2))
    
    this.userLoginService.getUserIdToken().then( token => {

      this.examImprovisacionService.certificateInterface("create", token, req).subscribe(data => {
        if( data["result"] ){
          console.log("certification created" + data["result"].certificate_logo_url + " " + data["result"].certificate_url)
          examGrade.certificate_url = data["result"].certificate_url
          this.updateExamReleased(examGrade, value)
        } 
        else{
          alert("Error:" + data["error"])
        }       
      },
      error => {
        alert("Error creando certificado"  + error.statusText)
        console.log( "error:" + error.statusText )
        this.updateExamReleased(examGrade,value)
      
      }) 
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    
    })  
*/
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
