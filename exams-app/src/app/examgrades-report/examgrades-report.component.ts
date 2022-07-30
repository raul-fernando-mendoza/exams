import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Chart } from 'node_modules/chart.js'
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { copyObj, Exam, ExamGrade, ExamGradeMultipleRequest, ExamGradeRequest, ExamRequest, ParameterGrade } from '../exams/exams.module';
import { UserLoginService } from '../user-login.service';
import { db } from 'src/environments/environment';
import { NavigationService } from '../navigation.service';

//http://localhost:4200/examgrades-report;student_uid=undefined;fechaApplicacion=2022-03-20

@Component({
  selector: 'app-examgrades-report',
  templateUrl: './examgrades-report.component.html',
  styleUrls: ['./examgrades-report.component.css']
})
export class ExamgradesReportComponent implements OnInit, AfterViewInit {




  examGrade_id:string
  exam_label:string

  constructor(
    private route: ActivatedRoute
    ,private examenesImprovisacionService:ExamenesImprovisacionService
    ,private navigationService:NavigationService
  ) {
    this.examGrade_id = this.route.snapshot.paramMap.get('examGrade_id') 

   }

  ngAfterViewInit(): void {
    db.collection("examGrades").doc(this.examGrade_id).get().then( doc =>{
      var e = copyObj(new ExamGrade() , doc.data())
      e["parameterGrades"] = []
      var labels = []
      let scores = []

      db.collection("exams").doc(e["exam_id"]).get().then( doc =>{
        this.exam_label = doc.data().label
      })

      
      this.examenesImprovisacionService.getUser(e["student_uid"]).then( user =>{
        e["student_name"] = user.claims["displayName"] ? user.claims["displayName"] : user.displayName

        db.collection("examGrades/" + this.examGrade_id + "/parameterGrades").get().then( set =>{

          set.docs.map( doc =>{
            var parameterGrade:ParameterGrade = new ParameterGrade()
            copyObj(parameterGrade, doc.data())
            e["parameterGrades"].push(parameterGrade)
          })

          for( let i=0; i< e["parameterGrades"].length; i++){
            let p = e["parameterGrades"][i]
            labels[i] = p.label
            scores[i] = p.score
          }  
          this.createGraph(this.examGrade_id, e["student_name"], labels, scores)        

        },
        reason =>{
          console.error("ERROR: reading parameterGrades:" + reason)
        })

      })
      

      
    })

    
    
    //this.createGraph(e.student_name, labels, scores)
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
  

}
