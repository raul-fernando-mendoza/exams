import { Component, NgZone, ViewChild, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamenesImprovisacionService} from '../examenes-improvisacion.service';
import { CdkTextareaAutosize} from '@angular/cdk/text-field';
import { take} from 'rxjs/operators';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { UserLoginService } from '../user-login.service';
import { Exam, Parameter, ExamRequest, ParameterRequest, CriteriaRequest, AspectRequest, MateriaRequest, Materia} from 'src/app/exams/exams.module'
import { MatSelectChange} from '@angular/material/select';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-ei-tipo-edit',
  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule   
   
    ,FormsModule
    ,ReactiveFormsModule
    ,MatFormFieldModule
    
    ,MatProgressSpinnerModule 

  ],    
  templateUrl: './ei-tipo-edit.component.html',
  styleUrls: ['./ei-tipo-edit.component.css']
})



export class EiTipoEditComponent implements OnInit {




  e = this.fb.group({
    id: [null, Validators.required],
    isDeleted:[false],
    label:["Nombre de la materia", Validators.required],   
    description:[""],
    isRequired:[false],
    parameters: new UntypedFormArray([])
  })
  
  materia_id:string
  exam_id:string
  submitting = false




  constructor(private fb: UntypedFormBuilder
    , private route: ActivatedRoute
    , private router: Router
    , private examImprovisacionService: ExamenesImprovisacionService
    , private formBuilder: UntypedFormBuilder
    , private _ngZone: NgZone
    , private userLoginService: UserLoginService) {
      this.materia_id = this.route.snapshot.paramMap.get('materia_id')
      this.exam_id = this.route.snapshot.paramMap.get('exam_id')
  
  }

  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1))
        .subscribe(() => this.autosize.resizeToFitContent(true));
  }  
  
  getFormGroupArray (fg:UntypedFormGroup, controlname:string): UntypedFormGroup[] {
    if( fg == null){
      console.error("ERRO controls for " + controlname + " in " + fg)
    }
    var fa:UntypedFormArray =  fg.controls[controlname] as UntypedFormArray
    if( fa == null){
      console.error("I can not find controls for:" + controlname)
    }
    return fa.controls as UntypedFormGroup[]
  }

  ngOnInit(): void {
    this.loadExamType()
  }


  loadExamType(): void {

    this.e.controls.id.setValue( this.exam_id )
    this.e.controls.label.setValue(null)

    var parameter: UntypedFormArray = this.e.controls.parameters as UntypedFormArray
    parameter.clear()

    
    if(this.materia_id && this.exam_id ){
      var req:MateriaRequest = {
        materias:{
          id:this.materia_id,
          exams:[{
            id:this.exam_id,
            label:null,
            description:null,
            isRequired:null,
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
          }]
        }  
      }
      this.submitting = true
      this.userLoginService.getUserIdToken().then( token => {

        this.examImprovisacionService.firestoreApiInterface("get", token, req).subscribe(
          data => { 
            this.submitting = false
            let m:Materia = data["result"];
            let t:Exam = m.exams[0]
            this.e.controls.id.setValue(t.id)
            this.e.controls.label.setValue(t.label)
            this.e.controls.description.setValue( t.description ? t.description : "" )
            this.e.controls.isRequired.setValue(t.isRequired ? t.isRequired : false)
            var parameter_arr:UntypedFormArray = this.e.controls.parameters as UntypedFormArray

            for( let i =0;t.parameters && i<t.parameters.length; i++){
              var p = t.parameters[i]
              this.addParameter(p , parameter_arr)
            }

            parameter_arr.controls.sort( (a, b) => {
              var afg:UntypedFormGroup = a as UntypedFormGroup 
              var bfg:UntypedFormGroup = b as UntypedFormGroup
              return  afg.controls.idx.value - bfg.controls.idx.value 
            })
          },     
          error => {
            this.submitting = false
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

  addParameter( p, parameters: UntypedFormArray){
    var g = this.fb.group({
      id:[p["id"]],
      label:[p["label"]],
      scoreType:[p["scoreType"]],
      idx:[p["idx"]],
      description:[p["description"]],
      criterias:new UntypedFormArray([])
    })
    parameters.push(g) 

    var criterias_arr = g.controls.criterias as UntypedFormArray
    for( let i =0; p["criterias"] && i<p["criterias"].length; i++){
      this.addCriteria( p["criterias"][i], criterias_arr)
    } 
    criterias_arr.controls.sort( (a, b) => {
      var afg:UntypedFormGroup = a as UntypedFormGroup 
      var bfg:UntypedFormGroup = b as UntypedFormGroup
      return  afg.controls.idx.value - bfg.controls.idx.value 
    })    
  }

  addCriteria( c, criteria_array:UntypedFormArray  ){
      var g = this.fb.group({
        id:[c["id"]],
        label:[c["label"]],
        initiallySelected:[c["initiallySelected"]],
        idx:[c["idx"]],
        description:[c["description"]],
        aspects:new UntypedFormArray([])
      })
      criteria_array.push(g)

      var aspects_arr = g.controls.aspects as UntypedFormArray
      for( let i =0; c["aspects"] && i<c["aspects"].length; i++){
        this.addAspect( c["aspects"][i],  aspects_arr)
      }
      aspects_arr.controls.sort( (a, b) => {
        var afg:UntypedFormGroup = a as UntypedFormGroup 
        var bfg:UntypedFormGroup = b as UntypedFormGroup
        return  afg.controls.idx.value - bfg.controls.idx.value 
      })      
  }

  addAspect( a, aspects_array:UntypedFormArray  ){
    var g = this.fb.group({
      id:[a["id"]],
      idx:[a["idx"]],      
      label:[a["label"]],
      description:[a["description"]]
    })
    aspects_array.push(g)
  }  

  newParameter( e:UntypedFormGroup ){
    var parameters_array:UntypedFormArray = e.controls.parameters as UntypedFormArray
    var req:ParameterRequest = {
      materias:{
        id:this.materia_id,
        exams:{
          id:e.controls.id.value,
          parameters:{
            id:null,
            idx:parameters_array.controls.length,
            scoreType:"starts",
            label:"Parameter_" + (parameters_array.length + 1)          
          }
        }
  
      }
      
    }
    
    
    this.userLoginService.getUserIdToken().then( token => {

      this.examImprovisacionService.firestoreApiInterface("addSubCollection", token, req).subscribe(
        data => {
          console.log(" parameter add has completed")
          var p:Parameter = data["result"]
          this.addParameter( p , parameters_array)  
              
        },
        error => {
          alert("error nuevo parametro:" + error.error)
          
        }
      )
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })
  }

  newCriteria( e:UntypedFormGroup, p:UntypedFormGroup  ){
   
    var criteria_array:UntypedFormArray = p.controls.criterias as UntypedFormArray
    var req:CriteriaRequest = {
      materias:{
        id:this.materia_id,
        exams:{
          id:e.controls.id.value,
          parameters:{      
            id: p.controls.id.value, 
            criterias:{
              id:null,
              label:"Criterio_" + (criteria_array.length + 1),
              initiallySelected:true,
              idx:criteria_array.controls.length,
              description:"" 
            }
          }
        }
      }
    }

    this.userLoginService.getUserIdToken().then( token => {

      this.examImprovisacionService.firestoreApiInterface("addSubCollection", token, req).subscribe(
        data => {
          console.log(" criteria add has completed")
          var c = data["result"]
          this.addCriteria(c, criteria_array)
                  
        },
        error => {
          alert("error nuevo criterio:" + error.error)
          
        }
      )
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })
  }

  newAspect( e:UntypedFormGroup, p:UntypedFormGroup, c:UntypedFormGroup  ){
    
    var question_array:UntypedFormArray = c.controls.aspects as UntypedFormArray
    var req:AspectRequest = {
      materias:{
        id:this.materia_id,
        exams:{
          id:e.controls.id.value,
          parameters:{      
            id: p.controls.id.value, 
            criterias:{      
              id:c.controls.id.value,
              aspects:{
                id:null,
                idx:question_array.controls.length,
                label:"",
                description:""
              }
            }
          }
        }
      }
    }

    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.firestoreApiInterface("addSubCollection", token, req).subscribe(
        data => {
          console.log(" aspects add has completed")
          var a = data["result"]
          this.addAspect(a, question_array)
                 
        },
        error => {
          alert("error nueva pregunta:" + error.error)
         
        }
      )
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })
  }


  dupParameter( e:UntypedFormGroup, p:UntypedFormGroup){
  
    var req:ParameterRequest = {
      materias:{
        id:this.materia_id,
        exams:{
          id:e.controls.id.value,
          parameters:{
            id:p.controls.id.value
          }
        }
      }
    }

    this.submitting = true;
    
    this.userLoginService.getUserIdToken().then( token => {

      this.examImprovisacionService.firestoreApiInterface("dupSubCollection", token, req).subscribe(
        data => {
          console.log(" parameter add has completed")
          var newParameter = data["result"]
          var parameters_array = e.controls.parameters as UntypedFormArray
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


  dupCriteria( e:UntypedFormGroup, p:UntypedFormGroup, c:UntypedFormGroup  ){
    this.submitting = true; 
    var criteria_array:UntypedFormArray = p.controls.criterias as UntypedFormArray
    var req:CriteriaRequest = {
      materias:{
        id:this.materia_id,
        exams:{
          id:e.controls.id.value,
          parameters:{
            id:p.controls.id.value,
            criterias:{
              id:c.controls.id.value
            }
          }
        }
      }
    }

    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.firestoreApiInterface("dupSubCollection", token, req).subscribe(
        data => {
          console.log(" criteria add has completed")
          var newCriteria = data["result"]
          criteria_array = p.controls.criterias as UntypedFormArray
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



  delParameter(e:UntypedFormGroup, p:UntypedFormGroup){

    if( !confirm("Esta seguro de querer borrar el parametro") ){
      return
    }
    this.submitting = true; 
    var req:ParameterRequest = {
      materias:{
        id:this.materia_id,
        exams:{
          id:e.controls.id.value,
          parameters:{
            id:p.controls.id.value
          }
        }
      }
    }

    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.firestoreApiInterface("delete", token, req).subscribe(
        data => {
          console.log("parameter has been erased")
          var parameters_array:UntypedFormArray = e.controls.parameters as UntypedFormArray
          for(var i=0; i<parameters_array.length; i++){
            var pg:UntypedFormGroup = parameters_array.controls[i] as UntypedFormGroup
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


  delCriteria(e:UntypedFormGroup, p:UntypedFormGroup, c:UntypedFormGroup){
    if( !confirm("Esta seguro de querer borrar el criterio") ){
      return
    }    
    this.submitting = true; 
    var req:CriteriaRequest = {
      materias:{
        id:this.materia_id,
        exams:{
          id:e.controls.id.value,
          parameters:{
            id:p.controls.id.value,
            criterias:{
              id:c.controls.id.value
            }
          }
        }
      }
    }
    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.firestoreApiInterface("delete", token, req).subscribe(
        data => {
          console.log("question has been erased")
          var criteria_array:UntypedFormArray = p.controls.criterias as UntypedFormArray
          for(var i=0; i<criteria_array.length; i++){
            var tc:UntypedFormGroup = criteria_array.controls[i] as UntypedFormGroup
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

  delAspect(e:UntypedFormGroup,p:UntypedFormGroup, c:UntypedFormGroup, a:UntypedFormGroup){
    this.submitting = false; 
    var req:AspectRequest = {
      materias:{
        id:this.materia_id,
        exams:{
          id:e.controls.id.value,
          parameters:{
            id:p.controls.id.value,
            criterias:{
              id:c.controls.id.value,
              aspects:{
                id:a.controls.id.value
              }
            }
          }
        }
      }
    }
    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.firestoreApiInterface("delete", token, req).subscribe(
        data => {
          console.log("aspect has been erased")
          
          
          var aspects_array:UntypedFormArray = c.controls.aspects as UntypedFormArray
          
          for(var i=0; i<aspects_array.length; i++){
            var tq:UntypedFormGroup = aspects_array.controls[i] as UntypedFormGroup
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

  onChangeExam(e:UntypedFormGroup){
    console.log("exam")
    var req:ExamRequest = {
      materias:{
        id:this.materia_id,
        exams:{
          id:e.controls.id.value,
          label:e.controls.label.value,
          description:e.controls.description.value,
          isRequired:e.controls.isRequired.value
        }
      }
    }

    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.firestoreApiInterface("update", token, req).subscribe(
        data => {
          console.log(" type update has completed")
        },
        error => {
          alert("error type update:" + error.error)
        }
      )
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })

  }

  onChangeExamProperty(event:MatSelectChange, exam:UntypedFormGroup){
    console.log("exam")
    var propertyName = event.source.ngControl.name
    var req:ExamRequest = {
      materias:{
        id:this.materia_id,
        exams:{
          id:exam.controls.id.value
        }
      }
    }
    req.materias[0].exams[propertyName] = event.value

    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.firestoreApiInterface("update", token, req).subscribe(
        data => {
          console.log(" type update has completed")
        },
        error => {
          alert("Error onChangeExamProperty:" + error.error)
        }
      )
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })

  }  

  onChangeParameter(e:UntypedFormGroup, p:UntypedFormGroup){
    console.log("parameter")
    var req:ParameterRequest = {
      materias:{
        id:this.materia_id,
        exams:{
          id:e.controls.id.value,      
          parameters:{
            id:p.controls.id.value,
            label:p.controls.label.value,
            scoreType:p.controls.scoreType.value,
            description:p.controls.description.value,
          }      
        }
      }
    }

    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.firestoreApiInterface("update", token, req).subscribe(
        data => {
          console.log(" parameter update has completed")
        },
        error => {
          alert("error:" + error.error)
          console.log(error.error)
        }
      )
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })
  }

  onChangeCriteria(e:UntypedFormGroup, p:UntypedFormGroup, c:UntypedFormGroup){
    console.log("criteria")
    var req:CriteriaRequest= {
      materias:{
        id:this.materia_id,
        exams:{
          id:e.controls.id.value,
          parameters:{
            id:p.controls.id.value,
            criterias:{
              id:c.controls.id.value,
              label:c.controls.label.value,
              description:c.controls.description.value,
              initiallySelected:c.controls.initiallySelected.value,
            }
          }
        }
      }
    }

    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.firestoreApiInterface("update",token, req).subscribe(
        data => {
          console.log("criteria update completed:" + c.controls.label.value + " " + c.controls.initiallySelected.value)
        },
        error => {
          alert("error onChangeCriteria:" + error.error)
          console.log(error.error)
        }
      )
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })
  }

  
  onChangeAspect(t:UntypedFormGroup, p:UntypedFormGroup, c:UntypedFormGroup, a:UntypedFormGroup){
    console.log("criteria")
    var req:AspectRequest = {
      materias:{
        id:this.materia_id,
        exams:{
          id:t.controls.id.value,
          parameters:{
            id:p.controls.id.value,
            criterias:{
              id:c.controls.id.value,
              aspects:{
                id:a.controls.id.value,
                label:a.controls.label.value,
                description:a.controls.description.value
              }          
            }
          }
        }
      }
    }

    this.userLoginService.getUserIdToken().then( token => { 
      this.examImprovisacionService.firestoreApiInterface("update", token, req).subscribe(
        data => {
          console.log("aspect update has completed")
        },
        error => {
          alert("error:" + error.error)
          console.log(error.error)
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
    return JSON.stringify(this.e.value)
  } 
  upParameter(t:UntypedFormGroup, p:UntypedFormGroup){
    console.log("upParameter")
    var parameter_array:UntypedFormArray = t.controls.parameters as UntypedFormArray
    for(var i=1; i<parameter_array.length; i++){
      var g:UntypedFormGroup = parameter_array.controls[i] as UntypedFormGroup
      if( g.controls.id.value == p.controls.id.value){
        var index = i
        var req:ParameterRequest = {
          materias:{
            id:this.materia_id,
            exams:{
              id:t.controls.id.value,
              parameters:{
                id: p.controls.id.value,
                idx:index-1
              }
            }
          }
        }
    
        this.userLoginService.getUserIdToken().then( token => { 
          this.examImprovisacionService.firestoreApiInterface("moveSubCollectionIndex", token, req).subscribe(
            data => {
              moveItemInArray(parameter_array.controls, index, index-1)
              console.log("aspect upParameter has completed from:" + index + " to:" + (index-1))
            },
            error => {
              alert("error:" + error.error)
              console.log(error.error)
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

  downParameter(t:UntypedFormGroup, p:UntypedFormGroup){
    console.log("downParameter")
    var parameter_array:UntypedFormArray = t.controls.parameters as UntypedFormArray
    for(var i=0; i<parameter_array.length-1; i++){
      var g:UntypedFormGroup = parameter_array.controls[i] as UntypedFormGroup
      if( g.controls.id.value == p.controls.id.value){
        var index = i
        var req :ParameterRequest= {
          materias:{
            id:this.materia_id,
            exams:{
              id:t.controls.id.value,
              parameters:{
                id: p.controls.id.value,
                idx:index+1
              }
            }
          }
        }
    
        this.userLoginService.getUserIdToken().then( token => { 
          this.examImprovisacionService.firestoreApiInterface("moveSubCollectionIndex", token, req).subscribe(
            data => {
              moveItemInArray(parameter_array.controls, index, index+1)
      
              console.log("downParameter has completed from index:" + index + " to:" + (index+1))
            },
            error => {
              alert("error:" + error.error)
              console.log(error.error)
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

  upCriteria(e:UntypedFormGroup, p:UntypedFormGroup, c:UntypedFormGroup) {

    console.log("upCriteria")
    var criteria_array:UntypedFormArray = p.controls.criterias as UntypedFormArray
    for(var i=1; i<criteria_array.length; i++){
      var g:UntypedFormGroup = criteria_array.controls[i] as UntypedFormGroup
      if( g.controls.id.value == c.controls.id.value){
        var index = i

        var req:CriteriaRequest = {
          materias:{
            id:this.materia_id,          
            exams:{
              id:e.controls.id.value,
              parameters:{
                id:p.controls.id.value,
                criterias:{
                  id: c.controls.id.value,
                  idx:index-1
                }
              }
            }
          }
        }
    
        this.userLoginService.getUserIdToken().then( token => { 
          this.examImprovisacionService.firestoreApiInterface("moveSubCollectionIndex", token, req).subscribe(
            data => {
              moveItemInArray(criteria_array.controls, index, index-1);
              console.log("criteria has completed from index:" + index + " to:" + (index-1))
            },
            error => {
              alert("error:" + error.error)
              console.log(error.error)
            }
          )
        },
        error => {
          alert("Error in token:" + error.errorCode + " " + error.errorMessage)
        })
      }
    }
  
  } 

  downCriteria(e:UntypedFormGroup, p:UntypedFormGroup, c:UntypedFormGroup) {

    console.log("downCriteria")
    var criteria_array:UntypedFormArray = p.controls.criterias as UntypedFormArray
    for(var i=0; i<criteria_array.length-1; i++){
      var g:UntypedFormGroup = criteria_array.controls[i] as UntypedFormGroup
      if( g.controls.id.value == c.controls.id.value){
        var index = i

        var req:CriteriaRequest = {
          materias:{
            id:this.materia_id,          
            exams:{
              id:e.controls.id.value,
              parameters:{
                id:p.controls.id.value,
                criterias:{
                  id: c.controls.id.value,
                  idx:index+1
                }
              }
            }
          }
        }
    
        this.userLoginService.getUserIdToken().then( token => { 
          this.examImprovisacionService.firestoreApiInterface("moveSubCollectionIndex", token, req).subscribe(
            data => {
              moveItemInArray(criteria_array.controls, index, index+1);
              console.log("criteria has completed from index:" + index + " to:" + (index+1))
            },
            error => {
              alert("error:" + error.error)
              console.log(error.error)
            }
          )
        },
        error => {
          alert("Error in token:" + error.errorCode + " " + error.errorMessage)
        })
      }
    }
  
  } 
 

  upAspect(t:UntypedFormGroup, p:UntypedFormGroup, c:UntypedFormGroup, a:UntypedFormGroup){
    console.log("upAspect")
    var aspects_array:UntypedFormArray = c.controls.aspects as UntypedFormArray
    for(var i=1; i<aspects_array.length; i++){
      var qg:UntypedFormGroup = aspects_array.controls[i] as UntypedFormGroup
      if( qg.controls.id.value == a.controls.id.value){
        var index = i

        
        var req:AspectRequest = {
          materias:{
            id:this.materia_id,          
            exams:{
              id:t.controls.id.value,
              parameters:{
                id:p.controls.id.value,
                criterias:{
                  id:c.controls.id.value,
                  aspects:{
                    id: a.controls.id.value,
                    idx:index-1
                  }
                }
              }
            }
          }
        }
    
        this.userLoginService.getUserIdToken().then( token => { 
          this.examImprovisacionService.firestoreApiInterface("moveSubCollectionIndex", token, req).subscribe(
            data => {
              moveItemInArray(aspects_array.controls, index, index-1);              
              console.log("aspect has completed from index:" + index + " to:" + (index-1))
              
            },
            error => {
              alert("error:" + error.error)
              console.log(error.error)
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

  downAspect(t:UntypedFormGroup, p:UntypedFormGroup, c:UntypedFormGroup, a:UntypedFormGroup){
    console.log("downParameter")
    var aspects_array:UntypedFormArray = c.controls.aspects as UntypedFormArray
    for(var i=0; i<aspects_array.length-1; i++){
      var qg:UntypedFormGroup = aspects_array.controls[i] as UntypedFormGroup
      if( qg.controls.id.value == a.controls.id.value){
        var index = i

        
        var req :AspectRequest = {
          materias:{
            id:this.materia_id,          
            exams:{
              id:t.controls.id.value,
              parameters:{
                id:p.controls.id.value,
                criterias:{
                  id:c.controls.id.value,
                  aspects:{
                    id: a.controls.id.value,
                    idx:index+1
                  }
                }
              }
            }
          }
        }
    
        this.userLoginService.getUserIdToken().then( token => { 
          this.examImprovisacionService.firestoreApiInterface("moveSubCollectionIndex", token, req).subscribe(
            data => {
              moveItemInArray(aspects_array.controls, index, index+1)
              console.log("aspect has completed from index:" + index + " to:" + (index+1))              
            },
            error => {
              alert("error:" + error.error)
              console.log(error.error)
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

  getExamCollection():string{
      return "materias/" + this.materia_id + "/exams/" + this.exam_id + "/references"
  }

}
