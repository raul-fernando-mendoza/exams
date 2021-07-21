import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Chart } from 'node_modules/chart.js'
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { Exam, ExamGrade, ExamGradeRequest, ExamRequest } from '../exams/exams.module';
import { UserLoginService } from '../user-login.service';


@Component({
  selector: 'app-examgrades-report',
  templateUrl: './examgrades-report.component.html',
  styleUrls: ['./examgrades-report.component.css']
})
export class ExamgradesReportComponent implements OnInit {

  examGrade_id = null;

  t:ExamGrade

  constructor(
    private userLoginService: UserLoginService
    , private examImprovisacionService: ExamenesImprovisacionService
    , private route: ActivatedRoute


  ) {
    this.examGrade_id = this.route.snapshot.paramMap.get('examGrade_id')    
   }

  ngOnInit(): void {
    if( this.examGrade_id ){
      var req:ExamGradeRequest = {
        examGrades:{
          id:this.examGrade_id,
          exam_label:null,
          course:null,
          completed:null,
          applicationDate:null,
          student_name:null,
          title:null,
          expression:null,
          score:null,
          parameterGrades:[{
            id:null,
            idx:null,
            label:null,
            description:null,
            score:null,
          }],
        }
      }
      
      this.userLoginService.getUserIdToken().then( token => {

        this.examImprovisacionService.firestoreApiInterface("get", token, req).subscribe(
          data => { 
            this.t = data["result"];
            let labels = []
            let scores = []
            for( let i=0; i< this.t.parameterGrades.length; i++){
              let p = this.t.parameterGrades[i]
              labels[i] = p.label
              scores[i] = p.score
            }
            this.createGraph(this.t.student_name, labels, scores)
          },     
          error => {
            alert("error loading impro type")
            console.log("Error loading ExamType:" + error.error)
          }
        )
      },
      error => {
        alert("Error in token:" + error.errorCode + " " + error.errorMessage)
      }) 
    }
  }
  createGraph(label, labels, data){
    var myChart = new Chart("myChart", {
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

}
