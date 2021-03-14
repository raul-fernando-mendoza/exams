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

    this.isAdmin = this.examImprovisacionService.hasRole("Admin")

    var maestro_id = ( this.isAdmin ? "": this.examImprovisacionService.getMaestroID() )
    var completado:any 

    if( this.isAdmin ){
      completado = ""
    }
    else{
      completado = false
    }
    

    if(this.isAdmin == false){
      maestro_id = this.examImprovisacionService.getMaestroID()
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

    this.examImprovisacionService.chenequeApiInterface("get", request).subscribe(
        (result:any) => 
        { 
        
          let datavalues: ExamenesImprovisacionItem[] = [];

          var examImprovisationArray = result["result"];

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
            this.dataSource = new ExamenesImprovisacionDataSource(datavalues);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
            this.table.dataSource = this.dataSource;
          }    
        },
        (err:any) => {
          if( err.status == 401 ){
            this.router.navigate(['/loginForm']);
          }
          else{
            alert("ERROR al leer lista de improvisacion:" + err.error)
          }
        },
        () => {
          console.log('complete');
        }
    ) 
  }

  ngAfterViewInit() {

  }
  onCreate(){
    this.router.navigate(['/ExamenImprovisacionFormComponent']);
  }
  onReport(){
    this.router.navigate(['/eiReporte']);
  }
  onEdit(id){
    this.router.navigate(['/ei-ap-parameter-form-component',{id:id}]);
  }
  gotoLogin() {
    this.router.navigate(['/loginForm']);
  }   
}
