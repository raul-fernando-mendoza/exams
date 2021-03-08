import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { ExamenesImprovisacionDataSource, ExamenesImprovisacionItem } from './examenes-improvisacion-datasource';
import { ExamenesImprovisacionService} from '../examenes-improvisacion.service'
import { ActivatedRoute, Router } from '@angular/router';



@Component({
  selector: 'app-examenes-improvisacion',
  templateUrl: './examenes-improvisacion.component.html',
  styleUrls: ['./examenes-improvisacion.component.css']
})
export class ExamenesImprovisacionComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<ExamenesImprovisacionItem>;
  dataSource: ExamenesImprovisacionDataSource;
  token:""
  isAdmin=false

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['materia', 'estudiante', 'maestro', 'tipo', 'parametro', 'fechaApplicacion', 'completado'];
  
  constructor( private route: ActivatedRoute
    , private router: Router
    , private examImprovisacionService: ExamenesImprovisacionService
    ) {
      

  }
  ngOnInit() {

    var user = JSON.parse(localStorage.getItem('exams.app'));

    if( !user  ){
      this.gotoLogin()
    }
    var maestro_id = ""
    var completado = "0";
    for( let i=0; i< user.user_role.length;i++){
      let r = user.user_role[i]
      if( r.role_id == 'Admin'){
        this.isAdmin=true
        completado = ""
        break
      }
    }
    for( let i =0; this.isAdmin==false && i<user.user_attribute.length; i++){
      let a = user.user_attribute[i]
      if( a.attribute_name == "maestro_id" ){
        maestro_id = a.attribute_value
      }
    }
  
    

    var request = {
      exam_impro_ap_parameter:[{
        id:"",
        completado:completado,
        maestro:{
          id:maestro_id,
          nombre:"",
          apellidoPaterno:"",
          apellidoMaterno:"" 
        },
        exam_impro_ap:{
          fechaApplicacion:"",
          completado:"",
          materia:"",
          estudiante:{
            nombre:"",
            apellidoPaterno:"",
            apellidoMaterno:""
          }
        },
        exam_impro_parameter:{
          label:"",
          exam_impro_type:{
            label:""
          }  
        }
      }]
    }

    this.examImprovisacionService.chenequeApiInterface("get", request).subscribe(data => { 
      
      let datavalues: ExamenesImprovisacionItem[] = [];

      var examImprovisationArray = data["result"];

      for(var i=0; i<examImprovisationArray.length;i++){
        let exam = examImprovisationArray[i]
        console.log(exam.id)
        var obj:ExamenesImprovisacionItem = {
          id: exam.id, 
          materia: exam.exam_impro_ap.materia,
          estudiante: exam.exam_impro_ap.estudiante.nombre + " " + exam.exam_impro_ap.estudiante.apellidoPaterno,
          maestro: exam.maestro.nombre,
          tipo: exam.exam_impro_parameter.exam_impro_type.label,
          parametro:exam.exam_impro_parameter.label,
          fechaApplicacion:exam.exam_impro_ap.fechaApplicacion.substring(0, 10), 
          completado: exam.completado 
        }
        datavalues.push(obj)
      }
      this.dataSource = new ExamenesImprovisacionDataSource(datavalues);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.table.dataSource = this.dataSource;    
    },
    error => {
      if( error.status == 401 ){
        this.router.navigate(['/loginForm']);
      }
      else{
        alert("ERROR al leer lista de improvisacion:" + error.error)
      }
      
    });   
  }

  ngAfterViewInit() {

  }
  onCreate(){
    this.router.navigate(['/ExamenImprovisacionFormComponent']);
  }
  onEdit(id){
    this.router.navigate(['/ei-ap-parameter-form-component',{id:id}]);
  }
  gotoLogin() {
    this.router.navigate(['/loginForm']);
  }   
}
