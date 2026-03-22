import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnInit, resolveForwardRef, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MatInputModule } from '@angular/material/input';

import { MatDialogModule } from '@angular/material/dialog';
import { Chart } from 'node_modules/chart.js'
import { BusinessService } from '../business.service';
import { Aspect, AspectGrade, copyObj, CriteriaGrade, Exam, ExamGrade, ExamGradeMultipleRequest, ExamGradeRequest, ExamRequest, Homework, Materia, MateriaEnrollment, ParameterGrade, User } from '../exams/exams.module';
import { UserLoginService } from '../user-login.service';
import { UserPreferencesService } from '../user-preferences.service';
import { db } from 'src/environments/environment';
import { NavigationService } from '../navigation.service';
import { FormService } from '../form.service';
import { DateFormatService } from '../date-format.service';
import {MatGridListModule} from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import {MatExpansionModule} from '@angular/material/expansion';
import { ReferenceComponent } from '../reference-list/reference-list';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


//http://localhost:4200/examgrades-report;student_uid=undefined;fechaApplicacion=2022-03-20




@Component({
  selector: 'app-examgrades-report',
  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule   
   
    ,FormsModule
    ,ReactiveFormsModule
    ,MatFormFieldModule
    ,MatInputModule 

    ,MatDialogModule  
    ,MatCardModule
    ,MatGridListModule
    ,MatExpansionModule
    ,MatTableModule
    ,MatProgressSpinnerModule
    ,RouterModule
  ],   
  templateUrl: './examgrades-report.component.html',
  styleUrls: ['./examgrades-report.component.css']
})
export class ExamgradesReportComponent implements OnInit, AfterViewInit {

  @ViewChild('target') canvas: ElementRef<HTMLCanvasElement>;

  materia_id:string
  exam_id:string
  user_uid:string
  exam = signal<Exam>(null) 
  examGrade_id:string
  //exam_label:string

  examGrade=signal<ExamGrade>(null)
  homeworkScores = signal<Array<{homework: Homework, score: number | null}>>([])


  constructor(
    private route: ActivatedRoute
    ,private businessService:BusinessService
    ,private navigationService:NavigationService
    ,private dateFormatService:DateFormatService
    ,private changeDetectorRef: ChangeDetectorRef
    ,private userLoginService:UserLoginService
    ,private userPreferencesService:UserPreferencesService
  ) {
    this.materia_id = this.route.snapshot.paramMap.get('materia_id')
    this.exam_id = this.route.snapshot.paramMap.get('exam_id')
    if( this.route.snapshot.paramMap.get('examGrade_id') != 'null'){
      this.examGrade_id = this.route.snapshot.paramMap.get('examGrade_id')
    }
    this.user_uid = this.route.snapshot.paramMap.get('user_uid')

   }

  ngAfterViewInit(): void {

    const organization_id = this.userPreferencesService.getCurrentOrganizationId()
    const isAdmin = this.userLoginService.hasRole("role-admin-" + organization_id)
    const userId = isAdmin ? this.user_uid : this.userLoginService.getUserUid()
    const homeworksPromise = this.loadHomeworkScores(userId)

    this.getExam(this.exam_id).then( exam =>{
      this.exam.set( exam )
    })
    this.getExamGrade( this.examGrade_id ).then( examGrade =>{
      this.examGrade.set( examGrade )
      this.changeDetectorRef.detectChanges()
      var labels = []
      let scores = []
      for( let i=0; i< this.examGrade().parameterGrades.length; i++){
        let p = this.examGrade().parameterGrades[i]
        labels[i] = p.label
        scores[i] = p.score
      }

      let students = new Array<User>()
      let transactions = []
      examGrade.studentUids.forEach( user_id =>{
        let t = this.businessService.getUser(user_id).then( user =>{
          students.push( user )
        })
        transactions.push(t)
      })
      transactions.push(homeworksPromise)
      Promise.all(transactions).then( ()=>{
        let studentNames:Array<string> = []
        for( let i=0 ; i<students.length ; i++){
          studentNames.push( students[i].displayName?students[i].displayName:students[i].email)
        }

        this.createGraph(this.examGrade_id, studentNames, labels, scores)
      })
    })
  }

  getExam(exam_id:string):Promise<Exam>{
    return new Promise<Exam>( (resolve, reject) =>{
      db.collection("materias/" + this.materia_id + "/exams").doc( this.exam_id ).get().then( doc =>{
        let exam = doc.data() as Exam      
        resolve( exam )
      })  
    })
  }



  ngOnInit(): void {
    
  }
  

  createGraph(name, label, labels, data){
    var myChart = new Chart(this.canvas.nativeElement, {
      type: 'bar',
      data: {
          labels: labels,
          datasets: [
            {
              label: label,
              data: data,
              backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
              ],
              borderColor: [
                  'rgba(255, 99, 132, 1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)',
                  'rgba(255, 159, 64, 1)'
              ],
              borderWidth: 1
            }
          ]
      },
      options: {
        scales: {
            yAxes: [{
                display: true,
                ticks: {
                    beginAtZero: true,
                    max: 10
                }
            }]
        }
      }
    });

  }

  onBack(){
    this.navigationService.back()
  }

  getExamGrade(examGrade_id):Promise<ExamGrade>{
    return new Promise<ExamGrade>( (resolve,reject)=>{
      db.collection("examGrades").doc(examGrade_id).get().then( doc =>{
        const data:ExamGrade = doc.data() 
        let examGrade:ExamGrade = {
          id:data.id,
          exam_id:data.exam_id,
          title:data.title,
          student_uid:data.student_uid,
          studentUids:data.studentUids,
          materia_id:data.materia_id,
          isReleased:data.isReleased,
          applicationDate:data.applicationDate,
          score :data.score,
          parameterGrades:[]
        }
        
        let transactions = []

        let p = db.collection("examGrades/" + this.examGrade_id + "/parameterGrades")
          .where("isCurrentVersion", "==", true).get().then( set =>{
            let c = set.docs.map( doc =>{
              var parameterGrade:ParameterGrade = doc.data() as ParameterGrade
            
              parameterGrade.criteriaGrades=[]
              
            
              examGrade.parameterGrades.push(parameterGrade)

              let c = this.addCriteriaGrades(examGrade, parameterGrade)
              transactions.push(c)
              
            })
            
        })
        transactions.push(p)
        
        Promise.all(transactions).then( () =>{
          examGrade.parameterGrades.sort((a,b) =>{
            return a.label > b.label ? 1: -1
          })

          resolve( examGrade )

        },
        reason=>{
          alert(reason)
          reject(reason)
        })
      })
    }) 
  }  
  
  addCriteriaGrades(examGrade:ExamGrade, parameterGrade:ParameterGrade):Promise<void>{
    return new Promise<void>((resolve,reject) =>{
      db.collection("examGrades/" + examGrade.id + "/parameterGrades/" + parameterGrade.id + "/criteriaGrades" ).get().then( snapshot =>{
        
        
        var map:Promise<void>[] = snapshot.docs.map( doc => {
          var criteriaGrade:CriteriaGrade = {
            id:doc.data().id,
            idx:doc.data().idx,
            label:doc.data().label,
            score:doc.data().score,
            aspectGrades: []
          }
          parameterGrade.criteriaGrades.push(criteriaGrade)

          return this.addAspects(examGrade, parameterGrade, criteriaGrade)
        })
        Promise.all(map).then( () => {
          parameterGrade.criteriaGrades.sort( (a,b) => {return a.idx > b.idx ? 1 : -1})
          resolve()
        })
      },
      reason =>{
        console.error("Error")
        reject(reason)
      })
    })

  }
  addAspects(examGrade:ExamGrade, parameterGrade:ParameterGrade,criteriaGrades:CriteriaGrade):Promise<void>{
    return new Promise<void>( (resolve, reject) =>{
      db.collection("examGrades/" + examGrade.id + "/parameterGrades/" + parameterGrade.id + "/criteriaGrades/" + criteriaGrades.id + "/aspectGrades" ).get().then( snapshot =>{
        snapshot.docs.map( doc =>{
          var aspectGrade:AspectGrade = doc.data() as AspectGrade
          criteriaGrades.aspectGrades.push(aspectGrade)
        })
      })
      criteriaGrades.aspectGrades.sort((a,b) => {return a.idx>b.idx? 1:-1})
      resolve()
    })
  }

  get totalScore(): number {
    return this.examGrade().score * 0.9 + this.homeworkAvg * 0.1
  }

  get homeworkAvg(): number {
    const items = this.homeworkScores()
    if (items.length === 0) return 0
    const total = items.reduce((sum, h) => sum + (h.score ?? 0), 0)
    return total / items.length
  }

  formatDate(d:any){
    return this.dateFormatService.formatDate(d.toDate())
  }
  formatDecimal(value){
    return value.toFixed(1)
  }

  async loadHomeworkScores(userId: string): Promise<void> {
    const enrollmentSet = await db.collection("materiaEnrollments")
      .where("student_uid", "==", userId)
      .where("materia_id", "==", this.materia_id)
      .where("isDeleted", "==", false)
      .get()
    if (enrollmentSet.empty) return
    const enrollment = enrollmentSet.docs[0].data() as MateriaEnrollment

    const homeworkSet = await db.collection("materias/" + this.materia_id + "/exams/" + this.exam_id + "/homeworks").get()
    const items: Array<{homework: Homework, score: number | null}> = []
    const loads = homeworkSet.docs.map(async doc => {
      const homework = doc.data() as Homework
      const item = { homework, score: null as number | null }
      items.push(item)
      const scoreDoc = await db.collection("materiaEnrollments").doc(enrollment.id)
        .collection("homeworkScores").doc(homework.id).get()
      if (scoreDoc.exists) {
        item.score = scoreDoc.data().homework_score
      }
    })
    await Promise.all(loads)
    items.sort((a, b) => a.homework.idx > b.homework.idx ? 1 : -1)
    this.homeworkScores.set(items)
  }

  getExamCollection():string{
    return "materias/" + this.materia_id + "/exams/" + this.exam_id + "/references"
  }
}
