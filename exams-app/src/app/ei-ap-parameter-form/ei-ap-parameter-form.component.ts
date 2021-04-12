import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ExamenesImprovisacionService} from '../examenes-improvisacion.service'
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { UserLoginService } from '../user-login.service';


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
    , private userLoginService:UserLoginService) { 
      this.id = parseInt(this.route.snapshot.paramMap.get('id'))
    }
  
  submitting = false
  id = null
  comentario = ""
  calificacion = -1
  token = ""
  criteria_labels = {}
  question_labels = {}
  question_description = {}
  estudianteNombre =""
  maestraNombre = ""
  materia =""
  parametro=""
  tipo=""
  parametro_descripcion=""

  exam_impro_ap_criteria = new FormArray([
    this.fb.group({
      id:[1],
      exam_impro_app_questions: new FormArray([
      ]) 
    })  
  ])  
  
  nvl(val1, val2){
    return (val1!=null)?val1:val2
  }

  ngOnInit(): void {

    
    var request = {
      exam_impro_ap_parameter:{
        id:this.id,
        exam_impro_ap_criteria:[{
          id:"",
          selected:true,
          exam_impro_criteria:{
            id:"",
            label:"",
            idx:"",
            description:"",
            exam_impro_question:[{
              id:"",
              label:"",
              description:"",
              points:""
            }]
          }
        }],
        "maestro:user":{
          email:"",
          displayName:""
        },
        exam_impro_ap:{
          materia:"",
          fechaApplicacion:"",
          "estudiante:user":{
            email:"",
            displayName:""
          }
        },
        exam_impro_parameter:{
          id:"",
          label:"",
          description:"",
          exam_impro_type:{
            label:""
          }
        }
      },
      orderBy:{
        "exam_impro_parameter.idx":"",
        "exam_impro_criteria.idx":"",
        "exam_impro_question.idx":""
      }
    }

    for( let i=0; this.exam_impro_ap_criteria.length; i++){
      this.exam_impro_ap_criteria.removeAt(i)
    }

    var token = this.userLoginService.getUserIdToken()

    this.examImprovisacionService.chenequeApiInterface("get", token, request).subscribe(data => { 
      for( let i=0; this.exam_impro_ap_criteria.length; i++){
        this.exam_impro_ap_criteria.removeAt(i)
      }
      console.log(data)

      var result = data["result"]

      this.estudianteNombre = this.nvl(result["exam_impro_ap"]["estudiante"]["displayName"] , result["exam_impro_ap"]["estudiante"]["email"] )
      this.maestraNombre = this.nvl( result["maestro"]["displayName"], result["maestro"]["email"])
      this.materia =  result["exam_impro_ap"]["materia"]
      this.parametro = result["exam_impro_parameter"]["label"]
      this.parametro_descripcion = result["exam_impro_parameter"]["description"]
      this.tipo = result["exam_impro_parameter"]["exam_impro_type"]["label"]


      let ap_criteria_arr= data["result"]["exam_impro_ap_criteria"]
      for( let i = 0; i<ap_criteria_arr.length; i++){
        let ap_criteria = ap_criteria_arr[i]
        var exam_impro_ap_criteria_id = ap_criteria.id
        var cg:FormGroup = this.fb.group({
          id:[exam_impro_ap_criteria_id],
          description:[ap_criteria["exam_impro_criteria"]["description"]],
          exam_impro_app_questions: new FormArray([])
        })        

        this.exam_impro_ap_criteria.push(cg)

        this.criteria_labels[exam_impro_ap_criteria_id] = ap_criteria.exam_impro_criteria.label

        for( let j=0; j< ap_criteria.exam_impro_criteria.exam_impro_question.length; j++){
          let question = ap_criteria.exam_impro_criteria.exam_impro_question[j] 
          var qg:FormGroup = this.fb.group({
            id:[null],
            exam_impro_ap_criteria_id:[exam_impro_ap_criteria_id],
            exam_impro_question_id:[question.id],
            graded:[question.points]
          })
          var qa:FormArray = cg.controls.exam_impro_app_questions as FormArray
          qa.push(qg)

          this.question_labels[question.id] = question.label
          this.question_description[question.id] = question.description
        }

      }

    },
    error => {
      alert("ERROR al leer:" + error)
      
    });   
    
  }
  
  getCriteriaLabel(id){
    return this.criteria_labels[id]
  }

  getQuestionLabel(id){
    return this.question_labels[id]
  }

  submit(){
    this.submitting = true
    console.log( JSON.stringify(this.exam_impro_ap_criteria.value, null, 2) )
    var jsonStr = JSON.stringify(this.exam_impro_ap_criteria.value)
    var data = JSON.parse(jsonStr);

    var exam_impro_questions_request= {
      "exam_impro_ap_question":[]
    }

    for( let i=0; i<data.length;i++){
      var c = data[i]
      for(let j=0; j< c.exam_impro_app_questions.length; j++){
        var q = c.exam_impro_app_questions[j]
        exam_impro_questions_request.exam_impro_ap_question.push(q)
      }
    }

    var token = this.userLoginService.getUserIdToken() 

    this.examImprovisacionService.chenequeApiInterface("add", token, exam_impro_questions_request).subscribe(data => {
      var result = data["result"]
      console.log(JSON.stringify(result, null, 2))
      //close the parameter
      this.closeParameter()
    },
    error => {
      alert("error creating questions" + error)
    })
  }

  closeParameter(){
    var exam_impro_ap_parameter_update_request = {
      exam_impro_ap_parameter:{
        completado:true,
        where:{
          id:this.id
        }
      }
    }
    
    var token = this.userLoginService.getUserIdToken() 

    this.examImprovisacionService.chenequeApiInterface("update", token, exam_impro_ap_parameter_update_request).subscribe(data => {
      this.retrieveCalificacion()
    },
    error => {
      alert("error closing parameter" + error)
    })    
  }

  retrieveCalificacion(){
    var exam_impro_calificacion_request = {
      exam_impro_calificacion:{
        calificacion:"",
        exam_impro_ap_parameter_id:this.id
      }
    }
    var token = this.userLoginService.getUserIdToken() 
    this.examImprovisacionService.chenequeApiInterface("get", token, exam_impro_calificacion_request).subscribe(data => {
      var result = data["result"]
      this.calificacion = result.calificacion
      this.openCommentDialog()
    },
    error => {
      alert("error retrieving calificacion" + error)
    })    
  }

  openCommentDialog(){
    const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      width: '250px',
      data: {calificacion:this.calificacion, comentario: ""}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if( result != undefined ){
        this.addComment(result)  
      }
      else{
        this.router.navigate(['/ExamenesImprovisacion']);
      }

    });
  }

  addComment(comentario): void{
    var exam_impro_ap_parameter_update_request = {
      exam_impro_ap_parameter:{
        comentario:comentario,
        where:{
          id:this.id
        }
      }
    }
    var token = this.userLoginService.getUserIdToken() 

    this.examImprovisacionService.chenequeApiInterface("update", token, exam_impro_ap_parameter_update_request).subscribe(data => {
      this.router.navigate(['/ExamenesImprovisacion']);
    },
    error => {
      alert("error adicionando comentario" + error)
    })    
  }

  showDescription(id){
    var description = this.question_description[id]
    const dialogRef = this.dialog.open(DescriptionDialog, {
      width: '250px',
      data: { description: description}
    });    
  }

  showText(str){
    const dialogRef = this.dialog.open(DescriptionDialog, {
      width: '250px',
      data: { description: str}
    });    
  }  

  formatLabel(value: number) {
    return value*100 + "%";
  }  

  getformValue(){
    return JSON.stringify(this.exam_impro_ap_criteria.value)
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