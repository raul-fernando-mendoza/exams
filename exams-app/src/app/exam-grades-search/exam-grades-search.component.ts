import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Exam, ExamGrade } from '../exams/exams.module';
import { UserLoginService } from '../user-login.service';
import { db } from 'src/environments/environment';
import { UserPreferencesService } from '../user-preferences.service';
import { Router } from '@angular/router';


interface MyExam {
  examGrade_id:string
  exam_name:string
  isReleased:boolean
  isRequired:boolean
}

@Component({
  selector: 'app-exam-grades-search',
  templateUrl: './exam-grades-search.component.html',
  styleUrls: ['./exam-grades-search.component.css']
})
export class ExamGradesSearchComponent implements OnInit, OnDestroy{

  @Input() materiaid:string = null
  @Input() useruid:string = null

  exams:Array<MyExam> = []
  unsubscribe = null
  organization_id:string = null

  constructor(
     private userLoginService:UserLoginService
    ,private userPreferencesService:UserPreferencesService
    ,private router: Router
  ) { 
    this.organization_id = userPreferencesService.getCurrentOrganizationId()
  }
  ngOnDestroy(): void {
    this.unsubscribe()
  }

  ngOnInit(): void {
    this.loadExamsForRow()
  }
  loadExamsForRow():Promise<void>{

    var _resolve
    var _reject

    return new Promise<void>((resolve, reject) =>{
      _resolve = resolve
      _reject = reject
      const query = db.collection("materias/" + this.materiaid + "/exams")
      .where("isDeleted","==",false)
      this.unsubscribe = query.onSnapshot( set => {
        this.exams.length=0
  
        var map = set.docs.map( doc =>{
  
          var exam:Exam = doc.data() as Exam
          var myExam:MyExam = { 
            examGrade_id:null,           
            exam_name:exam.label,
            isReleased:false,
            isRequired:exam.isRequired
          }
          this.exams.push(myExam)

          const grades = db.collection("examGrades")
          .where("organization_id", "==", this.organization_id )
          .where("student_uid","==", this.useruid)
          .where("materia_id","==", this.materiaid)
          .where("exam_id","==",exam.id)
          .where("isDeleted","==",false)
    
          return grades.get().then( snapshot => {
  
            snapshot.docs.map( doc =>{
              var examGrade:ExamGrade = {
                id:doc.data().id,
                title:doc.data().title,
                isReleased:doc.data().isReleased
              }
              myExam.examGrade_id = examGrade.id
              myExam.isReleased = examGrade.isReleased
            })
          },
          reason =>{
            this.exams.sort((a,b) =>{ return a.exam_name > b.exam_name ? 1:-1 })
            console.error("ERROR reading examGrades:" + reason )
          })
        },
        reason =>{
          console.error("ERROR: ")
        })
        Promise.all(map).then(()=>{ 
          this.exams.sort( (a,b)=>{return a.exam_name > b.exam_name ? 1 : -1})
          _resolve()
        })
      })
  
    })
  }
  onOpenExamGrade( examGrade_id ){
    this.router.navigate(['/report',{examGrade_id:examGrade_id}]);
  }

}
