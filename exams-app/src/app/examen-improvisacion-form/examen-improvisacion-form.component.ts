import { Component, signal } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormArray, Validators, FormGroup, FormArray, FormControl, AbstractControl, ValidationErrors } from '@angular/forms';
import { BusinessService} from '../business.service'
import { ActivatedRoute, Router } from '@angular/router';
import { UserLoginService } from '../user-login.service';
import { Aspect, copyFromForm, Criteria, Exam, ExamGrade, Materia, Parameter, ParameterGrade, User, CriteriaGrade, AspectGrade } from '../exams/exams.module';
import { FormService } from '../form.service';
import { db } from 'src/environments/environment';
import * as uuid from 'uuid';
import { PromiseType } from 'protractor/built/plugins';
import { ReplaySubject } from 'rxjs';
import { UserPreferencesService } from '../user-preferences.service';
import { DateFormatService } from '../date-format.service';
import { NavigationService } from '../navigation.service';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MatInputModule } from '@angular/material/input';
import {MatCardModule} from '@angular/material/card';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { UserSelectorComponent } from '../user-selector/user-selector.component';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

function AllChildValid(control: AbstractControl): ValidationErrors | null {
  var formArray = control as FormArray
  var result = {}
  formArray.controls.forEach( c =>{
    var fg = c as FormGroup
    if( fg.valid == false ){
      result = { "child":"error" }
    }
  })
  return  result;
};



@Component({
  selector: 'app-examen-improvisacion-form',
  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule   
   
    ,FormsModule
    ,ReactiveFormsModule
    ,MatFormFieldModule
    ,MatInputModule
    ,MatCardModule 
    ,MatDatepickerModule
    ,UserSelectorComponent
    ,MatSelectModule 
    ,MatCheckboxModule
  ],    
  templateUrl: './examen-improvisacion-form.component.html',
  styleUrls: ['./examen-improvisacion-form.component.css']
})
export class ExamenImprovisacionFormComponent {


  submitting = false

  parameter_label 
  today = new Date().toISOString().slice(0, 10)

  criteria_label 


  allUsers = signal<User[]>([]) 
  selectedStudents = signal<User[]>([]) 
  evaluators:User[] 

  materias = signal<Array<Materia>>([])
  exams = signal<Array<Exam>>([])

  organization_id = null

  
  examGradeFG = this.fb.group({
    id:[uuid.v4()],
    
    materia_id:[null,Validators.required],
    exam_id: [null, Validators.required],
    applicationDate: [null, Validators.required],

    title:[null, Validators.required], 
    expression:[null], 
    level:[null],
    parameterGradesFA: this.fb.array([],AllChildValid)
  });

  fg = this.fb.group({
    student_uid:[null]
  })


  constructor(private fb: UntypedFormBuilder,private route: ActivatedRoute
    , private router: Router
    , private businessService: BusinessService
    , private formBuilder: UntypedFormBuilder
    , private userLoginService:UserLoginService
    , private examFormService:FormService
    , private userPreferencesService:UserPreferencesService
    , private dateFormatService:DateFormatService 
    , private navigationService:NavigationService 
  ) {
    
      this.organization_id = userPreferencesService.getCurrentOrganizationId()
  }

  

  getFormGroupArray (fg:UntypedFormGroup, controlname:string): UntypedFormGroup[] {
    if( fg == null){
      console.error("fg is null for:" + controlname)
    }
    var fa:UntypedFormArray =  fg.controls[controlname] as UntypedFormArray
    if( fa == null){
      console.error("fa is null for::" + controlname)
    }
    return fa.controls as UntypedFormGroup[]
  }
  

  formArray= new FormArray([], [Validators.required]);
  ngOnInit() {

    
    console.log(this.formArray.status);
    this.formArray.push(new FormControl());
    console.log(this.formArray.status);

    console.log(this.examGradeFG.controls.parameterGradesFA.status)


    this.userLoginService.getUserIdToken().then( token => {
      this.initialize(token)
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })
  }

  initialize(token){
    let thiz = this

    this.businessService.authApiInterface("getUserList", token, {}).subscribe({
      next(data){
        let set = data["result"] as Array<any>;
        let studentsOnly:Array<User> = []
        
        for( let i =0; i<set.length; i++){
          let estudiante = set[i]
          let displayName = this.userLoginService.getDisplayNameForUser(estudiante)
          let obj:User = {
            "uid":estudiante.uid,
            "email":estudiante.email,
            "displayName":displayName,
            "claims":estudiante.claims
          }
          studentsOnly.push(obj)
        }
        thiz.allUsers.set(studentsOnly)
      },
      error(reason){
         alert( "Error retriving estudiante exam improvisation" + reason.errorMessage )
      },
      complete(){
        console.log("never called")
      }
    })
    
    
    var evaluator_req = {
      "claims":"role-evaluador-" + this.organization_id
    }  
    
    

    this.businessService.authApiInterface("getUserListForClaim", token, evaluator_req).subscribe({
      next( data ){
        let users:User[] = data["result"] as Array<any>;
        this.evaluators = []
        for( let i =0; i<users.length; i++){
          var user = users[i]
          let obj:User = {
            "uid":user.uid,
            "email":user.email,
            "displayName":(user.displayName != null && user.displayName.trim() != "")? user.displayName : user.email,
            "claims":user.claims
          }
          console.log("user:" + obj.uid + " " + obj.displayName)
          thiz.evaluators.push(obj)            
        }
      },
      error(reason){
          alert( "Error retriving evaluador" + reason.errorMessage )
      }
    })     
  }  
  
  onAddStudent() {

    let studentId = this.fg.controls.student_uid.value

    let selectedStudent = this.allUsers().find( e => e.uid == studentId)
    

    
    if( selectedStudent ){
      let currentSelectedStudents = this.selectedStudents()
      let alreadySelectedCustomer = currentSelectedStudents.find( e => e.uid == studentId)
      if( !alreadySelectedCustomer ){
        let selectedStudentItem:User = {
          uid: studentId,
          displayName: selectedStudent.displayName
        }
        
        let newSelectedStudents = [...currentSelectedStudents, selectedStudentItem]
        this.selectedStudents.set( newSelectedStudents )
        this.fg.controls.student_uid.setValue("")
        this.loadMateriaEnrollment()
      }
    }
    
  }   

  onRemoveStudent( user:User ){
    let currentStudents = this.selectedStudents()
    let idx = currentStudents.findIndex( e => e.uid == user.uid)
    if( idx >= 0 ){
      currentStudents.splice(idx,1)
      this.selectedStudents.set([...currentStudents])
      this.loadMateriaEnrollment()
    }
  }
  loadMateriaEnrollment(){
    let all_arrays:Array<Array<Materia>> = []
    this.materias.set( [] )
   
    let selectedStudentsArray:Array<User> = this.selectedStudents()
    let transactions = selectedStudentsArray.map( e =>{
      return this.businessService.getMateriasEnrolled( this.organization_id, e.uid ).then( materias =>{
        all_arrays.push(materias)
      })
    })
    Promise.all( transactions ).then( ()=>{
      let common_array:Array<Materia> = undefined
      for( let a=0; a<all_arrays.length; a++){
        let curr:Array<Materia> = all_arrays[a] 
        if( !common_array ){
          common_array = [...curr]
        }
        else{
          let new_array:Array<Materia> = []
          for(let i=0; i<curr.length; i++ ){
            let m = curr[i]
            if( common_array.find(e => e.id == m.id) ){
              new_array.push(m)
            }
          }
          common_array = [...new_array]
        }
        this.materias.set( common_array )
      }
    })

  }

  loadExams(materiaId){
    this.exams.set([])
    this.businessService.getExams(materiaId).then( exams =>{
        this.exams.set( exams )
      },
      reason =>{
        console.log("ERROR reading exams:" + reason)
    })  
  }


  getExamTypes(){
    return this.exams;
  }

  //retrive the list of parameters for the selected materia-exam and create a subform for each of them*/
  examChange(event) {
    var examId = event.value

    var materiaId = this.examGradeFG.controls.materia_id.value
    var parameterGradesFA:FormArray= this.examGradeFG.controls.parameterGradesFA as FormArray
    this.businessService.getParameters(materiaId, examId).then( parameters =>{
      parameterGradesFA.clear()     
      parameters.forEach( parameter =>{
        let parameterFG = this.examGradeFG.controls.parameterGradesFA as FormArray
        this.addParameter(  this.examGradeFG.controls.materia_id.value , examId, parameter, parameterFG)
      })
    })    
  }

  addParameter(materiaId, examId, p:Parameter, parameterGradeFA:FormArray){

    var g=this.fb.group({
      id: [uuid.v4()],
      organization_id: [this.organization_id],
      idx: [p.idx],
      label: [p.label],
      description: [p.description],
      scoreType: [p.scoreType],
      score: [1],
      evaluator_uid:[null, Validators.required],
      isSelected:[true],
      criteriaGradeFA: this.fb.array([])         
    })

    g.valueChanges.subscribe(parameter => {
      if(parameter) {
        if( parameter.isSelected == true){
          g.controls.evaluator_uid.setValidators([Validators.required]);
          parameterGradeFA.updateValueAndValidity();
        }
        else{
          g.controls.evaluator_uid.clearValidators();
          parameterGradeFA.updateValueAndValidity();
        }
      }
    });   
    parameterGradeFA.controls.push(g)    

    //g.controls["evaluator_uid"].setErrors({ 'incorrect': true});
    parameterGradeFA.updateValueAndValidity();



    
    //now get the criterias and add them too
    var criteriaGradeFA = g.controls.criteriaGradeFA as FormArray
    this.businessService.getCriteria(materiaId, examId, p.id).then( criterias =>{
      criterias.forEach( criteria =>{
        this.addCriteria( materiaId, examId, p.id, criteria, criteriaGradeFA )
      })
    })
  }

  validateAllFormFields(formGroup: FormGroup | FormArray):boolean{
    var result:boolean = true
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
        if( control.invalid ) result = false
      } else if (control instanceof FormGroup || control instanceof FormArray) {
        if (this.validateAllFormFields(control) ) {
          result = false
        };
      }
    });
    return result
  }  

  addCriteria(materiaId, examId, parameterId, criteria:Criteria, criteriaGradeFG:FormArray){
    var g = this.fb.group({
      id:[uuid.v4()],
      idx:[criteria.idx],
      label:[criteria.label],
      description:[criteria.description],
      score:[1],
      isSelected:[ criteria.initiallySelected ],
      aspectGradesFA: new FormArray([])
    })
    criteriaGradeFG.controls.push(g)

    var aspectGradesFA = g.controls.aspectGradesFA as FormArray

    this.businessService.getAspect( materiaId,examId,parameterId, criteria.id).then( aspects =>{
      aspects.forEach( a => {
        
        this.addAspect( a, aspectGradesFA)
      })
      
    })
 
  }

  addAspect( a: Aspect, aspectFA:FormArray ){
    var g = this.fb.group({
      id:[uuid.v4()],
      idx:[a.idx],
      label:[a.label],
      description:[a.description],
      isGraded:[false],
      score:[1],
      hasMedal:[false]
    })
    aspectFA.controls.push(g)
  }  

  getExamStudents(){
    return this.selectedStudents;    
  }  

   getExamEvaluators(){
    return this.evaluators
  }
  getAnyClass(obj) {
    if (typeof obj === "undefined") return "undefined";
    if (obj === null) return "null";
    return obj.constructor.name;
  }   
  getformValue(){
    //return JSON.stringify(this.examGrade.value)
    return this.examGradeFG.invalid
  }  

  tojson(value){
    return JSON.stringify(value)
  }

  replacerRemoveUnselectedParameters(key, value:[]) {
    // Filtrando propiedades 
    if (key === "parameterGrades") {
      let parametersGrade_array = []
      for(let i=0; i<value.length; i++){
        if( value[i]["isSelected"] == true){
          parametersGrade_array.push(value[i])
        }
      }
      return parametersGrade_array;
    }
    return value;
  }  

  replacerRemoveUnselectedCriterias(key, value:[]) {
    // Filtrando propiedades 
    if (key === "criteriaGrades") {
      let criteriaGrade_array = []
      for(let i=0; i<value.length; i++){
        if( value[i]["isSelected"] == true){
          criteriaGrade_array.push(value[i])
        }
      }
      return criteriaGrade_array;
    }
    return value;
  } 

  onSubmit() {
    this.submitting = true
    let studentUids:Array<string> = []
    this.selectedStudents().map( e =>{
      studentUids.push( e.uid )
    })
    let applicationDate = this.examGradeFG.controls.applicationDate.value
    let examGrade:ExamGrade = {
      id:uuid.v4(), 
      organization_id:this.organization_id,
      exam_id:this.examGradeFG.controls.exam_id.value,
      materia_id:this.examGradeFG.controls.materia_id.value, 
      isCompleted: false, 
      applicationDate: applicationDate,
      applicationDay: this.dateFormatService.getDayId(applicationDate),
      applicationMonth:this.dateFormatService.getMonthId(applicationDate),
      applicationYear: this.dateFormatService.getYearId(applicationDate),    
      student_uid:"", 
      studentUids:studentUids,
      title:this.examGradeFG.controls.title.value,
      expression:this.examGradeFG.controls.expression.value,
      level:this.examGradeFG.controls.level.value,
      score:1, 
      isDeleted:false, 
      isReleased:false, 
      isApproved:false ,
      evaluators:[],
      created_on:new Date(),
      updated_on:new Date()      
    }
    this.submitting = true

    const parametersFA = this.examGradeFG.controls.parameterGradesFA as FormArray
   
    for( let i=0; i<parametersFA.controls.length; i++){
      const parameterFG = parametersFA.controls[i] as FormGroup
      if( parameterFG.controls["isSelected"].value ){
        const evaluator_uid = parameterFG.controls["evaluator_uid"].value
        examGrade.evaluators.push( evaluator_uid )
      }
    }
    
    db.collection("examGrades").doc(examGrade["id"]).set(examGrade).then(()=>{

      console.log("adding parameters")
      
      let parameterGradesFA = this.examGradeFG.controls.parameterGradesFA as FormArray
      let pa = parameterGradesFA.controls.map(p =>{
        let parameterFG = p as FormGroup
        if( parameterFG.controls.isSelected.value == true)
          return this.saveParameterGrade(examGrade, parameterFG)
      })
      Promise.all(pa).then( () =>{
        console.log("End Saving All")
        alert("Examen Creado!")
        this.submitting = false
        this.navigationService.back()

      }) 
      .catch(reason =>{
        console.error("Error waiting for parameters:" + reason)
        this.submitting = false
      })  

    },
    reason => {
      console.error("ERROR creating examGrade:" + reason)
    })           

  } 

  
  saveParameterGrade(examGrade:ExamGrade, pFG:FormGroup):Promise<void>{

    let applicationDate = this.examGradeFG.controls.applicationDate.value

    let parameterGrade:ParameterGrade = {
      id:uuid.v4(), 
      organization_id:this.organization_id,  
      idx: pFG.controls.idx.value, 
      label: pFG.controls.label.value,
      description:pFG.controls.description.value, 
      scoreType:pFG.controls.scoreType.value, 
      score:pFG.controls.score.value, 
      evaluator_uid:pFG.controls.evaluator_uid.value, 
      applicationDate:applicationDate,
      applicationDay:this.dateFormatService.getDayId( applicationDate ),
      applicationMonth:this.dateFormatService.getMonthId( applicationDate ),
      applicationYear:this.dateFormatService.getYearId( applicationDate ),
    
      isCompleted:false, 
      evaluator_comment:null,
      isCurrentVersion:true,
      version:0
    }

    var parameter_resolve = null
    return new Promise<void>((resolve, reject) =>{
      parameter_resolve = resolve
      db.collection(`examGrades/${examGrade.id}/parameterGrades`).doc(parameterGrade["id"]).set(parameterGrade).then(()=>{
    
        console.log("adding parameterGrade" + parameterGrade.label)
        let criteriaGradesFA = pFG.controls.criteriaGradeFA as FormArray
        
        let cm = criteriaGradesFA.controls.map( c => {
          let criteriaFG = c as FormGroup 
          if( criteriaFG.controls.isSelected.value == true){
            return this.saveCriteriaGrades(examGrade, parameterGrade, criteriaFG )             
          }
        })
        Promise.all(cm).then( () =>{
          resolve()
        })
        .catch(reason =>{
          console.error("Error waiting for criteria:" + reason)
        })        
      },
      reason => {
        console.error("ERROR:parameterGrade not created " + reason )
        reject()
      }) 
    })
  }

  saveCriteriaGrades(examGrade:ExamGrade, parameterGrade:ParameterGrade, criteriaGradeFG:FormGroup):Promise<void>{

    //calculate the     
    let aspectGradesFA = criteriaGradeFG.controls.aspectGradesFA as FormArray
    let criteriaGradeCount = aspectGradesFA.length

    let criteriaGrade:CriteriaGrade = {
      id:uuid.v4(),
      idx:criteriaGradeFG.controls.idx.value,
      label:criteriaGradeFG.controls.label.value,
      description:criteriaGradeFG.controls.description.value,
      score:10,
      isSelected:true,
      earnedPoints:criteriaGradeCount,
      availablePoints:criteriaGradeCount    
    }
    return new Promise<void>((resolve, reject) =>{
      db.collection(`examGrades/${examGrade.id}/parameterGrades/${parameterGrade.id}/criteriaGrades`).doc(criteriaGrade["id"]).set(criteriaGrade).then(()=>{
        console.log("adding CriteriaGrade" + criteriaGrade.label)
        let aspectGradesFA = criteriaGradeFG.controls.aspectGradesFA as FormArray
        let am = aspectGradesFA.controls.map( a =>{
          let aspectFG = a as FormGroup
          return this.saveAspectGrades(examGrade, parameterGrade, criteriaGrade, aspectFG )        
        })
        Promise.all(am).then( () =>{
          //console.log(value)
          resolve()
        })
        .catch( reason =>{
          console.log(reason)
        }) 
      },
      reason => {
        alert("ERROR:criteriaGrade not created " + reason )
        reject()
      })       
    })         
  }

  saveAspectGrades(examGrade:ExamGrade, parameterGrade:ParameterGrade, criteriaGrade:CriteriaGrade, aspectGradeFG:FormGroup):Promise<void>{
    let aspectoGrade:AspectGrade = {
      id:uuid.v4(),
      idx:aspectGradeFG.controls.idx.value,
      label:aspectGradeFG.controls.label.value,
      description:aspectGradeFG.controls.description.value,
      isGraded:false,
      score:1,
      hasMedal:false
    }
    return new Promise<void>((resolve, reject) =>{
      db.collection(`examGrades/${examGrade.id}/parameterGrades/${parameterGrade.id}/criteriaGrades/${criteriaGrade.id}/aspectGrades`).doc(aspectoGrade["id"]).set(aspectoGrade).then(()=>{
        console.log("adding addAspectGrades" + aspectoGrade.label)
        resolve()
      },
      reason =>{
        alert("ERROR: " + reason)
        reject()
      })   
    })        
  }  


  getUserDisplayName(user:User){
    return user.displayName
  }




  materiaChange(event) {
    var materiaId = event.value
    this.loadExams(materiaId)
  }     

  onParameterChange(p){
    console.log("parameterChange")
    if( !p.value.isSelected){
      p.controls.evaluator_uid.setValue(null)
      p.controls.evaluator_uid.disable()
      p.controls.evaluator_uid.clearValidators()
    }
    else{
      p.controls.evaluator_uid.enable()
      p.controls.evaluator_uid.setValidators([Validators.required])
    }
  }
  get parameterGradesFA(){
    console.log("parameterGradesFA:" + this.examGradeFG.controls.parameterGradesFA.status)
    return this.examGradeFG.controls.parameterGradesFA as FormArray
  }
}
