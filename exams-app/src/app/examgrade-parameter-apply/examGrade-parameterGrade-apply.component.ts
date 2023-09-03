import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserPreferencesService } from '../user-preferences.service';
import { UserLoginService } from '../user-login.service';
import { db } from 'src/environments/environment';
import { ExamGrade, ParameterGrade } from '../exams/exams.module';
import { ParameterGradeApplyChange } from './parametergrade-apply.component';
import { UntypedFormGroup } from '@angular/forms';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';

@Component({
  selector: 'app-examgrade-parameter-apply',
  templateUrl: './examGrade-parameterGrade-apply.component.html',
  styleUrls: ['./examGrade-parameterGrade-apply.component.css']
})
export class ExamgradeParameterGradeApplyComponent implements OnInit, OnDestroy{

  organization_id:string
  isAdmin:boolean
  examGrade_id:string
  examGrade:ExamGrade
  parameterGrade_id:string
  collection:string = ""
  unsubscribe
  isDisabled = false
  submitting = false
  userDisplayName = ""

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
        thiz.examGrade = null
        thiz.examGrade_id = paramMap.get('examGrade_id')
        thiz.parameterGrade_id = paramMap.get('parameterGrade_id')
        this.collection = "examGrades/" + thiz.examGrade_id 
        thiz.update()
      }
    })  
  }

  ngOnDestroy(): void {
    if(this.unsubscribe){
      this.unsubscribe()
    }
  }

  ngOnInit(): void {
    this.collection = "examGrades/" + this.examGrade_id    
  }
  update(){
    
    db.collection("examGrades").doc(this.examGrade_id).get().then( doc => {
      this.examGrade = doc.data() as ExamGrade

      
      this.examImprovisacionService.getUser(this.examGrade.student_uid).then( user =>{
        this.userDisplayName = this.userLoginService.getDisplayNameForUser(user)
        
      })      
    },
    reason=>{
      alert("ERROR reading exam parameter:" + reason.toString())
    })      
  }

  onParameterGradeChange(e:ParameterGradeApplyChange){
    
    if( e.change.isCompleted ){
      if(this.isAdmin) {
        this.router.navigate(["grades"])
      }
      else{
        this.router.navigate(["ExamenesImprovisacion"])
      }    
    }
  }
}
