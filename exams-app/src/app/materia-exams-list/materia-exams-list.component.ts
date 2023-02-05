import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Exam, ExamGrade } from '../exams/exams.module';
import { UserLoginService } from '../user-login.service';
import { UserPreferencesService } from '../user-preferences.service';
import { db , storage  } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as uuid from 'uuid';
import { DialogNameDialog } from '../name-dialog/name-dlg';

interface examItem{
  exam:Exam
  examGrade:ExamGrade
}

@Component({
  selector: 'app-materia-exams-list',
  templateUrl: './materia-exams-list.component.html',
  styleUrls: ['./materia-exams-list.component.css']
})
export class MateriaExamsListComponent implements OnInit, OnDestroy {
  @Input() materiaid:string = null
  organization_id:string
  isAdmin = false
  unsubscribe = null
  submitting = false
  exams:Array<examItem> = []
  userUid = null
  constructor(
    private userPreferenceService:UserPreferencesService
    , private userLoginService:UserLoginService
    , public dialog: MatDialog
    , private examImprovisacionService: ExamenesImprovisacionService
    , private router: Router    
  ) {
    this.organization_id = this.userPreferenceService.getCurrentOrganizationId()
    this.isAdmin = this.userLoginService.hasRole("role-admin-" + this.organization_id)
    this.userUid = this.userLoginService.getUserUid()
   }
  
   ngOnDestroy(): void {
    this.unsubscribe()
  }
  ngOnInit(): void {
    if( this.materiaid != null){
      this.loadExams()
    }
  }
  loadExams():Promise<void>{
    return new Promise<void>((resolve, reject) =>{
      this.exams.length = 0
      this.submitting = true
      this.unsubscribe = db.collection("materias/" + this.materiaid + "/exams")
      .where("isDeleted","==", false).onSnapshot( snapshot =>{
        this.submitting = false
        this.exams.length = 0
        snapshot.docs.map( doc =>{
          const exam = doc.data() as Exam
          var ei:examItem={
            exam:exam,
            examGrade:null
          }
          this.exams.push(ei)
          this.getExamGrade( exam.id ).then( examGrade =>{
            ei.examGrade = examGrade
          },
          reason =>{
            console.log("no examgrade found")
          })
        })
        
        this.exams.sort( (a,b) => {
          return a.exam.label > b.exam.label ? 1:-1})
        resolve()
      },
      reason =>{
        console.log("ERROR reading Laboratory:" + reason)
        reject()
      })
    })
  }

  onDeleteExam(exam:Exam){
    if( !confirm("Esta seguro de querer borrar el examen:" +  exam.label) ){
      return
    }     
    db.collection("materias/" + this.materiaid + "/exams").doc(exam.id).update({"isDeleted":true}).then(
      result =>{
        console.log("exam delted")
      }
    )
  }  
  onDuplicateExam(exam:Exam){
    this.submitting = true
    
    this.duplicateExam(exam.id, exam.label + "_copy").then( () =>{
      this.submitting = false
    },
    reason=>{
      alert("duplicate failed" + reason)
      this.submitting = false
    })
  }  
  duplicateExam(exam_id, exam_label:string):Promise<void>{
    
    var _resolve
    var _reject
    return new Promise<null>((resolve, reject)=>{
      _resolve = resolve
      _reject = reject
      var req = {
        materias:{
          id:this.materiaid,
          exams:
            {
              id:exam_id,
              label:exam_label
            }
          
        }
      }
      this.userLoginService.getUserIdToken().then( token => {
        this.examImprovisacionService.firestoreApiInterface("dupSubCollection", token, req).subscribe(
          data => { 
            var exam:Exam = data["result"]
            _resolve()
          },   
          error => {  
            console.error( "ERROR: duplicando examen:" + JSON.stringify(req))
            _reject()
          }
        )
      },
      error => {
        alert("Error in token:" + error.errorCode + " " + error.errorMessage)
        this.submitting = false
      }) 
    }) 
        
  }

  onEditExam(exam_id){
    this.router.navigate(['/ei-tipo-edit',{materia_id:this.materiaid, exam_id:exam_id}]);
  }

  createExam(label:string):Promise<Exam>{
    return new Promise<Exam>( (resolve, reject) =>{
      var id = uuid.v4()
      const exam:Exam = {
        id:id,
        label:label,
        
        isDeleted:false,
        isRequired:false
      }
      db.collection('materias/' + this.materiaid + '/exams').doc(id).set(exam).then( () =>{
        console.log("examen created")
        resolve( exam )
      },
      reason =>{
        alert("ERROR creating exam:" + reason)
        reject(null)
      })
    })

  }
  onCreateExam(){
    const dialogRef = this.dialog.open(DialogNameDialog, {
      height: '400px',
      width: '250px',
      data: { label:"Examen", name:""}
    });
  
    dialogRef.afterClosed().subscribe(data => {
      console.log('The dialog was closed');
      if( data != undefined ){
        console.debug( data )
        this.createExam(data.name).then( (exam)=>{
          this.onEditExam(exam.id)
        },
        reason =>{
          alert("ERROR: removing level")
        })
      }
      else{
        console.debug("none")
      }
    });
  }


  onExamGradeReport(examGradeId:string){
    this.router.navigate(['/report',{examGrade_id:examGradeId}]);
  }

  getExamGrade( examId ):Promise<ExamGrade>{
    return new Promise<ExamGrade>( (resolve, reject) =>{
      const grades = db.collection("examGrades")
      .where("organization_id", "==", this.organization_id )
      .where("student_uid","==", this.userUid)
      .where("materia_id","==", this.materiaid)
      .where("exam_id","==",examId)
      .where("isDeleted","==",false)

      grades.get().then( 
        snapshot => {
          if( snapshot.docs.length > 0 ){
            var examGrade:ExamGrade = snapshot.docs[0].data()
            resolve(examGrade)
          }
          else{
            reject(null)
          }
        },
        reason =>{
          console.error("ERROR reading examGrades:" + reason )
        }
      )
    })
  }

}
