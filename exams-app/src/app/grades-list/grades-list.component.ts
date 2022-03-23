import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { ExamGrade, ExamGradeMultipleRequest } from '../exams/exams.module';
import { UserLoginService } from '../user-login.service';

@Component({
  selector: 'app-grades-list',
  templateUrl: './grades-list.component.html',
  styleUrls: ['./grades-list.component.css']
})
export class GradesListComponent implements OnInit {
  
  applicationDate = null
  student_email:string = null
  t:ExamGrade
  exams:ExamGrade[] = null
  
  constructor(private userLoginService: UserLoginService
    , private examImprovisacionService: ExamenesImprovisacionService
    , private route: ActivatedRoute) {
      this.student_email = this.route.snapshot.paramMap.get('student_email')   
      this.applicationDate = this.route.snapshot.paramMap.get('applicationDate')
  
     }

  ngOnInit(): void {
    this.readData()
  }
  readData(){
    
    if( this.student_email &&  this.applicationDate){
      
      
      
      var req:ExamGradeMultipleRequest = {
        examGrades:[{
          id:null,
          student_email:this.student_email,
          applicationDate:this.applicationDate,
          exam_label:null,
          course:null,
          completed:null,
          student_name:null,
          title:null,
          expression:null,
          score:null,
          certificate_url:null,
          released:true,
          parameterGrades:[{
            id:null,
            idx:null,
            label:null,
            description:null,
            score:null,
            evaluator_comment:null,
            criteriaGrades:[{
              id:null,
              label:null,
              aspectGrades:[{
                id:null,
                label:null,
                score:null
              }]
            }]
          }]
        }]
      }
      
      
     // this.userLoginService.getUserIdToken().then( token => {
        
       
        this.examImprovisacionService.firestoreApiInterface("get", "token", req).subscribe(
          data => { 
            this.exams = data["result"].sort( (a, b) => {
              var ae:ExamGrade = a as ExamGrade 
              var be:ExamGrade = b as ExamGrade
              return  ae.title > be.title 
            })      
          },     
          error => {
            alert("error loading impro type")
            console.log("Error loading ExamType:" + error.error)
          }
        )
     /*  
      },
      error => {
        alert("Error in token:" + error.errorCode + " " + error.errorMessage)
      }) 
  */    
  
    }
  }
  scoreFormat( score ){
    return Number( score * 10 ).toFixed(2)
  }
}
