import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { ExamenesImprovisacionService} from '../examenes-improvisacion.service'
import { ActivatedRoute, Router } from '@angular/router';
import { enableDebugTools } from '@angular/platform-browser';


@Component({
  selector: 'app-examen-improvisacion-form',
  templateUrl: './examen-improvisacion-form.component.html',
  styleUrls: ['./examen-improvisacion-form.component.css']
})
export class ExamenImprovisacionFormComponent {
  parameters = [
    { id:8, label:"Parameter", maestro_id: -1, exam_impro_criteria:[{id:1,exam_impro_type_id:1,label:"criteria1",initially_selected:true}]},
    { id:7, label:"Parameter1", maestro_id: -1, exam_impro_criteria:[{id:1,exam_impro_type_id:1,label:"criteria1",initially_selected:false}]}
  ]
  getParameters(){
    return this.parameters;
  }
  updateParametersFormGroup(){
    var par = {}

    for (let i = this.t.length; i >= 0; i--) {
        this.t.removeAt(i);
    }

    for( let i=0; i<this.parameters.length ; i++){
      var p = this.parameters[i]
      var fg = this.formBuilder.group( {
        id: [p.id, Validators.required],
        label: [p.label, Validators.required],
        maestro_id:  [p.maestro_id, Validators.required],
        exam_impro_criteria: new FormArray([]) 
      })
      for( var j = 0; j<p.exam_impro_criteria.length; j++){
        var c = p.exam_impro_criteria[j]
        var cg = this.formBuilder.group( {
          id: [c.id, Validators.required],
          label: [c.label, Validators.required],
          isSelected:[c.initially_selected, Validators.required]
        })
        var fa:FormArray = fg.controls.exam_impro_criteria as FormArray
        fa.controls.push(cg)
      }
      this.t.push( fg )
    }
  }

  examForm = this.fb.group({
    examImproType: [null, Validators.required],
    examImproEstudiante: [null, Validators.required],
    examImproParameters: new FormArray([])

  });

  get f() { return this.examForm.controls; }
  get t() { return this.f.examImproParameters as FormArray; }
  get parametersFormGroups() { return this.t.controls as FormGroup[]; }

  getCriteriaFormGroups(p) {
     return p.controls.exam_impro_criteria.controls as FormGroup[];
  }
 
  constructor(private fb: FormBuilder,private route: ActivatedRoute
    , private router: Router
    , private examImprovisacionService: ExamenesImprovisacionService
    , private formBuilder: FormBuilder) {

  }

  ngOnInit() {


      this.examImprovisacionService.getExamsImproTypes("user.token").subscribe(data => {
        let t = data["result"];
        this.types.length = 0
        for( let i =0; i<t.length; i++){
          let obj = {
            "id":t[i].id,
            "label":t[i].label
          }
          this.types.push(obj)
        }
      })

      this.examImprovisacionService.getExamsImproEstudiantes("user.token").subscribe(data => {
          let r = data["result"];
          this.estudiantes.length = 0
          for( let i =0; i<r.length; i++){
            let obj = {
              "id":r[i].id,
              "estudianteName":r[i].nombre + " " + r[i].apellidoPaterno + " " + r[i].apellidoMaterno
            }
            this.estudiantes.push(obj)
          }        

      })

      this.updateParametersFormGroup()

    /*
      var exam_impr_type_id = 1
      var estudiante_id = 1
      var fechaApplicacion = Date()

      error => {
        alert("ERROR al crear improvisacion:" + error)
      });  

      this.examImprovisacionService.addExamImpro("user.token", exam_impr_type_id, estudiante_id, fechaApplicacion).subscribe(data => {
        console.log( "Exams:" + data );
        var examCreated = data["result"];
      },
      error => {
        alert("ERROR al crear improvisacion:" + error)
      });  
      */      
  }  
  

  onSubmit() {
    if( !this.examForm.invalid ){
      alert('Thanks!');
    }
    else{
      const invalid = [];
      const controls = this.examForm.controls;
      for (const name in controls) {
          if (controls[name].invalid) {
              invalid.push(name);
          }
      }
      alert( "invalid:" + invalid.join(" "));
    }
    
  }

  types = [
    { id:"1", label:"nivel 1"},
    { id:"2", label:"nivel 2"}
  ]
  getExamTypes(){
    return this.types;
  }

  examTypeChange(event) {
    var parameterId = event.value
    this.examImprovisacionService.getExamsImproParameters("user.token", parameterId).subscribe(data => {
      let r = data["result"];
      this.parameters.length = 0
      for( let i =0; r!=null && i<r.length; i++){
        let obj = {
          "id":r[i].id,
          "label":r[i].label,
          "maestro_id":-1,
          "exam_impro_criteria":r[i].exam_impro_criteria
        }
        this.parameters.push(obj)
      }        
      this.updateParametersFormGroup()
  })    
  }

  estudiantes = [
    { id:1, estudianteName:"Juanita"},
    { id:2, estudianteName:"Petra"}
  ]  
  getExamEstudiantes(){
    return this.estudiantes;    
  }  

  maestros = [
    { id: 1, nombre:"Tania", apellidoPaterno:"Zepeda", apellidoMaterno:"Zamudio"},
    { id: 1, nombre:"Sonia", apellidoPaterno:"Sepulveda", apellidoMaterno:"Solorio"}
  ]

  getExamMaestros(){
    return this.maestros
  }
  getAnyClass(obj) {
    if (typeof obj === "undefined") return "undefined";
    if (obj === null) return "null";
    return obj.constructor.name;
  }  

}
