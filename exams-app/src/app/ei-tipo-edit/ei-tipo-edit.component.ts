import { Component, NgZone, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamenesImprovisacionService} from '../examenes-improvisacion.service';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {take} from 'rxjs/operators';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-ei-tipo-edit',
  templateUrl: './ei-tipo-edit.component.html',
  styleUrls: ['./ei-tipo-edit.component.css']
})


export class EiTipoEditComponent implements OnInit {

  exam_impro_type = this.fb.group({
    id: [null, Validators.required],
    label:["nombre tipo de examen", Validators.required],   
    exam_impro_parameter: new FormArray([
      this.fb.group({
        id: [null, Validators.required],
        exam_impro_type_id:[1, Validators.required],
        label:["nombre del parametro", Validators.required],
        exam_impro_criteria: new FormArray([
          this.fb.group({
            id:[null],
            label:["nombre del criterio",Validators.required],
            exam_impro_parameter_id:[2],
            initially_selected:[false],
            idx:[0],
            exam_impro_question:new FormArray([
              this.fb.group({
                id:[null,Validators.required],
                exam_impro_criteria_id:[3,Validators.required],
                label:["nombre de la pregunta",Validators.required],
                description:["descripcion de la pregunta",Validators.required],
                points:[1,Validators.required]
              })
            ])
          })
        ])         
      })
    ])
  });
  
  id;
  submitting = false;
  
  constructor(private fb: FormBuilder
    , private route: ActivatedRoute
    , private router: Router
    , private examImprovisacionService: ExamenesImprovisacionService
    , private formBuilder: FormBuilder
    , private _ngZone: NgZone) {
      this.id = parseInt(this.route.snapshot.paramMap.get('id'))
  
  }

  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1))
        .subscribe(() => this.autosize.resizeToFitContent(true));
  }  
  
  getFormGroupArray (fg:FormGroup, controlname:string): FormGroup[] {
    var fa:FormArray =  fg.controls[controlname] as FormArray
    return fa.controls as FormGroup[]
  }

  ngOnInit(): void {
    
    if( this.id ){
      var request = {
        exam_impro_type:{
          id:this.id,
          label:"",
          "exam_impro_parameter(+)":[{
            id:"",
            exam_impro_type_id:"",
            label:"",
            "exam_impro_criteria(+)":[{
              id:"",
              label:"",
              exam_impro_parameter_id:"",
              initially_selected:"",
              idx:"",
              "exam_impro_question(+)":[{
                id:"",
                exam_impro_criteria_id:"",
                label:"",
                description:"",
                points:""
              }]
            }]
          }],
        },
        "orderBy":{
          "exam_impro_type.id":"",
          "exam_impro_parameter.id":"",
          "exam_impro_criteria.idx":""
        }
      }
      this.examImprovisacionService.chenequeApiInterface("get", request).subscribe(
        data => { 
          let t = data["result"] as Array<any>;
          this.exam_impro_type.controls.id.setValue(t["id"])
          this.exam_impro_type.controls.label.setValue(t["label"])
          var parameter_arr:FormArray = this.exam_impro_type.controls.exam_impro_parameter as FormArray

          for( let i=parameter_arr.length-1; i>=0; i--){
            parameter_arr.removeAt(i)
          }
          for( let i =0; i<t["exam_impro_parameter"].length; i++){
            var p = t["exam_impro_parameter"][i]
            var g = this.fb.group({
              id:[p["id"]],
              label:[p["label"]],
              exam_impro_parameter_id:[p["exam_impro_parameter_id"]],
              exam_impro_criteria:new FormArray([])
            })
            parameter_arr.push(g)
            this.addCriteria( p, g.controls.exam_impro_criteria as FormArray)
          }
        },     
        error => {
          alert("error loading questions")
        }
      )  
    }

    this.exam_impro_type.valueChanges
      .subscribe(value=> {
       if (this.exam_impro_type.dirty) {
              //do something
                console.log("form has changed:" + value)
              }
           });
    
  }

  newParameter( tipo:FormGroup  ){
    var parameters_array:FormArray = tipo.controls["exam_impro_parameter"] as FormArray
    var exam_impro_parameter_req = {
      exam_impro_parameter:{
        id:null,
        label:"Parameter_" + (parameters_array.length + 1),
        exam_impro_type_id:tipo.controls["id"].value
      }
    }
    this.submitting = true;
    this.examImprovisacionService.chenequeApiInterface("add", exam_impro_parameter_req).subscribe(
      data => {
        console.log(" parameter add has completed")
        var p = data["result"]["exam_impro_parameter"]
        var g = this.fb.group({
          id:[p["id"]],
          label:[p["label"]],
          exam_impro_type_id:[p["exam_impro_type_id"]],
          exam_impro_criteria:new FormArray([])
        })
        parameters_array.push(g)  
        this.submitting = false;      
      },
      error => {
        alert("error nuevo parametro:" + error.error)
        this.submitting = false; 
      }
    )
  }

  newCriteria( parameter:FormGroup  ){
    this.submitting = true; 
    var criteria_array:FormArray = parameter.controls["exam_impro_criteria"] as FormArray
    var exam_impro_criteria_req = {
      exam_impro_criteria:{
        id:null,
        label:"Criterio_" + (criteria_array.length + 1),
        exam_impro_parameter_id:parameter.controls["id"].value,
        initially_selected:true,
        idx:criteria_array.length 
      }
    }

    this.examImprovisacionService.chenequeApiInterface("add", exam_impro_criteria_req).subscribe(
      data => {
        console.log(" criteria add has completed")
        var c = data["result"]["exam_impro_criteria"]
        var g = this.fb.group({
          id:[c["id"]],
          label:[c["label"]],
          exam_impro_ap_parameter_id:[c["exam_impro_ap_parameter_id"]],
          initially_selected:[c["initially_selected"]],
          idx:[criteria_array.length],
          exam_impro_question:new FormArray([])
        })
        criteria_array.push(g)
        this.submitting = false;         
      },
      error => {
        alert("error nuevo criterio:" + error.error)
        this.submitting = false; 
      }
    )
  }  

  newQuestion( criteria:FormGroup  ){
    this.submitting = true; 
    var question_array:FormArray = criteria.controls["exam_impro_question"] as FormArray
    var exam_impro_question_req = {
      exam_impro_question:{
        id:null,
        label:"",
        description:"" ,
        points:1,
        exam_impro_criteria_id:criteria.controls["id"].value
      }
    }

    this.examImprovisacionService.chenequeApiInterface("add", exam_impro_question_req).subscribe(
      data => {
        console.log(" questions add has completed")
        var q = data["result"]["exam_impro_question"]
        var g = this.fb.group({
          id:[q["id"]],
          label:[q["label"]],
          description:[q["description"]],
          points:[q["points"]],
          exam_impro_criteria_id:[q["exam_impro_criteria_id"]]
        })
        question_array.push(g) 
        this.submitting = false;        
      },
      error => {
        alert("error nueva pregunta:" + error.error)
        this.submitting = false; 
      }
    )
  }

  delParameter(t, p){
    this.submitting = true; 
    var exam_impro_parameter_request = {
      exam_impro_parameter:{
        id:p.controls.id.value
      }
    }
    this.examImprovisacionService.chenequeApiInterface("delete", exam_impro_parameter_request).subscribe(
      data => {
        console.log("question has been erased")
        var parameter_array:FormArray = t.controls["exam_impro_parameter"] as FormArray
        for(var i=0; i<parameter_array.length; i++){
          var tp:FormGroup = parameter_array.controls[i] as FormGroup
          if( tp.controls["id"].value == p.controls.id.value){
            parameter_array.removeAt(i)
            break;
          }
        }
        this.submitting = false; 
      },
      error => {
        alert( "paramtero no pudo ser borrado" )
        this.submitting = false; 
      }
    )
  }




  delCriteria(p, c){
    this.submitting = true; 
    var exam_impro_criteria_request = {
      exam_impro_criteria:{
        id:c.controls.id.value
      }
    }
    this.examImprovisacionService.chenequeApiInterface("delete", exam_impro_criteria_request).subscribe(
      data => {
        console.log("question has been erased")
        var criteria_array:FormArray = p.controls["exam_impro_criteria"] as FormArray
        for(var i=0; i<criteria_array.length; i++){
          var tc:FormGroup = criteria_array.controls[i] as FormGroup
          if( tc.controls["id"].value == c.controls.id.value){
            criteria_array.removeAt(i)
            this.updateCriteriaIndex(criteria_array.controls as FormGroup[],i)
            break;
          }
        }
        this.submitting = false; 
      },
      error => {
        alert( "criterio no pudo ser borrado" )
        this.submitting = false; 
      }
    )
  }



  delQuestion(c, q){
    this.submitting = false; 
    var exam_impro_question_request = {
      exam_impro_question:{
        id:q.controls.id.value
      }
    }
    this.examImprovisacionService.chenequeApiInterface("delete", exam_impro_question_request).subscribe(
      data => {
        console.log("question has been erased")
        var question_array:FormArray = c.controls["exam_impro_question"] as FormArray
        for(var i=0; i<question_array.length; i++){
          var tq:FormGroup = question_array.controls[i] as FormGroup
          if( tq.controls["id"].value == q.controls.id.value){
            question_array.removeAt(i)
            break;
          }
        }
        this.submitting = false; 
      },
      error => {
        alert( "aspecto no pudo ser borrado" )
        this.submitting = false; 
      }
    )
  }

  addCriteria( p, criteria_array:FormArray  ){
    for( let i =0; i<p["exam_impro_criteria"].length; i++){
      var c = p["exam_impro_criteria"][i]
      var g = this.fb.group({
        id:[c["id"]],
        label:[c["label"]],
        exam_impro_ap_parameter_id:[c["exam_impro_ap_parameter_id"]],
        initially_selected:[c["initially_selected"]],
        idx:[c["idx"]],
        exam_impro_question:new FormArray([])
      })
      criteria_array.push(g)
      this.addQuestion( c,  g.controls.exam_impro_question as FormArray)
    }

  }



  addQuestion( c, question_array:FormArray  ){
    for( let i =0; i<c["exam_impro_question"].length; i++){
      var q = c["exam_impro_question"][i]
      var g = this.fb.group({
        id:[q["id"]],
        label:[q["label"]],
        exam_impro_criteria_id:[q["exam_impro_criteria_id"]],
        description:[q["description"]],
        points:[q["points"]]
      })
      question_array.push(g)
    }

  }  


  onChangeTipo(exam_impro_type){
    console.log("exam_impro_type")
    var exam_impro_type_req = {
      exam_impro_type:{
        label:exam_impro_type.controls["label"].value,
        where:{
          id:exam_impro_type.controls["id"].value
        }
      }
    }

    this.examImprovisacionService.chenequeApiInterface("update", exam_impro_type_req).subscribe(
      data => {
        console.log(" type update has completed")
      },
      error => {
        alert("error:" + error.error)
      }
    )

  }
  onChangeParameter(exam_impro_parameter){
    console.log("exam_impro_parameter")
    var exam_impro_parameter_req = {
      exam_impro_parameter:{
        label:exam_impro_parameter.controls["label"].value,
        where:{
          id:exam_impro_parameter.controls["id"].value
        }
      }      
    }

    this.examImprovisacionService.chenequeApiInterface("update", exam_impro_parameter_req).subscribe(
      data => {
        console.log(" parameter update has completed")
      },
      error => {
        alert("error:" + error.error)
      }
    )
  }
  onChangeCriteria(exam_impro_criteria){
    console.log("exam_impro_criteria")
    var exam_impro_criteria_req = {
      exam_impro_criteria:{
        label:exam_impro_criteria.controls["label"].value,
        initially_selected:exam_impro_criteria.controls["initially_selected"].value,
        where:{
          id:exam_impro_criteria.controls["id"].value
        }
      }
    }

    this.examImprovisacionService.chenequeApiInterface("update", exam_impro_criteria_req).subscribe(
      data => {
        console.log("criteria update completed:" + exam_impro_criteria.controls["label"].value + " " + exam_impro_criteria.controls["initially_selected"].value)
      },
      error => {
        alert("error onChangeCriteria:" + error.error)
      }
    )
  }
  onChangeQuestion(exam_impro_question){
    console.log("exam_impro_question")
    var exam_impro_question_req = {
      exam_impro_question:{
        label:exam_impro_question.controls["label"].value,
        description:exam_impro_question.controls["description"].value,
        points:exam_impro_question.controls["points"].value,
        where:{
          id:exam_impro_question.controls["id"].value
        }
      }
    }

    this.examImprovisacionService.chenequeApiInterface("update", exam_impro_question_req).subscribe(
      data => {
        console.log(" question update has completed")
      },
      error => {
        alert("error:" + error.error)
      }
    )
  }
  getAnyClass(obj) {
    if (typeof obj === "undefined") return "undefined";
    if (obj === null) return "null";
    return obj.constructor.name;
  }   

  getformValue(){
    return JSON.stringify(this.exam_impro_type.value)
  } 

  updateCriteriaIndex(formGroupArray:FormGroup[], from){
    var req = {
      "exam_impro_criteria":[]
    }
    
    for(let i = from; i<formGroupArray.length; i++ ){
      var c =  {
        "idx":i,
        "where":{
            "id":formGroupArray[i].controls.id.value
        }
      }
      req["exam_impro_criteria"].push(c)
      formGroupArray[i].controls.idx.setValue(i)
    }

    this.examImprovisacionService.chenequeApiInterface("update", req).subscribe(
      data => {
        console.log(" type update has completed")
      },
      error => {
        alert("error:" + error.error)
      }
    )

  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container && 
      event.previousIndex!=event.currentIndex ) {
      var formGroupArray:FormGroup[] = event.item.data.controls.exam_impro_criteria.controls as FormGroup[]
      moveItemInArray(event.item.data.controls.exam_impro_criteria.controls, event.previousIndex, event.currentIndex);
      this.updateCriteriaIndex(formGroupArray,event.previousIndex<event.currentIndex?event.previousIndex:event.currentIndex)

    } 
  } 
  onDragMove(event: CdkDragDrop<any>) {
    console.log("ondragmove:" + event)
  }
}
