import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ExamenesImprovisacionService} from '../examenes-improvisacion.service'
import { ActivatedRoute, Router } from '@angular/router';
import { UserLoginService } from '../user-login.service';


function formatDate(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [year, month, day].join('-');
}

@Component({
  selector: 'app-examen-improvisacion-form',
  templateUrl: './examen-improvisacion-form.component.html',
  styleUrls: ['./examen-improvisacion-form.component.css']
})
export class ExamenImprovisacionFormComponent {
  submitting = false

  parameter_label = []
  today = new Date().toISOString().slice(0, 10)

  criteria_label = []

  exam_impro_ap = this.fb.group({
    id: [null],
    completado:[false, Validators.required],
    fechaApplicacion: [null, Validators.required],
    estudiante_uid: [null, Validators.required],
    exam_impro_type_id: [null, Validators.required],
    materia:[null, Validators.required],    
    exam_impro_parameter: new FormArray([])
  });

  getFormGroupArray (fg:FormGroup, controlname:string): FormGroup[] {
    var fa:FormArray =  fg.controls[controlname] as FormArray
    return fa.controls as FormGroup[]
  }
  
  constructor(private fb: FormBuilder,private route: ActivatedRoute
    , private router: Router
    , private examImprovisacionService: ExamenesImprovisacionService
    , private formBuilder: FormBuilder
    , private userLoginService:UserLoginService) {

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

    var examImproTypeRequest = {
      "exam_impro_type":[{
          "id":"",
          "label":""
      }]
    }  



    this.examImprovisacionService.chenequeApiInterface("get", token, examImproTypeRequest).subscribe(data => {
      let r = data["result"] as Array<any>;
      this.types.length = 0
      for( let i =0; i<r.length; i++){
        let obj = {
          "id":r[i].id,
          "label":r[i].label
        }
        this.types.push(obj)
      }
    },
    error => {
      alert( "error retriving type request" + error )
    })


    var estudianteRequest = {
      "user":{
          "role":"estudiante"
      }
    }      

    this.examImprovisacionService.chenequeApiInterface("getUserListForClaim", token, estudianteRequest).subscribe(data => {
      let r = data["result"] as Array<any>;
      this.estudiantes.length = 0
      for( let i =0; i<r.length; i++){
        
        var estudiante_user_req = {
          user:{
            uid:"",
            displayName:"",
            email:r[i]["email"]
          }
        }

        this.examImprovisacionService.chenequeApiInterface("get", token, estudiante_user_req).subscribe(
          estudiante_data =>{
            let estudiante = estudiante_data["result"]
            let obj = {
              "uid":estudiante.uid,
              "estudianteName":(estudiante.displayName != null)? estudiante.displayName : estudiante.email
            }
            this.estudiantes.push(obj)
          },
          estudiante_error =>{
            alert("error leyendo estudiante data:" + estudiante_error.error)
          }
        )
      }
    },
    error => {
        alert( "Error retriving estudiante" + error )
    }) 
    
    
    var maestro_request = {
      "user":{
          "role":"evaluador"
      }
    }      

    this.examImprovisacionService.chenequeApiInterface("getUserListForClaim", token, maestro_request).subscribe(data => {
      let r = data["result"] as Array<any>;
      this.maestros.length = 0
      for( let i =0; i<r.length; i++){
        var evaluador_user_req = {
          user: {
            uid:"",
            displayName:"",
            email:r[i]["email"]
          }
        }
        this.examImprovisacionService.chenequeApiInterface("get", token, evaluador_user_req).subscribe(
          user_data => {
            let user = user_data["result"]
            let obj = {
              "uid":user.uid,
              "maestroName":(user.displayName != null)? user.displayName : user.email
            }
            console.log("user:" + obj.uid + " " + obj.maestroName)
            this.maestros.push(obj)            
          },
          user_error =>{
            alert("error leyendo usuario para :" + r[i]["email"])
          }
        )
      }
    },
    error => {
        alert( "Error retriving estudiante" + error )
    })     
  }  
  

  types = [
    { id:-1, label:"N/A"}
  ]
  getExamTypes(){
    return this.types;
  }

  examTypeChange(event) {
    var parameterId = event.value
    this.parameter_label = []
    this.criteria_label = []

    var parameter:FormArray = this.exam_impro_ap.controls.exam_impro_parameter as FormArray
    for( let i=parameter.length-1; i>=0; i--){
      parameter.removeAt(i)
    }        

    var exam_impro_parameter_request = {
      exam_impro_parameter:[{
          id:"",
          exam_impro_type_id:parameterId,
          label:"",
          exam_impro_criteria:[{
            id:"",
            label:"",
            idx:"",
            initially_selected:"",
            exam_impro_question:[{
              id:"",
              label:"",
              idx:"",
              itemized:"",
              "exam_impro_observation(+)":[{
                id:"",
                label:"",
                idx:""
              }]

            }]
          }]
      }],
      orderBy:{
        "exam_impro_parameter.idx":"",
        "exam_impro_criteria.idx":"",
        "exam_impro_question.idx":"",
        "exam_impro_observation.idx":""
      }
    }      

    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.chenequeApiInterface("get", token, exam_impro_parameter_request).subscribe(data => {
        let parameter_array = data["result"] as Array<any>;

       for( let i =0; i<parameter_array.length; i++){
          this.addParameter(parameter, parameter_array[i])
        }
      },
      error => {
          alert( error )
      }) 
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })       
  }

  addParameter(parameter_array:FormArray, p){
    var g=this.fb.group({
      id: [null],
      exam_impro_ap_id:[null],
      exam_impro_parameter_id:[p["id"]],
      maestro_uid:[null] ,
      completado: [false],
      exam_impro_criteria: new FormArray([])         
    })
    parameter_array.push(g) 
    this.parameter_label[p["id"]]=p["label"]

    for( let i=0; i<p.exam_impro_criteria.length; i++){
      this.addCriteria(g.controls.exam_impro_criteria as FormArray, p["exam_impro_criteria"][i])
    }
  }

  addCriteria(criteria_array:FormArray, c){
    var g = this.fb.group({
      id:[null],
      exam_impro_criteria_id:[c["id"]],
      initially_selected:[ c["initially_selected"] ],
      exam_impro_question: new FormArray([])
    })
    criteria_array.push(g)
    this.criteria_label[c["id"]] = c["label"] //add the description to translation table

    for(let i=0; i<c.exam_impro_question.length; i++){
      this.addQuestion(g.controls.exam_impro_question as FormArray, c.exam_impro_question[i])
    }
  }

  addQuestion(question_array:FormArray, q){
    var g = this.fb.group({
      id:[null],
      exam_impro_ap_question_id:[null],
      exam_impro_question_id:[q["id"]],
      exam_impro_observation: new FormArray([])
    })
    question_array.push(g)

    for(let i=0; q.exam_impro_observation && i<q.exam_impro_observation.length; i++){
      this.addObservation(g.controls.exam_impro_observation as FormArray, q.exam_impro_observation[i])
    }    
  }

  addObservation(observation_array:FormArray, o){
    var g = this.fb.group({
      id:[null],
      exam_impro_ap_question_id:[null],
      exam_impro_observation_id: o["id"]
    })
    observation_array.push(g)    
  }

  estudiantes = [
    { uid:-1, estudianteName:"N/A"}
  ] 

  getExamEstudiantes(){
    return this.estudiantes;    
  }  

  maestros = [
    { uid: "", maestroName:"N/A"}
  ]

  getExamMaestros(){
    return this.maestros
  }
  getAnyClass(obj) {
    if (typeof obj === "undefined") return "undefined";
    if (obj === null) return "null";
    return obj.constructor.name;
  }   


  getExamImproLabel(id){
    return this.parameter_label[ id ] 
  }

  getCriteria(id){
    return this.criteria_label[id]
  }

  getformValue(){
    return JSON.stringify(this.exam_impro_ap.value)
  }  

  replacer(key, value) {
    // Filtrando propiedades 
    if (key === "fechaApplicacion") {
      return value.slice(0, 10);
    }
    return value;
  }

  retriveOnlySelected(){

    var exam_impro_ap = {
      id:null,
      completado:false,
      fechaApplicacion: formatDate( this.exam_impro_ap.controls.fechaApplicacion.value ),
      estudiante_uid: this.exam_impro_ap.controls.estudiante_uid.value,
      exam_impro_type_id: this.exam_impro_ap.controls.exam_impro_type_id.value,
      materia: this.exam_impro_ap.controls.materia.value,
      exam_impro_ap_parameter: []
    }
    var parameter_array = this.exam_impro_ap.controls.exam_impro_parameter as FormArray;
    for( let pi=0; pi<parameter_array.length; pi++){
      var p = parameter_array.controls[pi] as FormGroup
      var ap_parameter = {
        id:null,
        exam_impro_ap_id:null,
        exam_impro_parameter_id: p.controls.exam_impro_parameter_id.value,
        maestro_uid: p.controls.maestro_uid.value,
        completado:false,
        exam_impro_ap_criteria:[]
      }
      exam_impro_ap.exam_impro_ap_parameter.push(ap_parameter)
      var criteria_array = p.controls.exam_impro_criteria as FormArray
      for( let ci=0; ci<criteria_array.length; ci++){
        var c = criteria_array.controls[ci] as FormGroup
        if( c.controls.initially_selected.value == true ){
          var ap_criteria = {
            id:null,
            exam_impro_ap_parameter_id:null,
            exam_impro_criteria_id:c.controls.exam_impro_criteria_id.value,
            exam_impro_ap_question:[]
          }
          ap_parameter.exam_impro_ap_criteria.push(ap_criteria)
          // adding quesitons
          var question = c.controls.exam_impro_question as FormArray
          for( let qi=0; qi< question.length; qi++){
            var q=question.controls[qi] as FormGroup
            var ap_question = {
              id:null,
              exam_impro_ap_criteria_id:null,
              exam_impro_question_id:q.controls.exam_impro_question_id.value,
              exam_impro_ap_observation:[]
            }
            ap_criteria.exam_impro_ap_question.push(ap_question)

            //add observations
            var observation_array = q.controls.exam_impro_observation as FormArray
            for( let oi=0; observation_array && oi<observation_array.length; oi++){
              let o = observation_array.controls[oi] as FormGroup
              var ap_observation = {
                id:null,
                exam_impro_ap_question_id:null,
                exam_impro_observation_id:o.controls.exam_impro_observation_id.value
              }
              ap_question.exam_impro_ap_observation.push(ap_observation)
            }
          }
        }
      }
    }
    return exam_impro_ap;
  }


    
  onSubmit() {
    this.submitting = true
    if( this.exam_impro_ap.invalid ){
      const invalid = [];
      const controls = this.exam_impro_ap.controls;
      for (const name in controls) {
          if (controls[name].invalid) {
              invalid.push(name);
          }
      }
      alert( "invalid:" + invalid.join(" "));
      this.submitting = false
    }
    else{

      var data = this.retriveOnlySelected()
      console.log( data )


      var exam_impro_ap_request= {
        "exam_impro_ap":data
      }      

      this.userLoginService.getUserIdToken().then( token => { 

        this.examImprovisacionService.chenequeApiInterface("add", token, exam_impro_ap_request).subscribe(data => {
          var result = data["result"]
          alert("thanks!")
          console.log(JSON.stringify(result, null, 2))
          this.router.navigate(['/ExamenesImprovisacion']);
        },
        error => {
          alert("error creating exam_impro_ap_id" + error.error)
          this.submitting = false
        })
      },
      error => {
        alert("Error in token:" + error.errorCode + " " + error.errorMessage)
        this.submitting = false
      })
    }

  } 
}
