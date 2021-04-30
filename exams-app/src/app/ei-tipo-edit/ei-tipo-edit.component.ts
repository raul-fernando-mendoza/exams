import { Component, NgZone, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamenesImprovisacionService} from '../examenes-improvisacion.service';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {take} from 'rxjs/operators';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { UserLoginService } from '../user-login.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-ei-tipo-edit',
  templateUrl: './ei-tipo-edit.component.html',
  styleUrls: ['./ei-tipo-edit.component.css']
})


export class EiTipoEditComponent implements OnInit {

  exam_impro_type = this.fb.group({
    id: [null, Validators.required],
    label:["nombre tipo de examen", Validators.required],   
    exam_impro_parameter: new FormArray([])
  });
  
  id;
  submitting = false;
  
  constructor(private fb: FormBuilder
    , private route: ActivatedRoute
    , private router: Router
    , private examImprovisacionService: ExamenesImprovisacionService
    , private formBuilder: FormBuilder
    , private _ngZone: NgZone
    , private userLoginService: UserLoginService) {
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
            idx:"",
            description:"",
            "exam_impro_criteria(+)":[{
              id:"",
              label:"",
              exam_impro_parameter_id:"",
              initially_selected:"",
              idx:"",
              description:"",
              "exam_impro_question(+)":[{
                id:"",
                exam_impro_criteria_id:"",
                label:"",
                description:"",
                points:"",
                idx:"",
                itemized:"",
                "exam_impro_observation(+)":[{
                  id:"",
                  exam_impro_question_id:"",
                  label:"",
                  description:"",
                  idx:""
                }]
              }]
            }]
          }],
        },
        "orderBy":{
          "exam_impro_type.id":"",
          "exam_impro_parameter.idx":"",
          "exam_impro_criteria.idx":"",
          "exam_impro_question.idx":"",
          "exam_impro_observation.idx":""
        }
      }
      this.userLoginService.getUserIdToken().then( token => {

        this.examImprovisacionService.chenequeApiInterface("get", token, request).subscribe(
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
              this.addParameter(p , parameter_arr)
            }
          },     
          error => {
            alert("error loading impro type")
            console.log(JSON.stringify(request))
          }
        )
      },
      error => {
        alert("Error in token:" + error.errorCode + " " + error.errorMessage)
      }) 
    }

    this.exam_impro_type.valueChanges
      .subscribe(value=> {
       if (this.exam_impro_type.dirty) {
              //do something
                console.log("form has changed:" + value)
              }
           });
    
  }

  addParameter( p, parameters: FormArray){
    var g = this.fb.group({
      id:[p["id"]],
      label:[p["label"]],
      exam_impro_parameter_id:[p["exam_impro_parameter_id"]],
      idx:[p["idx"]],
      description:[p["description"]],
      exam_impro_criteria:new FormArray([])
    })
    parameters.push(g) 
    for( let i =0; p["exam_impro_criteria"] && i<p["exam_impro_criteria"].length; i++){
      this.addCriteria( p["exam_impro_criteria"][i], g.controls.exam_impro_criteria as FormArray)
    } 
  }

  addCriteria( c, criteria_array:FormArray  ){
      var g = this.fb.group({
        id:[c["id"]],
        label:[c["label"]],
        exam_impro_ap_parameter_id:[c["exam_impro_ap_parameter_id"]],
        initially_selected:[c["initially_selected"]],
        idx:[c["idx"]],
        description:[c["description"]],
        exam_impro_question:new FormArray([])
      })
      criteria_array.push(g)
      for( let i =0; c["exam_impro_question"] && i<c["exam_impro_question"].length; i++){
        this.addQuestion( c["exam_impro_question"][i],  g.controls.exam_impro_question as FormArray)
      }
  }

  addQuestion( q, question_array:FormArray  ){
    var g = this.fb.group({
      id:[q["id"]],
      label:[q["label"]],
      exam_impro_criteria_id:[q["exam_impro_criteria_id"]],
      description:[q["description"]],
      points:[q["points"]],
      idx:[q["idx"]],
      itemized:[q["itemized"]],
      exam_impro_observation:new FormArray([])
    })
    question_array.push(g)
    for( let i =0;q["exam_impro_observation"] && i<q["exam_impro_observation"].length; i++){
      this.addObservation( q["exam_impro_observation"][i],  g.controls.exam_impro_observation as FormArray)
    }    
  }  

  addObservation( o, observation_array:FormArray  ){
    var g = this.fb.group({
      id:[o["id"]],
      exam_impro_question_id:[o["exam_impro_question_id"]],
      label:[o["label"]],
      description:[o["description"]],
      idx:[o["idx"]]
    })
    observation_array.push(g)
  }   


  newParameter( tipo:FormGroup  ){
    var parameters_array:FormArray = tipo.controls["exam_impro_parameter"] as FormArray
    var exam_impro_parameter_req = {
      exam_impro_parameter:{
        id:null,
        label:"Parameter_" + (parameters_array.length + 1),
        exam_impro_type_id:tipo.controls["id"].value,
        idx:parameters_array.controls.length 
      }
    }
    this.submitting = true;
    
    this.userLoginService.getUserIdToken().then( token => {

      this.examImprovisacionService.chenequeApiInterface("add", token, exam_impro_parameter_req).subscribe(
        data => {
          console.log(" parameter add has completed")
          var p = data["result"]["exam_impro_parameter"]
          this.addParameter( p , parameters_array)  
          this.submitting = false;      
        },
        error => {
          alert("error nuevo parametro:" + error.error)
          this.submitting = false; 
        }
      )
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })
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
        idx:criteria_array.controls.length,
        description:"" 
      }
    }

    this.userLoginService.getUserIdToken().then( token => {

      this.examImprovisacionService.chenequeApiInterface("add", token, exam_impro_criteria_req).subscribe(
        data => {
          console.log(" criteria add has completed")
          var c = data["result"]["exam_impro_criteria"]
          this.addCriteria(c, criteria_array)
          this.submitting = false;         
        },
        error => {
          alert("error nuevo criterio:" + error.error)
          this.submitting = false; 
        }
      )
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })
  }  

  dupCriteria( parameter:FormGroup, c:FormGroup  ){
    this.submitting = true; 
    var criteria_array:FormArray = parameter.controls["exam_impro_criteria"] as FormArray
    var request = {
      exam_impro_criteria:{
        id:null,
        label: c.controls.label.value + " " + criteria_array.controls.length,
        exam_impro_parameter_id:parameter.controls["id"].value,
        initially_selected:true,
        idx:criteria_array.controls.length,
        description:c.controls.description.value,
        exam_impro_question:[] 
      }
    }
    var questions:FormArray = c.controls.exam_impro_question as FormArray
    for(let i=0; i<questions.length; i++ ){
      let q:FormGroup = questions.controls[i] as FormGroup

      let nq = {
        id:null,
        label:q.controls["label"].value,
        description:q.controls["description"].value,
        points:q.controls["points"].value,
        itemized:q.controls["itemized"].value,
        idx:i,
        exam_impro_observation:[]
      }
      request["exam_impro_criteria"]["exam_impro_question"].push(nq)

      if( q.controls.exam_impro_observation ){
        var observation:FormArray = q.controls.exam_impro_observation as FormArray
        for( let oi=0; oi<observation.length; oi++){
          var o:FormGroup= observation.controls[oi] as FormGroup
          let new_o = {
            id:null,
            label:o.controls.label.value,
            description:o.controls.description.value,
            idx:oi
          }
          nq["exam_impro_observation"].push(new_o)
        }
      }
    }    

    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.chenequeApiInterface("add", token, request).subscribe(
        data => {
          console.log(" criteria add has completed")
          var c = data["result"]["exam_impro_criteria"]
          this.addCriteria(c, criteria_array)
          this.submitting = false;         
        },
        error => {
          alert("error nuevo criterio:" + error.error)
          this.submitting = false; 
        }
      )
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })
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
        exam_impro_criteria_id:criteria.controls["id"].value,
        idx:question_array.controls.length,
        itemized:0
      }
    }

    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.chenequeApiInterface("add", token, exam_impro_question_req).subscribe(
        data => {
          console.log(" questions add has completed")
          var q = data["result"]["exam_impro_question"]
          this.addQuestion(q, question_array)
          this.submitting = false;        
        },
        error => {
          alert("error nueva pregunta:" + error.error)
          this.submitting = false; 
        }
      )
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })
  }

  delParameter(t, p){

    if( !confirm("Esta seguro de querer borrar el parametro") ){
      return
    }
    this.submitting = true; 
    var exam_impro_parameter_request = {
      exam_impro_parameter:{
        id:p.controls.id.value
      }
    }

    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.chenequeApiInterface("delete", token, exam_impro_parameter_request).subscribe(
        data => {
          console.log("question has been erased")
          var parameter_array:FormArray = t.controls["exam_impro_parameter"] as FormArray
          for(var i=0; i<parameter_array.length; i++){
            var tp:FormGroup = parameter_array.controls[i] as FormGroup
            if( tp.controls["id"].value == p.controls.id.value){
              parameter_array.removeAt(i)
              this.updateTableIdx("exam_impro_parameter", parameter_array.controls as FormGroup[],i)
              break;
            }
          }
          this.submitting = false; 
        },
        error => {
          alert( "paramtero no pudo ser borrado:"  + error)
          this.submitting = false; 
        }
      )
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })
  }


  delCriteria(p, c){
    if( !confirm("Esta seguro de querer borrar el criterio") ){
      return
    }    
    this.submitting = true; 
    var exam_impro_criteria_request = {
      exam_impro_criteria:{
        id:c.controls.id.value
      }
    }
    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.chenequeApiInterface("delete", token, exam_impro_criteria_request).subscribe(
        data => {
          console.log("question has been erased")
          var criteria_array:FormArray = p.controls["exam_impro_criteria"] as FormArray
          for(var i=0; i<criteria_array.length; i++){
            var tc:FormGroup = criteria_array.controls[i] as FormGroup
            if( tc.controls["id"].value == c.controls.id.value){
              criteria_array.removeAt(i)
              this.updateTableIdx("exam_impro_criteria", criteria_array.controls as FormGroup[],i)
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
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })
  }

  delQuestion(c, q){
    this.submitting = false; 
    var exam_impro_question_request = {
      exam_impro_question:{
        id:q.controls.id.value
      }
    }
    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.chenequeApiInterface("delete", token, exam_impro_question_request).subscribe(
        data => {
          console.log("question has been erased")
          
          
          var question_array:FormArray = c.controls["exam_impro_question"] as FormArray
          
          for(var i=0; i<question_array.length; i++){
            var tq:FormGroup = question_array.controls[i] as FormGroup
            if( tq.controls["id"].value == q.controls.id.value){
              question_array.removeAt(i)
              this.updateTableIdx("exam_impro_question", question_array.controls as FormGroup[], i)
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
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })
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

    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.chenequeApiInterface("update", token, exam_impro_type_req).subscribe(
        data => {
          console.log(" type update has completed")
        },
        error => {
          alert("error:" + error.error)
        }
      )
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })

  }
  onChangeParameter(exam_impro_parameter){
    console.log("exam_impro_parameter")
    var exam_impro_parameter_req = {
      exam_impro_parameter:{
        label:exam_impro_parameter.controls["label"].value,
        description:exam_impro_parameter.controls["description"].value,
        where:{
          id:exam_impro_parameter.controls["id"].value
        }
      }      
    }

    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.chenequeApiInterface("update", token, exam_impro_parameter_req).subscribe(
        data => {
          console.log(" parameter update has completed")
        },
        error => {
          alert("error:" + error.error)
        }
      )
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })
  }

  onChangeCriteria(exam_impro_criteria){
    console.log("exam_impro_criteria")
    var exam_impro_criteria_req = {
      exam_impro_criteria:{
        label:exam_impro_criteria.controls["label"].value,
        description:exam_impro_criteria.controls["description"].value,
        initially_selected:exam_impro_criteria.controls["initially_selected"].value,
        where:{
          id:exam_impro_criteria.controls["id"].value
        }
      }
    }

    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.chenequeApiInterface("update",token, exam_impro_criteria_req).subscribe(
        data => {
          console.log("criteria update completed:" + exam_impro_criteria.controls["label"].value + " " + exam_impro_criteria.controls["initially_selected"].value)
        },
        error => {
          alert("error onChangeCriteria:" + error.error)
        }
      )
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })
  }

  
  onChangeQuestion(exam_impro_question){
    console.log("exam_impro_question")
    var exam_impro_question_req = {
      exam_impro_question:{
        label:exam_impro_question.controls["label"].value,
        description:exam_impro_question.controls["description"].value,
        points:exam_impro_question.controls["points"].value,
        itemized:exam_impro_question.controls["itemized"].value,
        where:{
          id:exam_impro_question.controls["id"].value
        }
      }
    }

    this.userLoginService.getUserIdToken().then( token => { 
      this.examImprovisacionService.chenequeApiInterface("update", token, exam_impro_question_req).subscribe(
        data => {
          console.log(" question update has completed")
        },
        error => {
          alert("error:" + error.error)
        }
      )
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })
  }
  getAnyClass(obj) {
    if (typeof obj === "undefined") return "undefined";
    if (obj === null) return "null";
    return obj.constructor.name;
  }   

  getformValue(){
    return JSON.stringify(this.exam_impro_type.value)
  } 

  updateTableIdx(tableName, formGroupArray:FormGroup[], from:number){
    var req = {
      
    }
    req[tableName] = []
    
    for(let i = from; i<formGroupArray.length; i++ ){
      var c =  {
        "idx":i,
        "where":{
            "id":formGroupArray[i].controls["id"].value
        }
      }
      req[tableName].push(c)
      formGroupArray[i].controls["idx"].setValue(i)
    }

    this.userLoginService.getUserIdToken().then( token => { 
      this.examImprovisacionService.chenequeApiInterface("update", token, req).subscribe(
        data => {
          console.log("completed")
        },
        error => {
          alert("error updating indexes:"  + error.errorCode + " " + error.errorMessage)
        }
      )
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })
  }


  upParameter(t, p){
    console.log("upParameter")
    var parameter_array:FormArray = t.controls["exam_impro_parameter"] as FormArray
    for(var i=1; i<parameter_array.length; i++){
      var tp:FormGroup = parameter_array.controls[i] as FormGroup
      if( tp.controls["id"].value == p.controls.id.value){
        let group = parameter_array.at(i)
        parameter_array.removeAt(i)
        parameter_array.insert(i-1,group)
        this.updateTableIdx("exam_impro_parameter", parameter_array.controls as FormGroup[],i-1)
        break;
      }
    }
  }

  downParameter(t, p){
    console.log("downParameter")
    var parameter_array:FormArray = t.controls["exam_impro_parameter"] as FormArray
    for(var i=0; i<parameter_array.length-1; i++){
      var tp:FormGroup = parameter_array.controls[i] as FormGroup
      if( tp.controls["id"].value == p.controls.id.value){
        let group = parameter_array.at(i)
        parameter_array.removeAt(i)
        parameter_array.insert(i+1,group)
        this.updateTableIdx("exam_impro_parameter", parameter_array.controls as FormGroup[],i)
        break;
      }
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container && 
      event.previousIndex!=event.currentIndex ) {
      var formGroupArray:FormGroup[] = event.item.data.controls.exam_impro_criteria.controls as FormGroup[]
      moveItemInArray(event.item.data.controls.exam_impro_criteria.controls, event.previousIndex, event.currentIndex);
      this.updateTableIdx("exam_impro_criteria", formGroupArray,event.previousIndex<event.currentIndex?event.previousIndex:event.currentIndex)
    } 
  } 
  onDragMove(event: CdkDragDrop<any>) {
    console.log("ondragmove:" + event)
  }

  upQuestion(c, q){
    console.log("upQuestion")
    var questions_array:FormArray = c.controls["exam_impro_question"] as FormArray
    for(var i=1; i<questions_array.length; i++){
      var qg:FormGroup = questions_array.controls[i] as FormGroup
      if( qg.controls["id"].value == q.controls.id.value){
        let group = questions_array.at(i)
        questions_array.removeAt(i)
        questions_array.insert(i-1,group)
        this.updateTableIdx("exam_impro_question", questions_array.controls as FormGroup[],i-1)
        break;
      }
    }
  }

  downQuestion(c, q){
    console.log("downParameter")
    var questions_array:FormArray = c.controls["exam_impro_question"] as FormArray
    for(var i=0; i<questions_array.length-1; i++){
      var qg:FormGroup = questions_array.controls[i] as FormGroup
      if( qg.controls["id"].value == q.controls.id.value){
        let group = questions_array.at(i)
        questions_array.removeAt(i)
        questions_array.insert(i+1,group)
        this.updateTableIdx("exam_impro_question", questions_array.controls as FormGroup[],i)
        break;
      }
    }
  } 

  newObservation( question:FormGroup  ){
    this.submitting = true; 
    var observation_array:FormArray = question.controls["exam_impro_observation"] as FormArray
    var exam_impro_observation_req = {
      exam_impro_observation:{
        id:null,
        exam_impro_question_id:question.controls.id.value,
        label:"",
        description:"",
        idx:observation_array.length
      }
    }

    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.chenequeApiInterface("add", token, exam_impro_observation_req).subscribe(
        data => {
          console.log(" observation add has completed")
          var o = data["result"]["exam_impro_observation"]
          this.addObservation( o, observation_array)
          this.submitting = false;        
        },
        error => {
          alert("error nueva observation:" + error.error );           
          this.submitting = false; 
        }
      )
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })
  }  
  onChangeObservation(observation){
    console.log("exam_impro_observation")
    var exam_impro_observation_req = {
      exam_impro_observation:{
        label:observation.controls["label"].value,
        description:observation.controls["description"].value,
        where:{
          id:observation.controls["id"].value
        }
      }
    }

    this.userLoginService.getUserIdToken().then( token => { 
      this.examImprovisacionService.chenequeApiInterface("update", token, exam_impro_observation_req).subscribe(
        data => {
          console.log(" question update has completed")
        },
        error => {
          alert("error:" + error.error)
        }
      )
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })
  }
 
  delObservation( q, o){
    this.submitting = false; 
    var request = {
      exam_impro_observation:{
        id:o.controls.id.value
      }
    }
    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.chenequeApiInterface("delete", token, request).subscribe(
        data => {
          console.log("observation has been erased")
          
          
          var observation_array:FormArray = q.controls["exam_impro_observation"] as FormArray
          
          for(var i=0; i<observation_array.length; i++){
            var fg:FormGroup = observation_array.controls[i] as FormGroup
            if( fg.controls["id"].value == o.controls.id.value){
              observation_array.removeAt(i)
              this.updateTableIdx("exam_impro_observation", observation_array.controls as FormGroup[], i)
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
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })
  }

  upObservation(q, o){
    console.log("upObservacion")
    var observation_array:FormArray = q.controls["exam_impro_observation"] as FormArray
    for(var i=1; i<observation_array.length; i++){
      var og:FormGroup = observation_array.controls[i] as FormGroup
      if( og.controls["id"].value == o.controls.id.value){
        let group = observation_array.at(i)
        observation_array.removeAt(i)
        observation_array.insert(i-1,group)
        this.updateTableIdx("exam_impro_observation", observation_array.controls as FormGroup[],i-1)
        break;
      }
    }
  }

  downObservation(q, o){
    console.log("downObservation")
    var observation_array:FormArray = q.controls["exam_impro_observation"] as FormArray
    for(var i=0; i<observation_array.length-1; i++){
      var g:FormGroup = observation_array.controls[i] as FormGroup
      if( g.controls["id"].value == o.controls.id.value){
        let group = observation_array.at(i)
        observation_array.removeAt(i)
        observation_array.insert(i+1,group)
        this.updateTableIdx("exam_impro_observation", observation_array.controls as FormGroup[],i)
        break;
      }
    }
  } 


}
