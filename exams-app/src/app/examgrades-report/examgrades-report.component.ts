import { AfterViewInit, Component, Input, OnInit, resolveForwardRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Chart } from 'node_modules/chart.js'
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { Aspect, AspectGrade, copyObj, CriteriaGrade, Exam, ExamGrade, ExamGradeMultipleRequest, ExamGradeRequest, ExamRequest, Materia, ParameterGrade, User } from '../exams/exams.module';
import { UserLoginService } from '../user-login.service';
import { db } from 'src/environments/environment';
import { NavigationService } from '../navigation.service';
import { ExamFormService } from '../exam-form.service';

//http://localhost:4200/examgrades-report;student_uid=undefined;fechaApplicacion=2022-03-20




@Component({
  selector: 'app-examgrades-report',
  templateUrl: './examgrades-report.component.html',
  styleUrls: ['./examgrades-report.component.css']
})
export class ExamgradesReportComponent implements OnInit, AfterViewInit {


  materia_id:string
  exam_id:string
  exam:Exam = null
  examGrade_id:string
  exam_label:string

  examGrade:ExamGrade



  constructor(
    private route: ActivatedRoute
    ,private examenesImprovisacionService:ExamenesImprovisacionService
    ,private navigationService:NavigationService
    ,private examFormService:ExamFormService
  ) {
    this.materia_id = this.route.snapshot.paramMap.get('materia_id')
    this.exam_id = this.route.snapshot.paramMap.get('exam_id')
    if( this.route.snapshot.paramMap.get('examGrade_id') != 'null'){
      this.examGrade_id = this.route.snapshot.paramMap.get('examGrade_id') 
    }

   }

  ngAfterViewInit(): void {

    db.collection("materias/" + this.materia_id + "/exams").doc( this.exam_id ).get().then( doc =>{
      this.exam = doc.data() as Exam      
    })

    if( this.examGrade_id){
      db.collection("examGrades").doc(this.examGrade_id).get().then( doc =>{
        const examGrade:ExamGrade = doc.data() as ExamGrade
        this.examGrade = {
          id:examGrade.id,
          exam_id:examGrade.exam_id,
          title:examGrade.title,
          student_uid:examGrade.student_uid,
          materia_id:examGrade.materia_id,
          isReleased:examGrade.isReleased,
          applicationDate:doc.data().applicationDate,
          parameterGrades:[]
        }
        
        
        
        var labels = []
        let scores = []

        db.collection("materias/" + examGrade.materia_id + "/exams").doc(this.examGrade.exam_id).get().then( doc =>{
          this.exam_label = doc.data().label
        })

        
        this.examenesImprovisacionService.getUser(this.examGrade.student_uid).then( user =>{
          this.examGrade.student = {
            uid:user.uid,
            displayName: user.claims["displayName"] ? user.claims["displayName"] : user.displayName,
          }

          db.collection("examGrades/" + this.examGrade_id + "/parameterGrades").get().then( set =>{

            set.docs.map( doc =>{
              var parameterGrade:ParameterGrade = {
                id:doc.data().id,
                label:doc.data().label,
                score:doc.data().score,
                applicationDate:doc.data().applicationDate.toDate(),
                evaluator_comment:doc.data().evaluator_comment,
                criteriaGrades:[]
              }
            
              this.examGrade.parameterGrades.push(parameterGrade)

              this.addCriteriaGrades(this.examGrade, parameterGrade)
            })

            this.examGrade.parameterGrades.sort((a,b) =>{
              return a.label > b.label ? 1: -1
            })

            for( let i=0; i< this.examGrade.parameterGrades.length; i++){
              let p = this.examGrade.parameterGrades[i]
              labels[i] = p.label
              scores[i] = p.score
            }  
            this.createGraph(this.examGrade_id, this.examGrade.student.displayName, labels, scores)        

          },
          reason =>{
            console.error("ERROR: reading parameterGrades:" + reason)
          })

        })
      })
    }  
  }

  ngOnInit(): void {
    
  }
  

  createGraph(name, label, labels, data){
    var myChart = new Chart(name, {
      type: 'bar',
      data: {
          labels: labels,
          datasets: [{
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
        
          }]
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
  
  addCriteriaGrades(examGrade:ExamGrade, parameterGrade:ParameterGrade):Promise<void>{
    var _resolve
    var _reject
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
      })
    })

  }
  addAspects(examGrade:ExamGrade, parameterGrade:ParameterGrade,criteriaGrades:CriteriaGrade):Promise<void>{
    return new Promise<void>( (resolve, reject) =>{
      db.collection("examGrades/" + examGrade.id + "/parameterGrades/" + parameterGrade.id + "/criteriaGrades/" + criteriaGrades.id + "/aspectGrades" ).get().then( snapshot =>{
        snapshot.docs.map( doc =>{
          var aspectGrade:AspectGrade = {
            id:doc.data().id,
            idx:doc.data().idx,
            label:doc.data().label,
            score:doc.data().score
          }
          criteriaGrades.aspectGrades.push(aspectGrade)
        })
      })
      criteriaGrades.aspectGrades.sort((a,b) => {return a.idx>b.idx? 1:-1})
      resolve()
    })
  }

  formatDate(d){
    return this.examenesImprovisacionService.printDate(d)
  }

  getExamCollection():string{
    return "materias/" + this.materia_id + "/exams/" + this.exam_id + "/references"
  }
}
