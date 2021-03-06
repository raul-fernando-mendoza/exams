import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { ExamenesImprovisacionService} from '../examenes-improvisacion.service'
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { UserLoginService } from '../user-login.service';
import { ExamFormService } from '../exam-form.service';
import {  AspectGrade,  AspectGradeRequest,  AspectRequest,  CriteriaGrade, ExamGrade, ExamGradeRequest, ParameterGradeRequest } from '../exams/exams.module';


export interface DialogData {
  calificacion: number,
  comentario: string
}

export interface DescriptionDlgData {
  description: string
}

@Component({
  selector: 'app-ei-ap-parameter-form',
  templateUrl: './ei-ap-parameter-form.component.html',
  styleUrls: ['./ei-ap-parameter-form.component.css']
})



export class EiApParameterFormComponent implements OnInit {

  constructor(private fb: FormBuilder
    , private route: ActivatedRoute
    , private router: Router
    , private examImprovisacionService: ExamenesImprovisacionService
    , private formBuilder: FormBuilder
    , public dialog: MatDialog
    , private userLoginService:UserLoginService
    , private examFormService:ExamFormService) { 
      this.examGrade_id = this.route.snapshot.paramMap.get('examGrade_id')
      this.parameterGrade_id = this.route.snapshot.paramMap.get('parameterGrade_id')
    }
  
   
  examGrade:FormGroup = this.fb.group({
    id: [null],
    exam_id:[null],
    exam_label:[null],

    course:[null, Validators.required],
    completed: [null],
    applicationDate:[null, Validators.required],

    student_uid:[null, Validators.required],
    student_name:[null],


    title: [null],
    expression: [null],
    score:[null],

    
    parameterGrades: new FormArray([])        
  })

  

  submitting = false
  
  examGrade_id = null
  parameterGrade_id = null
  parameterGrade_scoreType = null

  comentario = ""

  isDisabled = null

  
  nvl(val1, val2){
    return (val1!=null)?val1:val2
  }

  getFormGroupArray (fg:FormGroup, controlname:string): FormGroup[] {
    if( fg == null){
      console.error("ERROR controls for " + controlname + " in " + fg)
    }
    var fa:FormArray =  fg.controls[controlname] as FormArray
    if( fa == null){
      console.error("I can not find controls for:" + controlname)
    }
    return fa.controls as FormGroup[]
  }

  ngOnInit(): void {
    var request:ExamGradeRequest = {
      examGrades:{
        id: this.examGrade_id,

        exam_id:null,
        exam_label:null,
      
        course: null,
        completed: null,
        applicationDate:null,
      
        student_uid:null,
        student_name:null,
      
        title:null,
        expression:null,

        score:null,
        parameterGrades:[{
          id: this.parameterGrade_id,
          idx: null,
          label: null,
          description: null,
          score: null,
          evaluator_uid:null,
          evaluator_name:null,
          scoreType:null,
          evaluator_comment:null,

          completed:null,
        
          criteriaGrades:[{
            id:null,
            idx:null,  
            label: null,
            isSelected:null,  
            score:null,
            description: null,
            aspectGrades:[{
              id:null,
              idx:null,  
              label: null,
              description:null,
              isGraded:null,
              score:null,
              hasMedal:null,
              medalDescription:null,
              missingElements:null
            }]         
          }]        
        }]
      }
    }


    this.userLoginService.getUserIdToken().then( token => {

      this.examImprovisacionService.firestoreApiInterface("get", token, request).subscribe(data => { 
        var e:ExamGrade = data["result"]

        this.examGrade.controls.id.setValue(e.id)
        this.examGrade.controls.exam_id.setValue(e.exam_id)
        this.examGrade.controls.exam_label.setValue(e.exam_label)
        this.examGrade.controls.course.setValue(e.course)
        this.examGrade.controls.completed.setValue(e.completed)
        this.examGrade.controls.applicationDate.setValue(e.applicationDate)
        this.examGrade.controls.student_uid.setValue(e.student_uid)
        this.examGrade.controls.student_name.setValue(e.student_name)
        this.examGrade.controls.title.setValue(e.title)

        
        this.examGrade.controls.expression.setValue(e.expression)
        this.examGrade.controls.score.setValue(e.score)

        var p = e.parameterGrades[0]

        this.isDisabled = p.completed

        if( this.isDisabled ){
          this.examGrade.get("title").disable()
        }        

        this.parameterGrade_scoreType = p.scoreType

        var g = this.fb.group({
          id:[p.id],
          idx:[p.idx],
          label:[p.label],
          description:[p.description],
          scoreType:[p.scoreType],
          score:[{value:p.score, disable: this.isDisabled}],
          evaluator_uid:[p.evaluator_uid],
          evaluator_name:[p.evaluator_name],
          evaluator_comment:[p.evaluator_comment],
          completed:[p.completed],
          criteriaGrades: new FormArray([])
        })

        var parameterGrades_array:FormArray = this.examGrade.controls.parameterGrades as FormArray
        parameterGrades_array.clear()
        parameterGrades_array.push(g)
    
        var criteriaGrades_Array = g.controls.criteriaGrades as FormArray
        for( let i=0; i<p.criteriaGrades.length; i++){
          let criteriaGrade:CriteriaGrade = p.criteriaGrades[i]
          this.addCriteriaGrade(criteriaGrades_Array, criteriaGrade)
        }
        criteriaGrades_Array.controls.sort( (a, b) => {
          var afg:FormGroup = a as FormGroup 
          var bfg:FormGroup = b as FormGroup
          return  afg.controls.idx.value - bfg.controls.idx.value 
        })      },
      error => {
        alert("ERROR al leer:"+ error.message)
      });
    },
    error => {
      alert("Error en token:" + error.errorCode + " " + error.errorMessage)
    })
    
  }

  addCriteriaGrade(criteriaGrade_array:FormArray, c:CriteriaGrade){
    var g = this.fb.group({
      id:[c.id],
      idx:[c.idx],
      label:[c.label],
      description:[c.description],
      score:[c.score],
      isSelected:[ c.isSelected ],
      aspectGrades: new FormArray([])
    })
    criteriaGrade_array.push(g)

    var apectGrades_array = g.controls.aspectGrades as FormArray

    for(let i=0; i<c.aspectGrades.length; i++){
      let aspectGrade:AspectGrade = c.aspectGrades[i]
      this.addAspectGrade(apectGrades_array, aspectGrade)
    }
    apectGrades_array.controls.sort( (a, b) => {
      var afg:FormGroup = a as FormGroup 
      var bfg:FormGroup = b as FormGroup
      return  afg.controls.idx.value - bfg.controls.idx.value 
    })       
  }

  addAspectGrade(question_array:FormArray, a: AspectGrade ){
    var score:any = null
    if ( this.parameterGrade_scoreType == 'starts'){
      if( a.score == null){
        score = 1
      }
      else{
        score = a.score
      }
    }
    else if(this.parameterGrade_scoreType == 'status'){
      if( a.score == null){
        score = '0.95'
      }
      else{
        score = a.score.toString()
      }
    }
    var g = this.fb.group({
      id:[a.id],
      idx:[a.idx],
      label:[a.label],
      description:[a.description],
      isGraded:[a.isGraded],
      score:[{ value:score, disabled:this.isDisabled}],
      hasMedal:[{ value:a.hasMedal, disabled:this.isDisabled}],
      medalDescription:[{ value:a.medalDescription, disabled:this.isDisabled}],
      missingElements:[{ value:a.missingElements, disabled:this.isDisabled}]
    })
    question_array.push(g)

  }
  onChangeAspect(a){
    console.log("a:" +JSON.stringify(a.value))
    if ( a.controls.score.value <= 0.75){
      a.controls.medalDescription.setValue(null)
      a.controls.hasMedal.setValue(false)
      a.controls.medalDescription.disable()
    }
    else{
      a.controls.medalDescription.enable()
      if( a.controls.medalDescription.value && a.controls.medalDescription.value.length){
        a.controls.hasMedal.setValue(true)
      }
      else{
        a.controls.hasMedal.setValue(false)
      }
    }
    if (a.controls.score.value > 0){
      a.controls.isGraded.setValue(true)
    }
    else{
      a.controls.isGraded.setValue(false)
    }
    
    var req:AspectGradeRequest = {
      aspectGrades:{
        id:a.controls.id.value,
        isGraded:a.controls.isGraded.value,
        score:Number(a.controls.score.value),
        hasMedal:a.controls.hasMedal.value,
        medalDescription:a.controls.medalDescription.value,
        missingElements:a.controls.missingElements.value
      }
    }
    
    this.userLoginService.getUserIdToken().then( token => {

      this.examImprovisacionService.firestoreApiInterface("update", token, req).subscribe(data => {
        console.log("aspect updated")
        
      },
      error => {
        alert("error updating calification"  + error.errorCode + " " + error.errorMessage)
      
      }) 
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    
    })  

  }

  onChangeStarts(a){
    console.log("changed to:" + a)

    this.submitting = true
    var req:AspectGradeRequest = {
      aspectGrades:{
        id:a.controls.id.value,
        isGraded:true,
        score:Number(a.controls.score.value),
        hasMedal:null,
        medalDescription:null,
        missingElements:null
      }
    }
    
    this.userLoginService.getUserIdToken().then( token => {

      this.examImprovisacionService.firestoreApiInterface("update", token, req).subscribe(data => {
        console.log("aspect updated")
        this.submitting = false
      },
      error => {
        alert("error updating calification"  + error.errorCode + " " + error.errorMessage)
        this.submitting = false
      }) 
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
      this.submitting = false
    })  

  }
  submit(){
    console.log("submit called")
    this.submitting = true
    this.updateScore()
    this.openCommentDialog()
  }
  updateScore(){
    console.log("update score")
    var totalPoints:number= 0;
    var earnedPoints:number = 0;
    var finalScore:number = 0;
    let parameterGrades_array:FormArray = this.examGrade.controls.parameterGrades as FormArray
    let parameterGrade:FormGroup = parameterGrades_array.controls[0] as FormGroup
    let criteriaGrades_array = parameterGrade.controls.criteriaGrades as FormArray
    for( var i =0; i<criteriaGrades_array.controls.length; i++){
      let criteriaGrade:FormGroup = criteriaGrades_array.controls[i] as FormGroup
      if( criteriaGrade.controls.isSelected.value == true ){
        let aspectGrade_array:FormArray = criteriaGrade.controls.aspectGrades as FormArray
        for( var j=0; j<aspectGrade_array.controls.length; j++){
          totalPoints = totalPoints + 1
          let aspectGrade:FormGroup = aspectGrade_array.controls[j] as FormGroup
          earnedPoints = earnedPoints + Number(aspectGrade.controls.score.value)
          if( aspectGrade.controls.hasMedal && aspectGrade.controls.hasMedal.value == true){
            earnedPoints = earnedPoints + 0.05
          }
        }
      }
    }
    finalScore = Number( ((earnedPoints / totalPoints) * 10 ).toFixed(2) )
    parameterGrade.controls.score.setValue( finalScore )   
  }

  openCommentDialog(){
    console.log("openCommentDialog")
    var parameterGrades_array:FormArray = this.examGrade.controls.parameterGrades as FormArray
    var parameterGrade:FormGroup = parameterGrades_array.controls[0] as FormGroup

    var calificacion = parameterGrade.controls.score.value

    let comentario = parameterGrade.controls.evaluator_comment.value ? parameterGrade.controls.evaluator_comment.value: ""

    const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      width: '250px',
      data: {calificacion:calificacion, comentario: comentario}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if( result != undefined ){
        var parameterGrades_array = this.examGrade.controls.parameterGrades as FormArray
        var parameterGrade:FormGroup = parameterGrades_array.controls[0] as FormGroup
        parameterGrade.controls.evaluator_comment.setValue(result) 
        this.updateComment() 
      }
      else{
        this.close()
      }

    });
  }

  updateComment(): void{
    console.log("updateComment")
    var parameterGrade_arr = this.examGrade.controls.parameterGrades as FormArray
    var parameter:FormGroup = parameterGrade_arr.controls[0] as FormGroup
    var req:ParameterGradeRequest = {
      parameterGrades:{
        id: parameter.controls.id.value,
        evaluator_comment:parameter.controls.evaluator_comment.value,
      }
    }
    this.userLoginService.getUserIdToken().then( token => { 
      this.examImprovisacionService.firestoreApiInterface("update", token, req).subscribe(data => {
        this.close() 
      },
      error => {
        this.submitting = false
        alert("error adicionando comentario"  + error.errorCode + " " + error.errorMessage)
      })    
    },
    error => {
      this.submitting = false
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
      
    })
  }  
  close(): void{
    console.log("close")
    var parameterGrade_arr = this.examGrade.controls.parameterGrades as FormArray
    var parameterGrade = parameterGrade_arr.controls[0] as FormGroup
    var req:ParameterGradeRequest = {
      parameterGrades:{
        id: parameterGrade.controls.id.value,
        score: parameterGrade.controls.score.value,
        completed:true
      }
    }
    this.userLoginService.getUserIdToken().then( token => { 
      this.examImprovisacionService.firestoreApiInterface("update", token, req).subscribe(data => {
        this.submitting = false
        this.router.navigate(['/ExamenesImprovisacion']);
      },
      error => {
        alert("error adicionando comentario"  + error.errorCode + " " + error.errorMessage)
        this.submitting = false
      })    
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })
  }

  showDescription(desc){
    const dialogRef = this.dialog.open(DescriptionDialog, {
      width: '250px',
      data: { description: desc}
    });    
  }

  showText(str){
    const dialogRef = this.dialog.open(DescriptionDialog, {
      width: '250px',
      data: { description: str}
    });    
  }  

  getformValue(){
    return JSON.stringify(this.examGrade.value)
  }  

  isAdmin(){
    return this.userLoginService.hasRole("admin")
  }

  isEvaluador(){
    return this.userLoginService.hasRole("evaluador")
  }

  updateHeader(){
    console.log("close")
    var parameterGrade_arr = this.examGrade.controls.parameterGrades as FormArray
    var parameterGrade = parameterGrade_arr.controls[0] as FormGroup
    var req:ExamGradeRequest = {
      examGrades:{
        id: this.examGrade.controls.id.value,
        title: this.examGrade.controls.title.value
      }
    }
    this.userLoginService.getUserIdToken().then( token => { 
      this.examImprovisacionService.firestoreApiInterface("update", token, req).subscribe(data => {
        this.submitting = false
        this.router.navigate(['/ExamenesImprovisacion']);
      },
      error => {
        alert("error adicionando comentario"  + error.errorCode + " " + error.errorMessage)
        this.submitting = false
      })    
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })
  }
}
@Component({
  selector: 'ei-ap-parameter-comentario-dlg',
  templateUrl: 'ei-ap-parameter-comentario-dlg.html',
})
export class DialogOverviewExampleDialog { 

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

}

 
@Component({
  selector: 'ei-ap-parameter-description-dlg',
  templateUrl: 'ei-ap-parameter-description-dlg.html',
})
export class DescriptionDialog { 
  constructor(
    public dialogRef: MatDialogRef<DescriptionDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DescriptionDlgData) {}
}