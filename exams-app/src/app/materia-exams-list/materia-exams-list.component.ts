import { Component, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { Exam, ExamGrade, MateriaEnrollment } from '../exams/exams.module';
import { UserLoginService } from '../user-login.service';
import { UserPreferencesService } from '../user-preferences.service';
import { db , storage  } from 'src/environments/environment';
import { MatDialog  } from '@angular/material/dialog';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as uuid from 'uuid';
import { DialogNameDialog } from '../name-dialog/name-dlg';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

interface examItem{
  exam:Exam
  examGrade:ExamGrade  
}

@Component({
  selector: 'app-materia-exams-list',
  standalone: true,
  imports: [
     CommonModule
    ,MatIconModule
    ,MatButtonModule       
    ,MatProgressSpinnerModule
    ,MatListModule
    ,MatMenuModule
  ],   
  templateUrl: './materia-exams-list.component.html',
  styleUrls: ['./materia-exams-list.component.css']
})
export class MateriaExamsListComponent implements OnInit, OnDestroy {
  @Input() materiaid:string = null
  organization_id:string
  isAdmin = false
  unsubscribe = null
  submitting = signal(false)
  exams= signal<Array<examItem>|null>(null) 
  userUid = null
  isEnrolled = signal(false)

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
    this.examImprovisacionService.hasMateriaEnrollment(this.organization_id, this.materiaid, this.userUid).then( isEnrolled =>{
      this.isEnrolled.set(isEnrolled)
    })
  }
  loadExams(){
    this.submitting.set(true)
    this.unsubscribe = db.collection("materias/" + this.materiaid + "/exams")
    .where("isDeleted","==", false).onSnapshot( snapshot =>{
      this.submitting.set(false)
      let exams = new Array<examItem>()
      let transactions = []
      snapshot.docs.map( doc =>{
        const exam = doc.data() as Exam
        var ei:examItem={
          exam:exam,
          examGrade:null
        }
        exams.push(ei)
        let t = this.getExamGrade( exam.id ).then( examGrade =>{
          ei.examGrade = examGrade
        },
        reason =>{
          console.log("no materia exams found")
        })
        transactions.push(t)
      })
      Promise.all( transactions ).then( ()=>{
        exams.sort( (a,b) => {
          return a.exam.label > b.exam.label ? 1:-1
        })
        this.exams.set(exams)
      })

    },
    reason =>{
      console.log("ERROR reading exam:" + reason)
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
    this.submitting.set(true)
    
    this.duplicateExam(exam.id, exam.label + "_copy").then( () =>{
      this.submitting.set(false)
    },
    reason=>{
      alert("duplicate failed" + reason)
      this.submitting.set(false)
    })
  }  
  duplicateExam(exam_id, exam_label:string):Promise<void>{
    
    var _resolve
    var _reject
    return new Promise<null>((resolve, reject)=>{
      _resolve = resolve
      _reject = reject

      if( exam_id == null || exam_label == null){
        reject(null)
      }
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
      var options = {
        exceptions:["references","Path","Url"]
      }
      this.userLoginService.getUserIdToken().then( token => {
        this.examImprovisacionService.firestoreApiInterface("dupSubCollection", token, req, options).subscribe(
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
        this.submitting.set(false)
      }) 
    }) 
        
  }

  onEditExam(exam_id){
    this.router.navigate(['/materia',this.materiaid,'exam', exam_id]);
  }

  createExam(label:string):Promise<Exam>{
    return new Promise<Exam>( (resolve, reject) =>{
      var id = uuid.v4()
      const exam:Exam = {
        id:id,
        label:label,
        
        isDeleted:false,
        isRequired:false,
        parameters:[]
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
      if( data ){
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


  onExamGradeReport(exam:Exam, examGrade:ExamGrade){
    this.router.navigate(['/report',{materia_id:this.materiaid, exam_id:exam.id,examGrade_id:examGrade ? examGrade.id : null}]);
  }

  getExamGrade( examId ):Promise<ExamGrade>{
    return new Promise<ExamGrade>( (resolve, reject) =>{
      const qry = db.collection("examGrades")
      .where("organization_id", "==", this.organization_id )
      .where("student_uid","==", this.userUid)
      .where("materia_id","==", this.materiaid)
      .where("exam_id","==",examId)
      .where("isDeleted","==",false)
      //.where("isReleased","==",true)
         

      qry.get().then( set => {
          var examGrades = Array<ExamGrade>()
          if( set.docs.length > 0){
          set.docs.map( examGradeDoc =>{
                let examGrade = examGradeDoc.data() as ExamGrade
                examGrades.push(examGrade)
            })
            examGrades.sort( (a,b) => a.applicationDate < b.applicationDate ? 1 : -1)
            resolve(examGrades[0])
          }
          else{
            reject(null)
          }
        },
        reason =>{
          console.error("ERROR reading examGrades:" + reason )
      })
    })
  }
}
