import { Component, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { Exam, ExamGrade, Materia, MateriaEnrollment, ExamExamGradeItem } from '../exams/exams.module';
import { UserLoginService } from '../user-login.service';
import { UserPreferencesService } from '../user-preferences.service';
import { db , storage  } from 'src/environments/environment';
import { MatDialog  } from '@angular/material/dialog';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { Router } from '@angular/router';
import * as uuid from 'uuid';
import { DialogNameDialog } from '../name-dialog/name-dlg';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressBarModule } from '@angular/material/progress-bar';


@Component({
  selector: 'app-materia-exams-shortlist',
  standalone: true,
  imports: [
     CommonModule
    ,MatIconModule
    ,MatButtonModule       
    ,MatProgressBarModule
    ,MatListModule
    ,MatMenuModule
    ,MatGridListModule
  ],   
  templateUrl: './materia-exams-shortlist.component.html',
  styleUrls: ['./materia-exams-shortlist.component.css']
})
export class MateriaExamsShortListComponent implements OnInit, OnDestroy {
  @Input() materia:Materia = null
  @Input() materiaEnrollment:MateriaEnrollment = null
  organization_id:string
  isAdmin = false
  unsubscribe = null
  submitting = signal(false)
  exams= signal<Array<ExamExamGradeItem>>(null) 
  average = signal("")
 

  constructor(
    private userPreferenceService:UserPreferencesService
    , private userLoginService:UserLoginService
    , public dialog: MatDialog
    , private examImprovisacionService: ExamenesImprovisacionService
    , private router: Router    
  ) {
    this.organization_id = this.userPreferenceService.getCurrentOrganizationId()
    //this.isAdmin = this.userLoginService.hasRole("role-admin-" + this.organization_id)
    //this.userUid = this.userLoginService.getUserUid()
   }
  
   ngOnDestroy(): void {
    this.unsubscribe()
  }
  ngOnInit(): void {
    if( this.materia){
      this.loadExamItems()
    }
  }
  loadExamItems(){
    console.log("load exam items")
    this.submitting.set(true)
    this.unsubscribe = db.collection("materias/" + this.materia.id + "/exams")
    .where("isDeleted","==", false).onSnapshot( snapshot =>{
      console.log("process snapshot:" + snapshot.docs.length )
      this.submitting.set(false)
      let exams = new Array<ExamExamGradeItem>()
      let transactions = []
      snapshot.docs.map( doc =>{
        const exam = doc.data() as Exam
        console.log("exam:" + exam.label )
        var ei:ExamExamGradeItem={
          exam:exam,
          examGrade:null
        }
        exams.push(ei)
        let t = this.examImprovisacionService.getLastExamGrade( this.organization_id, this.materia.id, this.materiaEnrollment.student_uid, exam.id ).then( examGrade =>{
          console.log("found examgrade:" + examGrade)
          ei.examGrade = examGrade
        },
        reason =>{
          console.log("no materia exams found")
        })
        transactions.push(t)
      })
      Promise.all( transactions ).then( ()=>{
        console.log("transactions completed:" + exams.length )
        exams = exams.filter( ei => !this.hideExam( ei ))
        console.log("transactions filtered:" + exams.length )
        exams.sort( (a,b) => {
          return a.exam.label > b.exam.label ? 1:-1
        })
        let total = 0
        let count = 0
        exams.forEach( ei =>{
          if( ei.examGrade && ei.examGrade.isReleased ){
            total += ei.examGrade.score
            count +=1
          }
        })
        if( count ){
          let avg = total / count
          this.average.set( avg.toFixed(1) )
        }
        console.log("set exams" )
        this.exams.set(exams)
      })

    },
    reason =>{
      console.log("ERROR reading exam:" + reason)
    })
  }
 
  onExamGradeReport(exam:Exam, examGrade:ExamGrade){
    this.router.navigate(['/report',{materia_id:this.materia.id, exam_id:exam.id,examGrade_id:examGrade ? examGrade.id : null}]);
  }

  formatScore( score:number){
    if( score )
      return score.toFixed(1)
    else
      return "N/A"
  }

  hideExam( ei:ExamExamGradeItem ):boolean{
    if(  this.materiaEnrollment.certificateUrl ){
      if( ei.examGrade == null ){
        return true
      }
      if( ei.examGrade && ei.examGrade.isReleased == false) {
        return true
      }
    }   
    return false; 
  }
}
