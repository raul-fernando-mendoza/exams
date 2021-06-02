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
  criteria_labels = {}
  question_labels = {}
  question_description = {}
  estudianteNombre =""
  maestraNombre = ""
  materia =""
  title = ""
  expression = ""
  parametro=""
  tipo=""
  parametro_descripcion=""
  elementCount = 0

  exam_impro_ap_parameter = this.fb.group({
    id: [null, Validators.required],
    comentario:[null, Validators.required],
       
    exam_impro_ap_criteria:new FormArray([])
  });  
 
  
  nvl(val1, val2){
    return (val1!=null)?val1:val2
  }

  getFormGroupArray (fg:FormGroup, controlname:string): FormGroup[] {
    var fa:FormArray =  fg.controls[controlname] as FormArray
    return fa.controls as FormGroup[]
  }  

  ngOnInit(): void {

    this.exam_impro_ap_parameter.controls.id.setValue( this.id )
    var request = {
      exam_impro_ap_parameter:{
        id:this.id,
        comentario:"",
        "maestro:user":{
          displayName:"",
          email:""
        },        
        exam_impro_ap:{
          id:"",
          estudiante_uid:"",
          materia:"",
          title:"",
          expression:"",
          "estudiante:user":{
            displayName:"",
            email:""
          },
          exam_impro_type:{
            label:""
          }
        },      
        exam_impro_parameter:{
          label:"",
          description:""
        },
        exam_impro_ap_criteria:[{
          id:"",
          exam_impro_criteria:{
            label:"",
            description:"",
            idx:""
          },
          exam_impro_ap_question:[{
            id:"",
            graded:"",
            comment:"",
            exam_impro_question:{
              label:"",
              description:"",
              idx:"",
              itemized:"",
            },
            "exam_impro_ap_observation(+)":[{
              id:"",
              complied:"",
              "exam_impro_observation(+)":{
                label:"",
                description:"",
                idx:""
              }
            }]
          }]
        }]        
      },
      orderBy:{
        "exam_impro_criteria.idx":"",
        "exam_impro_question.idx":"",
        "exam_impro_observation.idx":""
      }
    }

    var exam_impro_ap_criteria:FormArray = this.exam_impro_ap_parameter.controls.exam_impro_ap_criteria as FormArray
/*
    for( let i=0; exam_impro_ap_criteria.length; i++){
      exam_impro_ap_criteria.removeAt(i)
    }
*/
    this.userLoginService.getUserIdToken().then( token => {

      this.examImprovisacionService.chenequeApiInterface("get", token, request).subscribe(data => { 
  /*
        for( let i=0; exam_impro_ap_criteria.length; i++){
          exam_impro_ap_criteria.removeAt(i)
        }
        console.log(data)
 */
        var result = data["result"]

        this.estudianteNombre = this.nvl(result["exam_impro_ap"]["estudiante"]["displayName"] , result["exam_impro_ap"]["estudiante"]["email"] )
        this.maestraNombre = this.nvl( result["maestro"]["displayName"], result["maestro"]["email"])

        this.materia =  result["exam_impro_ap"]["materia"]
        this.title =  result["exam_impro_ap"]["title"]
        this.expression =  result["exam_impro_ap"]["expression"]
        this.parametro = result["exam_impro_parameter"]["label"]
        this.parametro_descripcion = result["exam_impro_parameter"]["description"]
        this.tipo = result["exam_impro_ap"]["exam_impro_type"]["label"]

        var commentario = this.nvl( result["comentario"], "")
        
        this.exam_impro_ap_parameter.controls.comentario.setValue( commentario )


        let ap_criteria_arr= data["result"]["exam_impro_ap_criteria"]
        for( let i = 0; i<ap_criteria_arr.length; i++){
          let c = ap_criteria_arr[i]
          this.addCriteria( exam_impro_ap_criteria, c )

        }

      },
      error => {
        alert("ERROR al leer:"+ error.message)
      });
    },
    error => {
      alert("Error en token:" + error.errorCode + " " + error.errorMessage)
    })
    
  }
  addCriteria( cq:FormArray, c){
   
    var cg:FormGroup = this.fb.group({
      id:[c["id"]],
      label:[c["exam_impro_criteria"]["label"]],
      description:[c["exam_impro_criteria"]["description"]],
      exam_impro_ap_question: new FormArray([])
    })
         
    cq.push(cg)   
    for( let i=0; i<c.exam_impro_ap_question.length; i++) {
      this.addQuestion(cg.controls.exam_impro_ap_question as FormArray, c.exam_impro_ap_question[i])
    }
  }

  addQuestion( qa:FormArray , q){
    var qg:FormGroup = this.fb.group({
      id:[q["id"]],
      label:[q["exam_impro_question"]["label"]],
      description:[q["exam_impro_question"]["description"]],
      graded:[q["graded"]],
      comment:[q["comment"]],
      itemized:[q["exam_impro_question"]["itemized"]],
      exam_impro_ap_observation: new FormArray([])
    })
    qa.push(qg)
    this.elementCount++;
    for( let i=0; i< q.exam_impro_ap_observation.length; i++){
      this.addObservation(qg.controls.exam_impro_ap_observation as FormArray,  q.exam_impro_ap_observation[i])
    }
  }

  addObservation( observation_arr: FormArray, o){
    var fg:FormGroup = this.fb.group({
      id:[o["id"]],
      label:[o["exam_impro_observation"]["label"]],
      description:[o["exam_impro_observation"]["description"]],
      complied: [o["complied"]]
    }) 
    observation_arr.push(fg)
    this.elementCount++;
  } 
  
  getCriteriaLabel(id){
    return this.criteria_labels[id]
  }

  getQuestionLabel(id){
    return this.question_labels[id]
  }

  

  submit(){
    this.submitting = true
    var exam_impro_ap_parameter_update_request = {
      exam_impro_ap_parameter:{
        completado:true,
        where:{
          id:this.id
        }
      }
    }
    
    this.userLoginService.getUserIdToken().then( token => {

      this.examImprovisacionService.chenequeApiInterface("update", token, exam_impro_ap_parameter_update_request).subscribe(data => {
        this.retrieveCalificacion()
        this.submitting = false
      },
      error => {
        alert("error closing parameter"  + error.errorCode + " " + error.errorMessage)
        this.submitting = false
      }) 
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
      this.submitting = false
    })  
  }

  useColapsed(){
    return (this.elementCount > 40)
  } 


  retrieveCalificacion(){
    var exam_impro_calificacion_request = {
      exam_impro_calificacion:{
        calificacion:"",
        exam_impro_ap_parameter_id:this.id
      }
    }
    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.chenequeApiInterface("get", token, exam_impro_calificacion_request).subscribe(data => {
        var result = data["result"]
        this.calificacion = result.calificacion
        this.openCommentDialog()
      },
      error => {
        alert("error retrieving calificacion" + error.errorCode + " " + error.errorMessage)
        this.submitting = false
      })  
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
      this.submitting = false
    })

  }

  openCommentDialog(){
    let comentario = this.exam_impro_ap_parameter.controls.comentario.value || ""
    const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      width: '250px',
      data: {calificacion:this.calificacion, comentario: comentario}
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

  onChangeObservation(q, o){
    var request={
      "exam_impro_ap_observation":{
        complied:o.controls.complied.value,
        where:{
          id:o.controls.id.value
        }
      }
    }
    this.userLoginService.getUserIdToken().then( token => { 
      this.examImprovisacionService.chenequeApiInterface("update", token, request).subscribe(data => {
        console.log("observation updated")
        this.updateQuestionGrade(q)
      },
      error => {
        alert("error updating observation"  + error.errorCode + " " + error.errorMessage)
      }) 
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })    
  }

  onChangeQuestion(q){
    if( q.controls.itemized.value ){
      var request={
        "exam_impro_ap_question":{
          comment:q.controls.comment.value,
          where:{
            id:q.controls.id.value
          }
        }
      }
      this.userLoginService.getUserIdToken().then( token => { 
        this.examImprovisacionService.chenequeApiInterface("update", token, request).subscribe(data => {
          console.log("question updated")
          this.updateQuestionGrade(q)
        },
        error => {
          alert("error question update"  + error.errorCode + " " + error.errorMessage)
        })    
      },
      error => {
        alert("Error in token:" + error.errorCode + " " + error.errorMessage)
      })    
    }
    else{
      var request_graded={
        "exam_impro_ap_question":{
          graded:q.controls.graded.value,
          where:{
            id:q.controls.id.value
          }
        }
      }
      this.userLoginService.getUserIdToken().then( token => { 
        this.examImprovisacionService.chenequeApiInterface("update", token, request_graded).subscribe(data => {
          console.log("question updated")
        },
        error => {
          alert("error question update"  + error.errorCode + " " + error.errorMessage)
        })    
      },
      error => {
        alert("Error in token:" + error.errorCode + " " + error.errorMessage)
      })          

    }
  }

  updateQuestionGrade(q){

    let observation_count = q.controls.exam_impro_ap_observation.length;
    let graded = 1;

    for( let i=0; i<q.controls.exam_impro_ap_observation.length; i++){
      var o:FormGroup = q.controls.exam_impro_ap_observation.controls[i] as FormGroup
      if( !o.controls.complied.value ){
        observation_count--;
      }
    }


    if( q.controls.comment.value && q.controls.comment.value.length > 0 ){
      graded = observation_count / (q.controls.exam_impro_ap_observation.length + 1)
    }
    else{
      graded = observation_count / (q.controls.exam_impro_ap_observation.length)
    }

    var request={
      exam_impro_ap_question:{
        graded:graded,
        where:{
          id:q.controls.id.value
        }
      }
    } 
    this.userLoginService.getUserIdToken().then( token => { 
      this.examImprovisacionService.chenequeApiInterface("update", token, request).subscribe(data => {
        console.log("question graded updated")
        q.controls.graded.value = graded
      },
      error => {
        alert("error question graded update"  + error.errorCode + " " + error.errorMessage)
      })    
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })         

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
    this.userLoginService.getUserIdToken().then( token => { 
      this.examImprovisacionService.chenequeApiInterface("update", token, exam_impro_ap_parameter_update_request).subscribe(data => {
        this.router.navigate(['/ExamenesImprovisacion']);
      },
      error => {
        alert("error adicionando comentario"  + error.errorCode + " " + error.errorMessage)
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

  formatLabel(value: number) {
    return value*100 + "%";
  }  

  getformValue(){
    return JSON.stringify(this.exam_impro_ap_parameter.value)
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