import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ExamenesImprovisacionService} from '../examenes-improvisacion.service'
import { ActivatedRoute, Router } from '@angular/router';
import { UserLoginService } from '../user-login.service';
import { Aspect, copyFromForm, Criteria, Exam, ExamGrade, ExamGradeRequest, ExamMultipleRequest, ExamRequest, Materia, Parameter, ParameterGrade, User, CriteriaGrade, AspectGrade, copyObj } from '../exams/exams.module';
import { ExamFormService } from '../exam-form.service';
import { db } from 'src/environments/environment';
import * as uuid from 'uuid';
import { PromiseType } from 'protractor/built/plugins';
import { ReplaySubject } from 'rxjs';
import { UserPreferencesService } from '../user-preferences.service';


@Component({
  selector: 'app-examen-improvisacion-form',
  templateUrl: './examen-improvisacion-form.component.html',
  styleUrls: ['./examen-improvisacion-form.component.css']
})
export class ExamenImprovisacionFormComponent {


  submitting = false

  parameter_label 
  today = new Date().toISOString().slice(0, 10)

  criteria_label 



  students:User[] 
  evaluators:User[] 

  materias:Array<Materia> = []
  exams:Array<Exam> = []

  organization_id = null

  
  
  examGrade = this.fb.group({
    id: [uuid.v4()],
    organization_id: [this.organization_id],
    isDeleted: [false],
    isCompleted:[false, Validators.required],
    applicationDate: [null, Validators.required],
    student_email: [null, Validators.required],
    student_name:[null,Validators.required],
    student_uid:[null,Validators.required],

    exam_id: [null, Validators.required],
    materia_id:[null,Validators.required],

    title:[null, Validators.required], 
    expression:[null], 
    parameterGrades: new FormArray([]),
    createdon:[this.today],
    updateon:[this.today]

  });


  constructor(private fb: FormBuilder,private route: ActivatedRoute
    , private router: Router
    , private examImprovisacionService: ExamenesImprovisacionService
    , private formBuilder: FormBuilder
    , private userLoginService:UserLoginService
    , private examFormService:ExamFormService
    , private userPreferencesService:UserPreferencesService) {
      this.organization_id = userPreferencesService.getCurrentOrganizationId()
      this.examGrade.controls.organization_id.setValue(this.organization_id)
  }

  

  getFormGroupArray (fg:FormGroup, controlname:string): FormGroup[] {
    if( fg == null){
      console.error("fg is null for:" + controlname)
    }
    var fa:FormArray =  fg.controls[controlname] as FormArray
    if( fa == null){
      console.error("fa is null for::" + controlname)
    }
    return fa.controls as FormGroup[]
  }
  


  ngOnInit() {
    this.userLoginService.getUserIdToken().then( token => {
      this.initialize(token)
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })
  }

  loadMateriaEnrollment(user_uid){
    this.materias.length = 0

    db.collection("materiaEnrollments")
    .where("organization_id","==", this.organization_id)
    .where("student_uid","==",user_uid)
    .get().then( set =>{
      console.log("materia start")

      let map:Array<Promise<void>> = set.docs.map( doc =>{
        console.log("processing enrollment:" + doc.data())
        const materia_id = doc.data().materia_id
        return db.collection("materias").doc(materia_id).get().then( doc=>{
          console.log("materia name:" + doc.data().materia_name)
          var materia:Materia = {
            id:doc.data().id,
            materia_name:doc.data().materia_name
          }
          this.materias.push(materia)
        })      
      })
      Promise.all(map).then(()=>{
        this.materias.sort( (a,b) => {
          if( a["materia_name"] > b["materia_name"] ){
            return 1
          }
          else return -1
        } )      
        console.log("end")
      })    
      console.log("materia end")      
    },
    reason =>{
      console.error("ERROR: materiaEnrollment failed:"+ reason)
    })
  }

  loadExams(materia_id){
    this.exams.length = 0
    db.collection("materias/" + materia_id + "/exams")
    .where("isDeleted","==",false)
    .get().then( set =>{
      set.docs.map( doc => {
          const exam:Exam = doc.data() as Exam

          this.exams.push(exam)  
      })    
      this.exams.sort( (a,b) => {return a.label > b.label ? 1:-1})
    },
    reason =>{
      console.log("ERROR reading exams:" + reason)
    })  
  }


  initialize(token){

    var req:ExamMultipleRequest = {
      "exams":[{
          "id":null,
          "label":null
      }],
      "orderBy":{
        "field":"label"
      }
    }  



    this.examImprovisacionService.firestoreApiInterface("get", token, req).subscribe(data => {
      let r:Exam[] = data["result"] as Array<any>;
      this.exams = []
      for( let i =0; i<r.length; i++){
        let obj:Exam = {
          "id":r[i].id,
          "label":r[i].label
        }
        this.exams.push(obj)
      }
    },
    error => {
      alert( "error retriving type request" + error )
    })


    var userReq = {
        "claims":"role-estudiante-" + this.organization_id
    }      

    this.examImprovisacionService.authApiInterface("getUserListForClaim", token, userReq).then(data => {
      let students = data["result"] as Array<any>;
      this.students = []
      for( let i =0; i<students.length; i++){
        let estudiante = students[i]
        let obj:User = {
          "uid":estudiante.uid,
          "email":estudiante.email,
          "displayName":(estudiante.displayName != null && estudiante.displayName != '')? estudiante.displayName : estudiante.email,
          "claims":estudiante.claims
        }
        this.students.push(obj)
      }
    },
    error => {
        alert( "Error retriving estudiante" + error )
    }) 
    
    
    var evaluator_req = {
      "claims":"role-evaluador-" + this.organization_id
    }      

    this.examImprovisacionService.authApiInterface("getUserListForClaim", token, evaluator_req).then(data => {
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
        this.evaluators.push(obj)            
      }
    },
    error => {
        alert( "Error retriving evaluador" + error )
    })     
  }  
  
  getExamTypes(){
    return this.exams;
  }

  examChange(event) {
    var examId = event.value

    var materia_id = this.examGrade.controls.materia_id.value
    var parameterGrades:FormArray = this.examGrade.controls.parameterGrades as FormArray
    parameterGrades.clear()      

    var req:ExamRequest = {
      materias:{
        id:materia_id,
        exams:{
            id:examId,
            label:null,
            parameters:[{
              id:null,
              idx:null,
              label:null,
              description:null,
              scoreType:null,
              criterias:[{
                id:null,
                label:null,
                description:null,
                idx:null,
                initiallySelected:null,              
                aspects:[{
                  id:null,
                  idx:null,
                  label:null,
                  description:null,
                }]
              }]
            }]
        }
      }
    }  
    
    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.firestoreApiInterface("get", token, req).subscribe(data => {
        let exam:Exam = data["result"].exams
        this.addExam(parameterGrades, exam)
      },
      error => {
          alert( error )
      }) 
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })       
  }
  addExam(parameterGrades:FormArray, exam:Exam){

    for( let i=0; i<exam.parameters.length; i++){
      let parameter = exam.parameters[i]
      this.addParameter(parameterGrades, parameter)
    }

    parameterGrades.controls.sort( (a, b) => {
      var afg:FormGroup = a as FormGroup 
      var bfg:FormGroup = b as FormGroup
      return  afg.controls.idx.value - bfg.controls.idx.value 
    })       
  }
  addParameter(parameterGrade_array:FormArray, p:Parameter){

    var g=this.fb.group({
      id: [p.id],
      organization_id: [this.organization_id],
      idx: [p.idx],
      label: [p.label],
      description: [p.description],
      scoreType: [p.scoreType],
      score: [null],
      evaluator_uid:[null, Validators.required],
      evaluator_name:[null],
      evaluator_email:[null],
      student_email:[null],
      student_name:[null],
      student_uid:[null],
      isCompleted: [false],
      isSelected:[true],
      criteriaGrades: new FormArray([])         
    })

    g.valueChanges.subscribe(parameter => {
      if(parameter) {
        if( parameter.isSelected == true){
          g.controls.evaluator_uid.setValidators([Validators.required]);
        }
        else{
          g.controls.evaluator_uid.clearValidators();
        }
      }
    });   

    g.controls["evaluator_uid"].setErrors({ 'incorrect': true});

    parameterGrade_array.push(g) 

    var criteriaGrades_Array = g.controls.criteriaGrades as FormArray
    for( let i=0; i<p.criterias.length; i++){
      let criteria:Criteria = p.criterias[i]
      this.addCriteria(criteriaGrades_Array, criteria)
    }
    criteriaGrades_Array.controls.sort( (a, b) => {
      var afg:FormGroup = a as FormGroup 
      var bfg:FormGroup = b as FormGroup
      return  afg.controls.idx.value - bfg.controls.idx.value 
    })    
  }

  addCriteria(criteriaGrade_array:FormArray, c:Criteria){
    var g = this.fb.group({
      id:[uuid.v4()],
      idx:[c.idx],
      label:[c.label],
      description:[c.description],
      score:[null],
      isSelected:[ c.initiallySelected ],
      aspectGrades: new FormArray([])
    })
    criteriaGrade_array.push(g)

    var aspectGrades_arr = g.controls.aspectGrades as FormArray
    for(let i=0; i<c.aspects.length; i++){
      let aspect:Aspect = c.aspects[i]
      this.addAspect(aspectGrades_arr as FormArray, aspect)
    }
    aspectGrades_arr.controls.sort( (a, b) => {
      var afg:FormGroup = a as FormGroup 
      var bfg:FormGroup = b as FormGroup
      return  afg.controls.idx.value - bfg.controls.idx.value 
    }) 
  }

  addAspect(question_array:FormArray, a: Aspect ){
    var g = this.fb.group({
      id:[uuid.v4()],
      idx:[a.idx],
      label:[a.label],
      description:[a.description],
      isGraded:[false],
      score:[1.0],
      hasMedal:[false]
    })
    question_array.push(g)

  }  

  getExamStudents(){
    return this.students;    
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
    return this.examGrade.invalid
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
    if( this.examGrade.invalid ){
      const invalid = [];
      const controls = this.examGrade.controls;
      for (const name in controls) {
          if (controls[name].invalid) {
              invalid.push(name);
          }
      }
      alert( "invalid:" + invalid.join(" "));
      this.submitting = false
    }
    else{

      let examGrade:ExamGrade = {
        id:null, 
        organization_id:null,
        exam_id:null,
        exam:null,
        materia_id:null, 
        materia:null,
        isCompleted: null, 
        applicationDate:null,
        student_uid:null, 
        student:null,
        title:null,
        expression:null,
        score:null, 
        isDeleted:null, 
        isReleased:null, 
        isApproved:null ,
        parameterGrades:null      
      }
      let json = copyFromForm(examGrade, this.examGrade)

      //adding all the evaluators
      const parametersFA = this.examGrade.controls.parameterGrades as FormArray
      const evaluators:Array<string> = []
      for( let i=0; i<parametersFA.controls.length; i++){
        const parameterFG = parametersFA.controls[i] as FormGroup
        const evaluator_uid = parameterFG.controls["evaluator_uid"].value
        evaluators.push( evaluator_uid )
      }
      json["evaluators"] = evaluators
      

      db.collection("examGrades").doc(examGrade["id"]).set(json).then(()=>{
        console.log("adding examGrade")
        
        let parameterGrades = this.examGrade.controls.parameterGrades as FormArray
        let pa = parameterGrades.controls.filter(p =>{
          let pFG = p as FormGroup
          return (pFG.controls["isSelected"].value == true)
        }).map(e =>{
         
          let p = e as FormGroup
          return this.addParameterGrade(examGrade, p)
        })
        Promise.all(pa).then( () =>{
          console.log("End Saving All")
          alert("Examen Creado!")
          this.router.navigate(['/ExamenesImprovisacion']);

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
  } 

  
  addParameterGrade(examGrade:ExamGrade, pFG:FormGroup):Promise<void>{
    let parameterGrade:ParameterGrade = {
      id:null, 
      organization_id:null,  
      idx: null, 
      label: null,
      description:null, 
      scoreType:null, 
      score:null, 
      evaluator_uid:null, 
      evaluator:null,
      applicationDate:null,
    
      isCompleted:null, 
      evaluator_comment:null,
    
      criteriaGrades: null     
    }
    let json = copyFromForm(parameterGrade,pFG)
    json["applicationDate"] = examGrade.applicationDate
    json["isDeleted"] = false

    var parameter_resolve = null
    return new Promise<void>((resolve, reject) =>{
      parameter_resolve = resolve
      db.collection(`examGrades/${examGrade.id}/parameterGrades`).doc(parameterGrade["id"]).set(json).then(()=>{
    
        console.log("adding parameterGrade" + parameterGrade.label)
        let criteriaGradesFA = pFG.controls.criteriaGrades as FormArray
        
        let cm = criteriaGradesFA.controls.map( c => {
            return this.addCriteriaGrades(examGrade, parameterGrade, c as FormGroup)             
        })
        Promise.all(cm).then( () =>{
          parameter_resolve()
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

  addCriteriaGrades(examGrade:ExamGrade, parameterGrade:ParameterGrade, criteriaGradeFG:FormGroup):Promise<void>{
    let cg:CriteriaGrade = {
      id:null,
      idx:null,
      label:null,
      description:null,
      score:null,
      isSelected:null,
      aspectGrades: null     
    }
    let criteriaGrade = copyFromForm(cg,criteriaGradeFG)
    var criteria_resolve = null
    return new Promise<void>((resolve, reject) =>{
      criteria_resolve = resolve    
      db.collection(`examGrades/${examGrade.id}/parameterGrades/${parameterGrade.id}/criteriaGrades`).doc(criteriaGrade["id"]).set(criteriaGrade).then(()=>{
        console.log("adding CriteriaGrade" + cg.label)
        let aspectGradesFA = criteriaGradeFG.controls.aspectGrades as FormArray
        let am = aspectGradesFA.controls.map( a =>{
          return this.addAspectGrades(examGrade, parameterGrade, cg, a as FormGroup)        
        })
        Promise.all(am).then( () =>{
          //console.log(value)
          criteria_resolve()
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

  addAspectGrades(examGrade:ExamGrade, parameterGrade:ParameterGrade, criteriaGrade:CriteriaGrade, aspectGradeFG:FormGroup):Promise<void>{
    let aspectoGrade:AspectGrade = {
      id:null,
      idx:null,
      label:null,
      description:null,
      isGraded:null,
      score:null,
      hasMedal:null
    }
    let json = copyFromForm(aspectoGrade,aspectGradeFG)
    var aspect_resolve = null
    return new Promise<void>((resolve, reject) =>{
      aspect_resolve = resolve      
      db.collection(`examGrades/${examGrade.id}/parameterGrades/${parameterGrade.id}/criteriaGrades/${criteriaGrade.id}/aspectGrades`).doc(json["id"]).set(json).then(()=>{
        console.log("adding addAspectGrades" + aspectoGrade.label)
        aspect_resolve()
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


  examStudentChange(event) {
    var studentId = event.value
    for( let i =0; i< this.students.length; i++){
      let student:User = this.students[i]
      if( student.uid == studentId ){
        this.examGrade.controls.student_email.setValue( student.email )
        this.examGrade.controls.student_name.setValue( student.displayName )
        this.examGrade.controls.student_uid.setValue( student.uid )
        this.loadMateriaEnrollment(student.uid)
        break;
      } 
    }
  }   

  materiaChange(event) {
    var materiaId = event.value
    this.loadExams(materiaId)
  }     

  examEvaluatorChange(parameter,event) {
    var evaluatorId = event.value
    for( let i =0; i< this.evaluators.length; i++){
      let evaluator:User = this.evaluators[i]
      if( evaluator.uid == evaluatorId ){
        parameter.controls.evaluator_name.setValue( evaluator.displayName )
        parameter.controls.evaluator_email.setValue( evaluator.email )
        console.log( "evaluator:" + parameter.controls.evaluator_name.value )
        break;
      } 
    }
  }    
  onParameterChange(p){
    console.log("parameterChange")
    if( !p.value.isSelected){
      p.controls.evaluator_uid.disable()
    }
    else{
      p.controls.evaluator_uid.enable()
    }
  }
}
