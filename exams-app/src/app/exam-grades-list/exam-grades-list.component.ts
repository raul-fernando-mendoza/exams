import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Exam, ExamGrade } from '../exams/exams.module';
import { UserLoginService } from '../user-login.service';
import { db } from 'src/environments/environment';
import { UserPreferencesService } from '../user-preferences.service';
import { Router } from '@angular/router';

interface ExamsList{
  exam:Exam,
  examGrade:ExamGrade
}

@Component({
  selector: 'app-exam-grades-list',
  templateUrl: './exam-grades-list.component.html',
  styleUrls: ['./exam-grades-list.component.css']
})
export class ExamGradesListComponent implements OnInit {
  @Input() materiaid:string = null
  @Input() useruid:string = null
  @Input() organizationid:string = null

  examsList:Array<ExamsList> = []

  unsubscribe

  constructor(
     private userLoginService:UserLoginService
    ,private userPreferencesService:UserPreferencesService
    ,private router: Router    
  ) { }

  ngOnInit(): void {
    this.loadExamList()
  }
  ngOnDestroy(): void {
    this.unsubscribe()
  }  

  loadExamList():Promise<void>{

    var _resolve
    var _reject

    return new Promise<void>((resolve, reject) =>{
      _resolve = resolve
      _reject = reject
      const query = db.collection("materias/" + this.materiaid + "/exams")
      .where("isDeleted","==",false)
      this.unsubscribe = query.onSnapshot( set => {
        this.examsList.length=0
  
        var map = set.docs.map( doc =>{
  
          var exam:Exam = doc.data() as Exam
          var examListItem:ExamsList = { 
            exam:exam,           
            examGrade:null
          }
          this.examsList.push(examListItem)

          const grades = db.collection("examGrades")
          .where("organization_id", "==", this.organizationid )
          .where("student_uid","==", this.useruid)
          .where("materia_id","==", this.materiaid)
          .where("exam_id","==",exam.id)
          .where("isDeleted","==",false)
    
          grades.get().then( snapshot => {
  
            snapshot.docs.map( doc =>{
              var examGrade:ExamGrade = doc.data()
              examListItem.examGrade = examGrade
            })
          },
          reason =>{
            
            console.error("ERROR reading examGrades:" + reason )
          })
        })
        this.examsList.sort( (a,b)=>{return a.exam.label > b.exam.label ? 1 : -1} )

      })
  
    })
  }

  getExamGradeStatus(examGrade:ExamGrade){
    let status = ""
    if( examGrade == null){
      status = "no iniciado"
    }
    else if( examGrade.isReleased){
      status = "Liberado"
    }
    else if( examGrade.isCompleted){
      status = "Completado"
    }
    return status
  }


}
