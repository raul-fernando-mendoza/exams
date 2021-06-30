import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ExamenesImprovisacionService} from '../examenes-improvisacion.service'
import { ActivatedRoute, Router } from '@angular/router';
import { UserLoginService } from '../user-login.service';
import { Aspect, Criteria, Exam, ExamGrade, ExamGradeRequest, ExamMultipleRequest, ExamRequest, Parameter, User } from '../exams/exams.module';
import { ExamFormService } from '../exam-form.service';




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

  exams: Exam[] 

  students:User[] 
  evaluators:User[] 

  examGrade = this.fb.group({
    id: [null],
    course:[null,Validators.required],
    completed:[false, Validators.required],
    applicationDate: [null, Validators.required],
    student_uid: [null, Validators.required],
    student_name:[null,Validators.required],

    exam_id: [null, Validators.required],
    exam_label: [null, Validators.required],

    title:[null], 
    expression:[null], 
    parameterGrades: new FormArray([])
  });

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
  
  constructor(private fb: FormBuilder,private route: ActivatedRoute
    , private router: Router
    , private examImprovisacionService: ExamenesImprovisacionService
    , private formBuilder: FormBuilder
    , private userLoginService:UserLoginService
    , private examFormFormService:ExamFormService) {

  }

  ngOnInit() {
    this.userLoginService.getUserIdToken().then( token => {
      this.initialize(token)
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })
  }

  initialize(token){

    var req:ExamMultipleRequest = {
      "exams":[{
          "id":null,
          "label":null
      }]
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
        "claims":"estudiante"
    }      

    this.examImprovisacionService.authApiInterface("getUserListForClaim", token, userReq).subscribe(data => {
      let students = data["result"] as Array<any>;
      this.students = []
      for( let i =0; i<students.length; i++){
        let estudiante = students[i]
        let obj:User = {
          "uid":estudiante.uid,
          "email":estudiante.email,
          "displayName":(estudiante.displayName != null)? estudiante.displayName : estudiante.email,
          "claims":estudiante.claims
        }
        this.students.push(obj)
      }
    },
    error => {
        alert( "Error retriving estudiante" + error )
    }) 
    
    
    var evaluator_req = {
      "claims":"evaluador"
    }      

    this.examImprovisacionService.authApiInterface("getUserListForClaim", token, evaluator_req).subscribe(data => {
      let users:User[] = data["result"] as Array<any>;
      this.evaluators = []
      for( let i =0; i<users.length; i++){
        var user = users[i]
        let obj:User = {
          "uid":user.uid,
          "email":user.email,
          "displayName":(user.displayName != null)? user.displayName : user.email,
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

    for(let i =0 ; i< this.exams.length; i++){
      let exam:Exam = this.exams[i]
      if( exam.id == examId ){
        this.examGrade.controls.exam_id.setValue(exam.id)
        this.examGrade.controls.exam_label.setValue(exam.label)
      } 
    }

    var parameterGrades:FormArray = this.examGrade.controls.parameterGrades as FormArray
    parameterGrades.clear()      

    var req:ExamRequest = {
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
    
    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.firestoreApiInterface("get", token, req).subscribe(data => {
        let exam:Exam = data["result"];
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
      idx: [p.idx],
      label: [p.label],
      description: [p.description],
      scoreType: [p.scoreType],
      score: [null],
      evaluator_uid:[null, Validators.required],
      evaluator_name:[null, Validators.required],
      student_uid:[null],
      student_name:[null],
      completed: [false],
      criteriaGrades: new FormArray([])         
    })
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
      id:[null],
      idx:[c.idx],
      label:[c.label],
      description:[c.description],
      score:[null],
      isSelected:[ c.initiallySelected ],
      aspectGrades: new FormArray([])
    })
    criteriaGrade_array.push(g)

    for(let i=0; i<c.aspects.length; i++){
      let aspect:Aspect = c.aspects[i]
      this.addAspect(g.controls.aspectGrades as FormArray, aspect)
    }
  }

  addAspect(question_array:FormArray, a: Aspect ){
    var g = this.fb.group({
      id:[null],
      idx:[a.idx],
      label:[a.label],
      description:[a.description],
      isGraded:[true],
      score:[null],
      hasMedal:[false],
      medalDescription:[null]
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
    return JSON.stringify(this.examGrade.value)
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
      var data = this.examGrade.value
      
      var json:ExamGrade = JSON.parse( JSON.stringify(data, this.examFormFormService.replacer, 4) )


      var req :ExamGradeRequest = {
        "examGrades":json
      }      

      this.userLoginService.getUserIdToken().then( token => { 

        this.examImprovisacionService.firestoreApiInterface("add", token, req).subscribe(data => {
          var result = data["result"]
          alert("thanks!")
          console.log(JSON.stringify(result, null, 2))
          this.router.navigate(['/ExamenesImprovisacion']);
        },
        error => {
          alert("error creating examGrade" + error.error)
          this.submitting = false
        })
      },
      error => {
        alert("Error in token:" + error.errorCode + " " + error.errorMessage)
        this.submitting = false
      })
    }

  } 

  getUserDisplayName(user:User){
    if(user.claims && "displayName" in user.claims ){
      return user.claims["displayName"]
    } 
    return user.displayName
  }


  examStudentChange(event) {
    var studentId = event.value
    for( let i =0; i< this.students.length; i++){
      let student:User = this.students[i]
      if( student.uid == studentId ){
        this.examGrade.controls.student_name.setValue( this.getUserDisplayName(student) )
        break;
      } 
    }
  }   

  examEvaluatorChange(parameter,event) {
    var evaluatorId = event.value
    for( let i =0; i< this.evaluators.length; i++){
      let evaluator:User = this.evaluators[i]
      if( evaluator.uid == evaluatorId ){
        parameter.controls.evaluator_name.setValue( this.getUserDisplayName(evaluator) )
        console.log( "evaluator:" + parameter.controls.evaluator_name.value )
        break;
      } 
    }
  }    

}
