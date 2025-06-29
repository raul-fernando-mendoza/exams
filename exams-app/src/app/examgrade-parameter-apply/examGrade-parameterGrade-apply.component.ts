import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserPreferencesService } from '../user-preferences.service';
import { UserLoginService } from '../user-login.service';
import { db } from 'src/environments/environment';
import { ExamGrade, Materia, ParameterGrade, User } from '../exams/exams.module';
import { ParameterGradeApplyChange, ParameterGradeApplyComponent } from './parametergrade-apply.component';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';

import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';

@Component({
  selector: 'app-examgrade-parameter-apply',
  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule   
    ,MatGridListModule
    ,ParameterGradeApplyComponent 
  ],    
  templateUrl: './examGrade-parameterGrade-apply.component.html',
  styleUrls: ['./examGrade-parameterGrade-apply.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
  
})
export class ExamgradeParameterGradeApplyComponent implements OnInit{

  organization_id:string
  isAdmin:boolean
  examGrade_id:string
  examGrade = signal<ExamGrade|null>(null)
  parameterGrade_id:string
  collection:string = ""
  isDisabled = false
  submitting = false
  userDisplayName = signal<Array<User>>([])
  materia = signal<Materia>(null)
  parameterGrade = signal<ParameterGrade|null>(null)

  constructor(
    private activatedRoute: ActivatedRoute 
    ,private userPreferencesService: UserPreferencesService
    ,private userLoginService:UserLoginService
    , private router:Router
    , private examImprovisacionService: ExamenesImprovisacionService
    
    ){ 
    this.organization_id = this.userPreferencesService.getCurrentOrganizationId()
    this.isAdmin = this.userLoginService.hasRole("role-admin-" + this.organization_id)
         
    var thiz = this
    this.activatedRoute.paramMap.subscribe( {
      next(paramMap){
        thiz.examGrade.set(null)
        thiz.examGrade_id = paramMap.get('examGrade_id')
        thiz.parameterGrade_id = paramMap.get('parameterGrade_id')
        thiz.collection = "examGrades/" + thiz.examGrade_id 
        thiz.update()
      }
    })  
  }

  ngOnInit(): void {
    this.collection = "examGrades/" + this.examGrade_id    
  }
  update(){
    db.collection("examGrades").doc(this.examGrade_id).get().then( doc => {
        this.examGrade.set(doc.data() as ExamGrade)

        if( this.examGrade().students ){
          this.userDisplayName.set( this.examGrade().students )
          
        }
        else{
          this.examImprovisacionService.getUser(this.examGrade().student_uid).then( user =>{
            this.userDisplayName.set([user]) 
          },
          reason =>{
            console.log("ERROR: reading student user data:" + reason)
          })  
        } 
        
        this.examImprovisacionService.getMateria( this.examGrade().materia_id).then( materia =>{
          this.materia.set(materia)
        },
        reason =>{
          console.log("ERROR materia cannot be read:" + reason)
        })
      },
      reason=>{
        alert("ERROR reading exam parameter:" + reason.toString())
      }
    )
    
    db.collection("examGrades/" + this.examGrade_id + "/parameterGrades").doc(this.parameterGrade_id).get().then( doc => {
        this.parameterGrade.set(doc.data() as ParameterGrade) 
      }
      ,reason =>{
        alert("ERROR: reason examgrade parameter:" + this.parameterGrade_id )
      }
    )
  }
     
    
    
  

  onParameterGradeChange(e:ParameterGradeApplyChange){
    
    if( e.change && e.change.isCompleted ){
      if(this.isAdmin) {
        this.router.navigate(["grades"])
      }
      else{
        this.router.navigate(["ExamenesImprovisacion"])
      }    
    }
  }
}
