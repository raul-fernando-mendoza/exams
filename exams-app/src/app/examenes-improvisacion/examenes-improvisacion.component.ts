import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { ExamenesImprovisacionDataSource, ExamenesImprovisacionItem } from './examenes-improvisacion-datasource';
import { ExamenesImprovisacionService} from '../examenes-improvisacion.service'
import { ActivatedRoute, Router } from '@angular/router';
import { UserLoginService } from '../user-login.service';
import { UserLoginCredentials } from '../UserLoginCredentials';




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
  displayedColumns = ['materia', 'estudiante', 'maestro', 'tipo', 'parametro', 'fechaApplicacion', 'completado',"id"];
  
  constructor( private route: ActivatedRoute
    , private router: Router
    , private userLoginService: UserLoginService
    , private examImprovisacionService: ExamenesImprovisacionService
    ) {
      

  }

  submitting = false
  
  ngOnInit() {

    this.isAdmin = this.userLoginService.hasRole("admin")

    var maestro_email = ( this.isAdmin ? "": this.userLoginService.getUserEmail() )
    var completado:any 

    if( this.isAdmin ){
      completado = ""
    }
    else{
      completado = false
    }

    var request = {
        "exam_impro_ap_parameter":[{
            "id":"",
            "completado":"",
            "maestro:user":{
                "email":maestro_email,
                "displayName":"" 
            },
            "exam_impro_ap":{
                "fechaApplicacion":"",
                "completado":"",
                "materia":"",
                "estudiante:user":{
                    "email":"",
                    "displayName":""
                }
            },
            "exam_impro_parameter":{
                "label":"",
                "exam_impro_type":{
                    "label":""
                }  
            }
        }]
    }

    var token = this.userLoginService.getUserIdToken() 

    this.examImprovisacionService.chenequeApiInterface("get", token, request).subscribe(
        result => { 
        
          let datavalues: ExamenesImprovisacionItem[] = [];

          var examImprovisationArray = result["result"];

          for(var i=0; examImprovisationArray!=null && i<examImprovisationArray.length;i++){
            let exam = examImprovisationArray[i]
            console.log(exam.id)
            var obj:ExamenesImprovisacionItem = {
              id: exam.id, 
              materia: exam.exam_impro_ap.materia,
              estudiante: (exam.exam_impro_ap.estudiante.displayName != null)? exam.exam_impro_ap.estudiante.displayName: exam.exam_impro_ap.estudiante.email,
              maestro: (exam.maestro.displayName!=null)?exam.maestro.displayName:exam.maestro.email,
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
        err => {
          if( err.status == 401 ){
            this.router.navigate(['/loginForm']);
          }
          else{
            alert("ERROR al leer lista de improvisacion:" + err.error)
          }
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
  onRemove(id){
    this.submitting=true
    var request = {
      exam_impro_ap_parameter:{
        id:id
      }
    }

    var token = this.userLoginService.getUserIdToken() 

    this.examImprovisacionService.chenequeApiInterface("delete", token, request).subscribe(
      data => {
        this.submitting=false
        console.log("delete compled successfully")
        this.ngOnInit()
      },
      error =>{
        this.submitting=false
        alert("error en delete:" + error.error)
      }
    )
  }   
}
