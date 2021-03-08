import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ExamenesImprovisacionService} from '../examenes-improvisacion.service'
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-examen-improvisacion-form',
  templateUrl: './examen-improvisacion-form.component.html',
  styleUrls: ['./examen-improvisacion-form.component.css']
})
export class ExamenImprovisacionFormComponent {
  submitting = false
  token = "user.token"

  exam_impro_parameter = []
  today = new Date().toISOString().slice(0, 10)

  criteria = []

  exam_impro_ap_FormGroup = this.fb.group({
    id: [null],
    completado:[false, Validators.required],
    fechaApplicacion: [null, Validators.required],
    estudiante_id: [null, Validators.required],
    exam_impro_type_id: [null, Validators.required],
    materia:[null, Validators.required],    
    exam_impro_ap_parameter: new FormArray([
      this.fb.group({
        id: [null],
        exam_impro_ap_id:[null],
        completado: [false],
        exam_impro_parameter_id:[null],
        maestro_id:[null], 
        exam_impro_ap_criteria: new FormArray([
          this.fb.group({
            id:[null],
            exam_impro_ap_parameter_id:[null],
            exam_impro_criteria_id:[null],
            selected:false
          })
        ])         
      })
    ])
  });

  get get_exam_impro_ap():FormGroup { return this.exam_impro_ap_FormGroup as FormGroup; }
  get get_exam_impro_ap_parameter_array():FormArray { 
    let exam_impro_ap_parameter:FormArray = this.get_exam_impro_ap.controls.exam_impro_ap_parameter as FormArray; 
    return exam_impro_ap_parameter
  }
  get get_exam_impro_ap_parameter():FormGroup[] { 
    return this.get_exam_impro_ap_parameter_array.controls as FormGroup[]; 
  }

  getCriteriaFormGroups( p : FormGroup ) : FormGroup[]{
    var arr:FormArray = p.controls.exam_impro_ap_criteria as FormArray
    var fg = arr.controls
    return fg as FormGroup[]
  }
  
  
  constructor(private fb: FormBuilder,private route: ActivatedRoute
    , private router: Router
    , private examImprovisacionService: ExamenesImprovisacionService
    , private formBuilder: FormBuilder) {

  }

  ngOnInit() {

    var examImproTypeRequest = {
      "exam_impro_type":[{
          "id":"",
          "label":""
      }]
    }  

    this.examImprovisacionService.chenequeApiInterface("get", examImproTypeRequest).subscribe(data => {
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
      "estudiante":[{
          "id":"",
          "nombre":"",
          "apellidoPaterno":"",
          "apellidoMaterno":""
      }]
    }      

    this.examImprovisacionService.chenequeApiInterface("get", estudianteRequest).subscribe(data => {
      let r = data["result"] as Array<any>;
      this.estudiantes.length = 0
      for( let i =0; i<r.length; i++){
        let obj = {
          "id":r[i].id,
          "estudianteName":r[i].nombre + " " + r[i].apellidoPaterno + " " + r[i].apellidoMaterno
        }
        this.estudiantes.push(obj)
      }
    },
    error => {
        alert( "Error retriving estudiante" + error )
    }) 
    
    var exam_impro_parameter_request = {
      "exam_impro_parameter":[{
          "id":"",
          "label":""
      }]
    }      

    this.examImprovisacionService.chenequeApiInterface("get", exam_impro_parameter_request).subscribe(data => {
      let r = data["result"] as Array<any>;
      for( let i =0; i<r.length; i++){
        this.exam_impro_parameter[ r[i].id ] = r[i].label
      }
    
    },
    error => {
        alert( "Error retriving parameters names" + error.error.error )
    }) 
    
    var maestro_request = {
      "maestro":[{
          "id":"",
          "nombre":"",
          "apellidoPaterno":"",
          "apellidoMaterno":""
      }]
    }      

    this.examImprovisacionService.chenequeApiInterface("get", maestro_request).subscribe(data => {
      let r = data["result"] as Array<any>;
      this.maestros.length = 0
      for( let i =0; i<r.length; i++){
        var obj = {
          id:r[i].id,
          nombre:r[i].nombre,
          apellidoPaterno: r[i].appellidoPaterno,
          apellidoMaterno:r[i].appellidoMaterno
        }
        this.maestros.push(obj)
      }
    },
    error => {
        alert( "Error retriving parameters names" + error.error.error )
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

    var exam_impro_parameter_request = {
      "exam_impro_parameter":[{
          "id":"",
          "exam_impro_type_id":parameterId,
          "label":""
      }]
    }      

    this.examImprovisacionService.chenequeApiInterface("get", exam_impro_parameter_request).subscribe(data => {
      let r = data["result"] as Array<any>;

      var parameterArray = this.get_exam_impro_ap_parameter_array
      for( let i=parameterArray.length-1; i>=0; i--){
        parameterArray.removeAt(i)

      }     
      
      for( let i =0; i<r.length; i++){
        var g=this.fb.group({
          id: [null],
          exam_impro_ap_id:[null],
          completado: [false],
          exam_impro_parameter_id:[r[i].id],
          maestro_id:[null] ,
          exam_impro_ap_criteria: new FormArray([])         
        })
        parameterArray.push(g)
        this.addCriteria( r[i].id, g.controls.exam_impro_ap_criteria as FormArray )
      }
    },
    error => {
        alert( error )
    })        
  }

  estudiantes = [
    { id:-1, estudianteName:"N/A"}
  ]  
  getExamEstudiantes(){
    return this.estudiantes;    
  }  

  maestros = [
    { id: -1, nombre:"N/A", apellidoPaterno:"N/A", apellidoMaterno:"N/A"}
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
    return this.exam_impro_parameter[ id ] 
  }


  addCriteria( exam_impro_parameter_id , exam_impro_ap_criteria: FormArray){

    var exam_impro_criteria_request = {
      "exam_impro_criteria":[{
          "id":"",
          "label":"",
          "exam_impro_parameter_id":exam_impro_parameter_id,
          "initially_selected":""
      }]
    } 

    this.examImprovisacionService.chenequeApiInterface("get", exam_impro_criteria_request).subscribe(data => {
      let r = data["result"] as Array<any>;
      for( let i= exam_impro_ap_criteria.length-1; i>=0; i--){
        exam_impro_ap_criteria.removeAt(i)
      }
      for( let i =0; i<r.length; i++){
        var g = this.fb.group({
          id:[null],
          exam_impro_ap_parameter_id:[exam_impro_parameter_id],
          exam_impro_criteria_id:[r[i]["id"]],
          selected:[ r[i]["initially_selected"] ]
        })
        
        exam_impro_ap_criteria.push(g)

        this.criteria[r[i]["id"]] = r[i]["label"] //add the description to translation table
      }
    },
    error => {
        alert( "Error retriving parameters names" + error.error.error )
    }) 


  }



  getCriteria(id){
    return this.criteria[id]
  }

  getformValue(){
    return JSON.stringify(this.exam_impro_ap_FormGroup.value)
  }  

  replacer(key, value) {
    // Filtrando propiedades 
    if (key === "fechaApplicacion") {
      return value.slice(0, 10);
    }
    return value;
  }
    
  onSubmit() {
    this.submitting = true
    if( this.exam_impro_ap_FormGroup.invalid ){
      const invalid = [];
      const controls = this.exam_impro_ap_FormGroup.controls;
      for (const name in controls) {
          if (controls[name].invalid) {
              invalid.push(name);
          }
      }
      alert( "invalid:" + invalid.join(" "));
    }
    else{
      console.log( JSON.stringify(this.exam_impro_ap_FormGroup.value, null, 2) )
      var jsonStr = JSON.stringify(this.exam_impro_ap_FormGroup.value, this.replacer)
      var data = JSON.parse(jsonStr);
      var exam_impro_ap_request= {
        "exam_impro_ap":data
      }      

      this.examImprovisacionService.chenequeApiInterface("add", exam_impro_ap_request).subscribe(data => {
        var result = data["result"]
        alert("thanks!")
        console.log(JSON.stringify(result, null, 2))
        this.router.navigate(['/ExamenesImprovisacion']);
      },
      error => {
        alert("error creating exam_impro_ap_id" + error)
      })
    }

  } 
}