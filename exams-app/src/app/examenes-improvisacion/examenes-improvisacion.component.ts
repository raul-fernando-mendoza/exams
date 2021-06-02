import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { ExamenesImprovisacionDataSource, ExamenesImprovisacionItem } from './examenes-improvisacion-datasource';
import { ExamenesImprovisacionService} from '../examenes-improvisacion.service'
import { ActivatedRoute, Router } from '@angular/router';
import { UserLoginService } from '../user-login.service';





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


  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['materia', "title", 'estudiante', 'maestro', 'tipo', 'parametro', 'fechaApplicacion', 'completado',"id"];
  
  constructor( private route: ActivatedRoute
    , private router: Router
    , private userLoginService: UserLoginService
    , private examImprovisacionService: ExamenesImprovisacionService
    ) {
      

  }

  submitting = false
  
  ngOnInit() {
    console.log("on init called")

    var maestro_email = ( this.isAdmin() ? "": this.userLoginService.getUserEmail() )
    var completado:any 
    var fechaApplicacion = ( this.isReadOnly() ? new Date().toISOString().slice(0, 10) :"" )    

    if( this.isAdmin() || this.isReadOnly() ){
      completado = ""
      maestro_email = ""
    }
    else{
      completado = false
    }

    if( this.isReadOnly() ){
      const index = this.displayedColumns.indexOf('maestro', 0);
      if (index > -1) {
         this.displayedColumns.splice(index, 1);
      }
    }


    this.userLoginService.getUserIdToken().then(
      token => {
        this.updateList(token, completado, maestro_email, fechaApplicacion)
      },
      error => {
        if( error.status == 401 ){
          this.router.navigate(['/loginForm']);
        }
        else{
          alert("ERROR al leer lista de improvisacion:" + error.errorCode + " " + error.errorMessage)
        }
      }
    )
  }

  updateList( token , completado, maestro_email , fechaApplicacion){
    var request = {
      "exam_impro_ap_parameter":[{
          "id":"",
          "completado":completado,
          "maestro:user":{
              "email":maestro_email,
              "displayName":"" 
          },
          "exam_impro_ap":{
              "fechaApplicacion":fechaApplicacion,
              "completado":"",
              "materia":"",
              "title":"",
              "expression":"",
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
          },
          "exam_impro_calificacion(+)":{
              "calificacion":"",
              "join":{
                  "exam_impro_ap_parameter_id":"exam_impro_ap_parameter.id"
              }
          }
      }],
      orderBy:{
        "exam_impro_ap.fechaApplicacion":"desc",
        "exam_impro_ap.materia":"",
        "exam_impro_parameter.label":""
      }
    }
      
    this.examImprovisacionService.chenequeApiInterface("get", token, request).subscribe(
      result => { 
        var examImprovisationArray = result["result"];
        let datavalues: ExamenesImprovisacionItem[] = [];
        for(var i=0; examImprovisationArray!=null && i<examImprovisationArray.length;i++){
          let exam = examImprovisationArray[i]
    
          //console.log(exam.id)
          var obj:ExamenesImprovisacionItem = {
            id: exam.id, 
            materia: exam.exam_impro_ap.materia,
            title: exam.exam_impro_ap.title,
            estudiante: (exam.exam_impro_ap.estudiante.displayName != null)? exam.exam_impro_ap.estudiante.displayName: exam.exam_impro_ap.estudiante.email,
            maestro:(exam.maestro.displayName!=null)?exam.maestro.displayName:exam.maestro.email,
            tipo: exam.exam_impro_parameter.exam_impro_type.label,
            parametro:exam.exam_impro_parameter.label,
            fechaApplicacion:exam.exam_impro_ap.fechaApplicacion.substring(0, 10), 
            completado: exam.completado,
            calificacion:(exam.exam_impro_calificacion)?exam.exam_impro_calificacion.calificacion:0
          }
          datavalues.push(obj)
        }  
        
        this.dataSource = new ExamenesImprovisacionDataSource(datavalues);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.table.dataSource = this.dataSource;            
    
      },
      error => {
        if( error.error && error.error instanceof String && error.error.search("token")){
          console.log("ERROR al leer lista de examenes:" + error.status + " " + error.error)
          this.router.navigate(['/loginForm'])
        }
        else{
          alert("ha habido un error por favor reintente")
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
  onRemove(row){
    if( !confirm("Esta seguro de querer borrar el examen:" + row.materia + " " + row.estudiante + " " + row.maestro + " " + row.tipo + " " +  row.parametro + " " + row.fechaApplicacion) ){
      return
    }    
    this.submitting=true
    var request = {
      exam_impro_ap_parameter:{
        id:row.id
      }
    }

    
    this.userLoginService.getUserIdToken().then( token => {
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
    },
    error => {
      alert("ERROR al leer lista de examenes:" + error.errorCode + " " + error.errorMessage)
    })
  }  
  
  isAdmin(){
    return this.userLoginService.hasRole("admin")
  }
  isReadOnly(){
    return this.userLoginService.hasRole("readonly")
  }
  isEvaluador(){
    return this.userLoginService.hasRole("evaluador")
  }

  timerId = null

  onRefresh(){
    if( this.timerId != null ){
      console.log("removing timeout")
      clearInterval(this.timerId);
      this.timerId = null
    }
    else{
      console.log("adding timeout")
      this.ngOnInit()
      this.timerId = setInterval(
        () => { 
          console.log("calling refresh")
          this.ngOnInit() 
        }
        , 20000);
    }
  }
}
