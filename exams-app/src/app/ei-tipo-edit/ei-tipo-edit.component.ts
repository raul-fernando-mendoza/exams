import { Component, NgZone, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamenesImprovisacionService} from '../examenes-improvisacion.service';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {take} from 'rxjs/operators';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { UserLoginService } from '../user-login.service';
import { Observable } from 'rxjs';
import { Aspect, Criteria, Parameter, Exam, ExamParameterRequest, ParameterCriteriaRequest, CriteriaAspectRequest, ParameterRequest, CriteriaRequest, AspectRequest, ExamRequest, CriteriaGradeRequest} from 'src/app/exams/exams.module'


@Component({
  selector: 'app-ei-tipo-edit',
  templateUrl: './ei-tipo-edit.component.html',
  styleUrls: ['./ei-tipo-edit.component.css']
})



export class EiTipoEditComponent implements OnInit {




  exam = this.fb.group({
    id: [null, Validators.required],
    label:["nombre tipo de examen", Validators.required],   
    description:[""],
    parameters: new FormArray([])
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
      this.id = this.route.snapshot.paramMap.get('id')
  
  }

  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1))
        .subscribe(() => this.autosize.resizeToFitContent(true));
  }  
  
  getFormGroupArray (fg:FormGroup, controlname:string): FormGroup[] {
    if( fg == null){
      console.error("ERRO controls for " + controlname + " in " + fg)
    }
    var fa:FormArray =  fg.controls[controlname] as FormArray
    if( fa == null){
      console.error("I can not find controls for:" + controlname)
    }
    return fa.controls as FormGroup[]
  }

  ngOnInit(): void {
    this.loadExamType()
  }

  loadExamType(): void {

    this.exam.controls.id.setValue( this.id )
    this.exam.controls.label.setValue(null)

    var parameter: FormArray = this.exam.controls.parameters as FormArray
    parameter.clear()

    
    if( this.id ){
      var req:ExamRequest = {
        exams:{
          id:this.id,
          label:null,
          description:null,
          parameters:[{
            id:null,
            idx:null,
            label:null,
            scoreType:null,
            description:null,
            criterias:[{
              id:null,
              idx:null,
              label:null,
              initiallySelected:null,
              description:null,
              aspects:[{
                id:null,
                idx:null,
                label:null,
                description:null
              }]
            }]
          }],
        }
      }
      this.userLoginService.getUserIdToken().then( token => {

        this.examImprovisacionService.firestoreApiInterface("get", token, req).subscribe(
          data => { 
            let t:Exam = data["result"];
            this.exam.controls.id.setValue(t.id)
            this.exam.controls.label.setValue(t.label)
            this.exam.controls.description.setValue( t.description ? t.description : "" )
            var parameter_arr:FormArray = this.exam.controls.parameters as FormArray

            for( let i =0;t.parameters && i<t.parameters.length; i++){
              var p = t.parameters[i]
              this.addParameter(p , parameter_arr)
            }

            parameter_arr.controls.sort( (a, b) => {
              var afg:FormGroup = a as FormGroup 
              var bfg:FormGroup = b as FormGroup
              return  afg.controls.idx.value - bfg.controls.idx.value 
            })
          },     
          error => {
            alert("error loading impro type")
            console.log("Error loading ExamType:" + error.error)
          }
        )
      },
      error => {
        alert("Error in token:" + error.errorCode + " " + error.errorMessage)
      }) 
    }
  }

  addParameter( p, parameters: FormArray){
    var g = this.fb.group({
      id:[p["id"]],
      label:[p["label"]],
      scoreType:[p["scoreType"]],
      idx:[p["idx"]],
      description:[p["description"]],
      criterias:new FormArray([])
    })
    parameters.push(g) 

    var criterias_arr = g.controls.criterias as FormArray
    for( let i =0; p["criterias"] && i<p["criterias"].length; i++){
      this.addCriteria( p["criterias"][i], criterias_arr)
    } 
    criterias_arr.controls.sort( (a, b) => {
      var afg:FormGroup = a as FormGroup 
      var bfg:FormGroup = b as FormGroup
      return  afg.controls.idx.value - bfg.controls.idx.value 
    })    
  }

  addCriteria( c, criteria_array:FormArray  ){
      var g = this.fb.group({
        id:[c["id"]],
        label:[c["label"]],
        initiallySelected:[c["initiallySelected"]],
        idx:[c["idx"]],
        description:[c["description"]],
        aspects:new FormArray([])
      })
      criteria_array.push(g)

      var aspects_arr = g.controls.aspects as FormArray
      for( let i =0; c["aspects"] && i<c["aspects"].length; i++){
        this.addAspect( c["aspects"][i],  aspects_arr)
      }
      aspects_arr.controls.sort( (a, b) => {
        var afg:FormGroup = a as FormGroup 
        var bfg:FormGroup = b as FormGroup
        return  afg.controls.idx.value - bfg.controls.idx.value 
      })      
  }

  addAspect( a, aspects_array:FormArray  ){
    var g = this.fb.group({
      id:[a["id"]],
      idx:[a["idx"]],      
      label:[a["label"]],
      description:[a["description"]]
    })
    aspects_array.push(g)
  }  

  newParameter( tipo:FormGroup  ){
    var parameters_array:FormArray = tipo.controls.parameters as FormArray
    var req:ExamParameterRequest = {
      exams:{
        id:this.id,
        parameters:{
          id:null,
          idx:parameters_array.controls.length,
          scoreType:"starts",
          label:"Parameter_" + (parameters_array.length + 1)          
        }
      }
    }
    this.submitting = true;
    
    this.userLoginService.getUserIdToken().then( token => {

      this.examImprovisacionService.firestoreApiInterface("addSubCollection", token, req).subscribe(
        data => {
          console.log(" parameter add has completed")
          var p:Parameter = data["result"]
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
    var criteria_array:FormArray = parameter.controls.criterias as FormArray
    var req:ParameterCriteriaRequest = {
      parameters:{
        id: parameter.controls.id.value, 
        criterias:{
          id:null,
          label:"Criterio_" + (criteria_array.length + 1),
          initiallySelected:true,
          idx:criteria_array.controls.length,
          description:"" 
        }
      }
    }

    this.userLoginService.getUserIdToken().then( token => {

      this.examImprovisacionService.firestoreApiInterface("addSubCollection", token, req).subscribe(
        data => {
          console.log(" criteria add has completed")
          var c = data["result"]
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

  newAspect( criteria:FormGroup  ){
    this.submitting = true; 
    var question_array:FormArray = criteria.controls.aspects as FormArray
    var req:CriteriaAspectRequest = {
      criterias:{
        id:criteria.controls.id.value,
        aspects:{
          id:null,
          idx:question_array.controls.length,
          label:"",
          description:""
        }
      }
    }

    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.firestoreApiInterface("addSubCollection", token, req).subscribe(
        data => {
          console.log(" aspects add has completed")
          var a = data["result"]
          this.addAspect(a, question_array)
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


  /*
  copyDataCriteria(c:FormGroup){
    var criteria:Criteria={
      id:null,
      idx:c.controls.idx.value,
      label: c.controls.label.value,
      initiallySelected:c.controls.initiallySelected.value,
      description:c.controls.description.value,
      aspects:[]
    }
    var aspect_array:FormArray = c.controls.criteria as FormArray
    for(let i=0; i<aspect_array.length;  i++){
      var a:FormGroup = aspect_array.controls[i] as FormGroup
      var aspect_data = this.copyDataAspect(a)
      criteria.aspects.push(aspect_data)
    } 
    return criteria   
  }

  copyDataParameter(p:FormGroup){
    var parameter:Parameter={
      id:null,
      label:p.controls.label.value,
      
      idx:p.controls.idx.value,
      criterias:[]
    } 
    var criteria_array:FormArray = p.controls.criterias as FormArray
    for(let i=0; i<criteria_array.length;  i++){
      var c:FormGroup = criteria_array.controls[i] as FormGroup
      var c_data = this.copyDataCriteria(c)
      parameter.criterias.push(c_data)
    }
    return parameter;

  }
  
*/
  dupParameter( exam:FormGroup, p:FormGroup){
  
    var req:ParameterRequest = {
      parameters:{
        id:p.controls.id.value
      }
    }

    this.submitting = true;
    
    this.userLoginService.getUserIdToken().then( token => {

      this.examImprovisacionService.firestoreApiInterface("dupSubCollection", token, req).subscribe(
        data => {
          console.log(" parameter add has completed")
          var newParameter = data["result"]
          var parameters_array = exam.controls.parameters as FormArray
          this.addParameter( newParameter , parameters_array)  
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


  dupCriteria( parameter:FormGroup, c:FormGroup  ){
    this.submitting = true; 
    var criteria_array:FormArray = parameter.controls.criterias as FormArray
    var req:CriteriaRequest = {
      criterias:{
        id:c.controls.id.value
      }
    }

    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.firestoreApiInterface("dupSubCollection", token, req).subscribe(
        data => {
          console.log(" criteria add has completed")
          var newCriteria = data["result"]
          criteria_array = parameter.controls.criterias as FormArray
          this.addCriteria(newCriteria, criteria_array)
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



  delParameter(t, p){

    if( !confirm("Esta seguro de querer borrar el parametro") ){
      return
    }
    this.submitting = true; 
    var req:ParameterRequest = {
      parameters:{
        id:p.controls.id.value
      }
    }

    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.firestoreApiInterface("delete", token, req).subscribe(
        data => {
          console.log("parameter has been erased")
          var parameters_array:FormArray = t.controls.parameters as FormArray
          for(var i=0; i<parameters_array.length; i++){
            var pg:FormGroup = parameters_array.controls[i] as FormGroup
            if( pg.controls.id.value == p.controls.id.value){
              parameters_array.removeAt(i)
              //this.updateTableIdx("criteria", criteria_array.controls as FormGroup[],i)
              break;
            }
          }
          this.submitting = false;
        },
        error => {
          alert( "parametro no pudo ser borrado:"  + error)
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
    var req:CriteriaRequest = {
      criterias:{
        id:c.controls.id.value
      }
    }
    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.firestoreApiInterface("delete", token, req).subscribe(
        data => {
          console.log("question has been erased")
          var criteria_array:FormArray = p.controls.criterias as FormArray
          for(var i=0; i<criteria_array.length; i++){
            var tc:FormGroup = criteria_array.controls[i] as FormGroup
            if( tc.controls.id.value == c.controls.id.value){
              criteria_array.removeAt(i)
              //this.updateTableIdx("criteria", criteria_array.controls as FormGroup[],i)
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

  delAspect(c, a){
    this.submitting = false; 
    var req:AspectRequest = {
      aspects:{
        id:a.controls.id.value
      }
    }
    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.firestoreApiInterface("delete", token, req).subscribe(
        data => {
          console.log("aspect has been erased")
          
          
          var aspects_array:FormArray = c.controls.aspects as FormArray
          
          for(var i=0; i<aspects_array.length; i++){
            var tq:FormGroup = aspects_array.controls[i] as FormGroup
            if( tq.controls.id.value == a.controls.id.value){
              aspects_array.removeAt(i)
              //this.updateTableIdx("criteria", aspects_array.controls as FormGroup[], i)
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

  onChangeExam(exam){
    console.log("exam")
    var req:ExamRequest = {
      exams:{
        id:exam.controls.id.value,
        label:exam.controls.label.value,
        description:exam.controls.description.value
      }
    }

    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.firestoreApiInterface("update", token, req).subscribe(
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

  onChangeParameter(parameter){
    console.log("parameter")
    var req:ParameterRequest = {
      parameters:{
        id:parameter.controls.id.value,
        label:parameter.controls.label.value,
        scoreType:parameter.controls.scoreType.value,
        description:parameter.controls.description.value,
      }      
    }

    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.firestoreApiInterface("update", token, req).subscribe(
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

  onChangeCriteria(criteria){
    console.log("criteria")
    var req:CriteriaRequest= {
      criterias:{
        id:criteria.controls.id.value,
        label:criteria.controls.label.value,
        description:criteria.controls.description.value,
        initiallySelected:criteria.controls.initiallySelected.value,
      }
    }

    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.firestoreApiInterface("update",token, req).subscribe(
        data => {
          console.log("criteria update completed:" + criteria.controls.label.value + " " + criteria.controls.initiallySelected.value)
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

  
  onChangeAspect(aspect){
    console.log("criteria")
    var req:AspectRequest = {
      aspects:{
        id:aspect.controls.id.value,
        label:aspect.controls.label.value,
        description:aspect.controls.description.value
      }
    }

    this.userLoginService.getUserIdToken().then( token => { 
      this.examImprovisacionService.firestoreApiInterface("update", token, req).subscribe(
        data => {
          console.log("aspect update has completed")
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
    return JSON.stringify(this.exam.value)
  } 
/*
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
      this.examImprovisacionService.firestoreApiInterface("update", token, req).subscribe(
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

*/
  upParameter(t, p){
    console.log("upParameter")
    var parameter_array:FormArray = t.controls.parameters as FormArray
    for(var i=1; i<parameter_array.length; i++){
      var g:FormGroup = parameter_array.controls[i] as FormGroup
      if( g.controls.id.value == p.controls.id.value){
        let group = parameter_array.at(i)
        parameter_array.removeAt(i)
        parameter_array.insert(i-1,group)
        var req = {
          exams:{
            id:t.controls.id.value,
            parameters:{
              id: p.controls.id.value,
              idx:i-1
            }
          }
        }
    
        this.userLoginService.getUserIdToken().then( token => { 
          this.examImprovisacionService.firestoreApiInterface("moveSubCollectionIndex", token, req).subscribe(
            data => {
              console.log("aspect upParameter has completed")
            },
            error => {
              alert("error:" + error.error)
            }
          )
        },
        error => {
          alert("Error in token:" + error.errorCode + " " + error.errorMessage)
        })
        break;
      }
    }
  }

  downParameter(t, p){
    console.log("downParameter")
    console.log("upParameter")
    var parameter_array:FormArray = t.controls.parameters as FormArray
    for(var i=0; i<parameter_array.length-1; i++){
      var g:FormGroup = parameter_array.controls[i] as FormGroup
      if( g.controls.id.value == p.controls.id.value){
        let group = parameter_array.at(i)
        parameter_array.removeAt(i)
        parameter_array.insert(i+1,group)
        var req = {
          exams:{
            id:t.controls.id.value,
            parameters:{
              id: p.controls.id.value,
              idx:i+1
            }
          }
        }
    
        this.userLoginService.getUserIdToken().then( token => { 
          this.examImprovisacionService.firestoreApiInterface("moveSubCollectionIndex", token, req).subscribe(
            data => {
              console.log("aspect downParameter has completed")
            },
            error => {
              alert("error:" + error.error)
            }
          )
        },
        error => {
          alert("Error in token:" + error.errorCode + " " + error.errorMessage)
        })
        break;
      }
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container && 
      event.previousIndex!=event.currentIndex ) {
        
      var p:FormGroup = event.item.data as FormGroup
      var criterias_array:FormArray = p.controls.criterias as FormArray
      var c:FormGroup = criterias_array.controls[event.previousIndex] as FormGroup
      moveItemInArray(criterias_array.controls, event.previousIndex, event.currentIndex);
      
      var req = {
        parameters:{
          id:p.controls.id.value,
          criterias:{
            id: c.controls.id.value,
            idx:event.currentIndex
          }
        }
      }
  
      this.userLoginService.getUserIdToken().then( token => { 
        this.examImprovisacionService.firestoreApiInterface("moveSubCollectionIndex", token, req).subscribe(
          data => {
            console.log("aspect downParameter has completed")
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
  
  } 
  onDragMove(event: CdkDragDrop<any>) {
    console.log("ondragmove:" + event)
  }

  upAspect(c, a){
    console.log("upAspect")
    var aspects_array:FormArray = c.controls.aspects as FormArray
    for(var i=1; i<aspects_array.length; i++){
      var qg:FormGroup = aspects_array.controls[i] as FormGroup
      if( qg.controls.id.value == a.controls.id.value){
        let group = aspects_array.at(i)
        aspects_array.removeAt(i)
        aspects_array.insert(i-1,group)
        
        var req = {
          criterias:{
            id:c.controls.id.value,
            aspects:{
              id: a.controls.id.value,
              idx:i-1
            }
          }
        }
    
        this.userLoginService.getUserIdToken().then( token => { 
          this.examImprovisacionService.firestoreApiInterface("moveSubCollectionIndex", token, req).subscribe(
            data => {
              console.log("aspect reorder has completed")
              
            },
            error => {
              alert("error:" + error.error)
            }
          )
        },
        error => {
          alert("Error in token:" + error.errorCode + " " + error.errorMessage)
        })
        break;
      }
    }
  }

  downAspect(c, a){
    console.log("downParameter")
    var aspects_array:FormArray = c.controls.aspects as FormArray
    for(var i=0; i<aspects_array.length-1; i++){
      var qg:FormGroup = aspects_array.controls[i] as FormGroup
      if( qg.controls.id.value == a.controls.id.value){
        let group = aspects_array.at(i)
        aspects_array.removeAt(i)
        aspects_array.insert(i+1,group)
        
        var req = {
          criterias:{
            id:c.controls.id.value,
            aspects:{
              id: a.controls.id.value,
              idx:i+1
            }
          }
        }
    
        this.userLoginService.getUserIdToken().then( token => { 
          this.examImprovisacionService.firestoreApiInterface("moveSubCollectionIndex", token, req).subscribe(
            data => {
              console.log("aspect reorder has completed")
            },
            error => {
              alert("error:" + error.error)
            }
          )
        },
        error => {
          alert("Error in token:" + error.errorCode + " " + error.errorMessage)
        })
        break;
      }
    }
  } 

}
