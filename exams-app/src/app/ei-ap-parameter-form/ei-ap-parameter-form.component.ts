import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ExamenesImprovisacionService} from '../examenes-improvisacion.service'
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';


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
    , public dialog: MatDialog) { 
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

  exam_impro_ap_criteria = new FormArray([
    this.fb.group({
      id:[1],
      exam_impro_app_questions: new FormArray([
        this.fb.group({
          id:[2],
          exam_impro_ap_criteria_id:[3],
          exam_impro_question_id:[4],
          graded: [5]
        })
      ]) 
    })  
  ])        

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
            exam_impro_question:[{
              id:"",
              label:"",
              description:"",
              points:""
            }]
          }
        }],
        maestro:{
          nombre:"",
          apellidoPaterno:""
        },
        exam_impro_ap:{
          materia:"",
          fechaApplicacion:"",
          estudiante:{
            nombre:"",
            apellidoPaterno:""
          }
        },
        exam_impro_parameter:{
          id:"",
          label:"",
          exam_impro_type:{
            label:""
          }
        }
      },
      orderBy:{
        "exam_impro_parameter.id":"",
        "exam_impro_criteria.idx":""
      }
    }

    for( let i=0; this.exam_impro_ap_criteria.length; i++){
      this.exam_impro_ap_criteria.removeAt(i)
    }

    this.examImprovisacionService.chenequeApiInterface("get", request).subscribe(data => { 
      for( let i=0; this.exam_impro_ap_criteria.length; i++){
        this.exam_impro_ap_criteria.removeAt(i)
      }
      console.log(data)

      var result = data["result"]

      this.estudianteNombre = result["exam_impro_ap"]["estudiante"]["nombre"] + " " + result["exam_impro_ap"]["estudiante"]["apellidoPaterno"]
      this.maestraNombre = result["maestro"]["nombre"] + " " + result["maestro"]["apellidoPaterno"]
      this.materia =  result["exam_impro_ap"]["materia"]
      this.parametro = result["exam_impro_parameter"]["label"]
      this.tipo = result["exam_impro_parameter"]["exam_impro_type"]["label"]


      let ap_criteria_arr= data["result"]["exam_impro_ap_criteria"]
      for( let i = 0; i<ap_criteria_arr.length; i++){
        let ap_criteria = ap_criteria_arr[i]
        var exam_impro_ap_criteria_id = ap_criteria.id
        var cg:FormGroup = this.fb.group({
          id:[exam_impro_ap_criteria_id],
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

      

    this.examImprovisacionService.chenequeApiInterface("add", exam_impro_questions_request).subscribe(data => {
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
    this.examImprovisacionService.chenequeApiInterface("update", exam_impro_ap_parameter_update_request).subscribe(data => {
      this.retrieveCalificacion()
    },
    error => {
      alert("error closing parameter" + error)
    })    
  }

  retrieveCalificacion(){
    var exam_impro_calificacion_request = {
      exam_impro_calificacion:{
        grade:"",
        exam_impro_ap_parameter_id:this.id
      }
    }
    this.examImprovisacionService.chenequeApiInterface("get", exam_impro_calificacion_request).subscribe(data => {
      var result = data["result"]
      this.calificacion = result.grade
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
    this.examImprovisacionService.chenequeApiInterface("update", exam_impro_ap_parameter_update_request).subscribe(data => {
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