import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Chart } from 'node_modules/chart.js'
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { Exam, ExamGrade, ExamGradeMultipleRequest, ExamGradeRequest, ExamRequest } from '../exams/exams.module';
import { UserLoginService } from '../user-login.service';
//http://localhost:4200/examgrades-report;student_uid=undefined;fechaApplicacion=2022-03-20

@Component({
  selector: 'app-examgrades-report',
  templateUrl: './examgrades-report.component.html',
  styleUrls: ['./examgrades-report.component.css']
})
export class ExamgradesReportComponent implements OnInit, AfterViewInit {

  @Input() exam: ExamGrade;
  @Input() canvas_id: string;

  id = null


  constructor(

  ) {
   

   }

  ngAfterViewInit(): void {
    var e:ExamGrade = this.exam
    let labels = []
    let scores = []
    for( let i=0; i< e.parameterGrades.length; i++){
      let p = e.parameterGrades[i]
      labels[i] = p.label
      scores[i] = p.score
    }
    
    
    this.createGraph(e.student_name, labels, scores)
  }

  ngOnInit(): void {
    
  }
  

  createGraph(label, labels, data){
    var name = this.exam.id
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
  

}
