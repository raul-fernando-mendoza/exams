import { Component, NgZone, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamenesImprovisacionService} from '../examenes-improvisacion.service';
import { CdkTextareaAutosize} from '@angular/cdk/text-field';
import { take} from 'rxjs/operators';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { UserLoginService } from '../user-login.service';
import { Exam, Parameter, ExamRequest, ParameterRequest, CriteriaRequest, AspectRequest, TypeCertificate} from 'src/app/exams/exams.module'



@Component({
  selector: 'app-ei-tipo-edit',
  templateUrl: './ei-tipo-edit.component.html',
  styleUrls: ['./ei-tipo-edit.component.css']
})



export class EiTipoEditComponent implements OnInit {




  e = this.fb.group({
    id: [null, Validators.required],
    label:["nombre tipo de examen", Validators.required],   
    typeCertificate:["", Validators.required],
    description:[""],
    parameters: new FormArray([])
  })
  
  id
  submitting = false

  typeCertificates: TypeCertificate[] = [
    { label:"Habilidades", value:"habilidades" }, 
    { label:"Tecnica Coreografia", value:"tecnicaCoreografia" }
  ]  

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

    this.e.controls.id.setValue( this.id )
    this.e.controls.label.setValue(null)

    var parameter: FormArray = this.e.controls.parameters as FormArray
    parameter.clear()

    
    if( this.id ){
      var req:ExamRequest = {
        exams:{
          id:this.id,
          label:null,
          typeCertificate:null,
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
      this.submitting = true
      this.userLoginService.getUserIdToken().then( token => {

        this.examImprovisacionService.firestoreApiInterface("get", token, req).subscribe(
          data => { 
            this.submitting = false
            let t:Exam = data["result"];
            this.e.controls.id.setValue(t.id)
            this.e.controls.label.setValue(t.label)
            this.e.controls.description.setValue( t.description ? t.description : "" )
            this.e.controls.typeCertificate.setValue( t.typeCertificate ? t.typeCertificate : "" )
            var parameter_arr:FormArray = this.e.controls.parameters as FormArray

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

  newParameter( e:FormGroup ){
    var parameters_array:FormArray = e.controls.parameters as FormArray
    var req:ParameterRequest = {
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

  newCriteria( e:FormGroup, p:FormGroup  ){
    this.submitting = true; 
    var criteria_array:FormArray = p.controls.criterias as FormArray
    var req:CriteriaRequest = {
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

  newAspect( e:FormGroup, p:FormGroup, c:FormGroup  ){
    this.submitting = true; 
    var question_array:FormArray = c.controls.aspects as FormArray
    var req:AspectRequest = {
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


  dupParameter( e:FormGroup, p:FormGroup){
  
    var req:ParameterRequest = {
      exams:{
        id:e.controls.id.value,
        parameters:{
          id:p.controls.id.value
        }
      }
    }

    this.submitting = true;
    
    this.userLoginService.getUserIdToken().then( token => {

      this.examImprovisacionService.firestoreApiInterface("dupSubCollection", token, req).subscribe(
        data => {
          console.log(" parameter add has completed")
          var newParameter = data["result"]
          var parameters_array = e.controls.parameters as FormArray
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


  dupCriteria( e:FormGroup, p:FormGroup, c:FormGroup  ){
    this.submitting = true; 
    var criteria_array:FormArray = p.controls.criterias as FormArray
    var req:CriteriaRequest = {
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

    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.firestoreApiInterface("dupSubCollection", token, req).subscribe(
        data => {
          console.log(" criteria add has completed")
          var newCriteria = data["result"]
          criteria_array = p.controls.criterias as FormArray
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



  delParameter(e:FormGroup, p:FormGroup){

    if( !confirm("Esta seguro de querer borrar el parametro") ){
      return
    }
    this.submitting = true; 
    var req:ParameterRequest = {
      exams:{
        id:e.controls.id.value,
        parameters:{
          id:p.controls.id.value
        }
      }
    }

    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.firestoreApiInterface("delete", token, req).subscribe(
        data => {
          console.log("parameter has been erased")
          var parameters_array:FormArray = e.controls.parameters as FormArray
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


  delCriteria(e:FormGroup, p:FormGroup, c:FormGroup){
    if( !confirm("Esta seguro de querer borrar el criterio") ){
      return
    }    
    this.submitting = true; 
    var req:CriteriaRequest = {
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

  delAspect(e:FormGroup,p:FormGroup, c:FormGroup, a:FormGroup){
    this.submitting = false; 
    var req:AspectRequest = {
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

  onChangeExam(e:FormGroup){
    console.log("exam")
    var req:ExamRequest = {
      exams:{
        id:e.controls.id.value,
        label:e.controls.label.value,
        typeCertificate:e.controls.typeCertificate.value,
        description:e.controls.description.value
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

  onChangeParameter(e:FormGroup, p:FormGroup){
    console.log("parameter")
    var req:ParameterRequest = {
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

  onChangeCriteria(e:FormGroup, p:FormGroup, c:FormGroup){
    console.log("criteria")
    var req:CriteriaRequest= {
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

  
  onChangeAspect(t:FormGroup, p:FormGroup, c:FormGroup, a:FormGroup){
    console.log("criteria")
    var req:AspectRequest = {
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
  upParameter(t:FormGroup, p:FormGroup){
    console.log("upParameter")
    var parameter_array:FormArray = t.controls.parameters as FormArray
    for(var i=1; i<parameter_array.length; i++){
      var g:FormGroup = parameter_array.controls[i] as FormGroup
      if( g.controls.id.value == p.controls.id.value){
        var index = i
        var req:ParameterRequest = {
          exams:{
            id:t.controls.id.value,
            parameters:{
              id: p.controls.id.value,
              idx:index-1
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

  downParameter(t:FormGroup, p:FormGroup){
    console.log("downParameter")
    var parameter_array:FormArray = t.controls.parameters as FormArray
    for(var i=0; i<parameter_array.length-1; i++){
      var g:FormGroup = parameter_array.controls[i] as FormGroup
      if( g.controls.id.value == p.controls.id.value){
        var index = i
        var req :ParameterRequest= {
          exams:{
            id:t.controls.id.value,
            parameters:{
              id: p.controls.id.value,
              idx:index+1
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

  upCriteria(e:FormGroup, p:FormGroup, c:FormGroup) {

    console.log("upCriteria")
    var criteria_array:FormArray = p.controls.criterias as FormArray
    for(var i=1; i<criteria_array.length; i++){
      var g:FormGroup = criteria_array.controls[i] as FormGroup
      if( g.controls.id.value == c.controls.id.value){
        var index = i

        var req:CriteriaRequest = {
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

  downCriteria(e:FormGroup, p:FormGroup, c:FormGroup) {

    console.log("downCriteria")
    var criteria_array:FormArray = p.controls.criterias as FormArray
    for(var i=0; i<criteria_array.length-1; i++){
      var g:FormGroup = criteria_array.controls[i] as FormGroup
      if( g.controls.id.value == c.controls.id.value){
        var index = i

        var req:CriteriaRequest = {
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
 

  upAspect(t:FormGroup, p:FormGroup, c:FormGroup, a:FormGroup){
    console.log("upAspect")
    var aspects_array:FormArray = c.controls.aspects as FormArray
    for(var i=1; i<aspects_array.length; i++){
      var qg:FormGroup = aspects_array.controls[i] as FormGroup
      if( qg.controls.id.value == a.controls.id.value){
        var index = i

        
        var req:AspectRequest = {
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

  downAspect(t:FormGroup, p:FormGroup, c:FormGroup, a:FormGroup){
    console.log("downParameter")
    var aspects_array:FormArray = c.controls.aspects as FormArray
    for(var i=0; i<aspects_array.length-1; i++){
      var qg:FormGroup = aspects_array.controls[i] as FormGroup
      if( qg.controls.id.value == a.controls.id.value){
        var index = i

        
        var req :AspectRequest = {
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

}
