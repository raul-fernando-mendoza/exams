import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { EiApplicationTableDataSource, EiApplicationTableItem } from './ei-tipo-list-datasource';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamenesImprovisacionService} from '../examenes-improvisacion.service'
import { UserLoginService } from '../user-login.service';

var exam_types: EiApplicationTableItem[] = [];



@Component({
  selector: 'app-ei-tipo-list',
  templateUrl: './ei-tipo-list.component.html',
  styleUrls: ['./ei-tipo-list.component.css']
})
export class EiTipoListComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<EiApplicationTableItem>;
  dataSource: EiApplicationTableDataSource;

  


  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = [ 'name', 'id'];
  submitting = false

  constructor( private router: Router
    , private examImprovisacionService: ExamenesImprovisacionService
    , private userLoginService:UserLoginService
    ) {
      

  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.loadTypeList()
  }

  loadTypeList(){
    var request = {
      exam_impro_type:[{ 
        id:"",
        label:""
      }]
    }
    this.userLoginService.getUserIdToken().then( token => {

      this.examImprovisacionService.chenequeApiInterface("get", token, request).subscribe( data =>{
        var result = data["result"] //exam_types.push( {id:t["id"],name:t["label"]} )
        exam_types = []
        result.forEach(t => {
          exam_types.push( {id:t["id"],name:t["label"]} ) 
        })
        this.dataSource = new EiApplicationTableDataSource(exam_types)
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.table.dataSource = this.dataSource;      
      },
      error => {
        alert("Error loading improvisation exam types"+ error.error)
      })
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })  

  }

  editar(row_id){
    this.router.navigate(['/ei-tipo-edit',{id:row_id}]);
  }

  createType(){
    this.submitting = true
    var exam_impro_type_req = {
      exam_impro_type:{
        id:null,
        label:"Tipo de Examen nuevo"
      }
    }

    this.userLoginService.getUserIdToken().then( token =>{
      this.examImprovisacionService.chenequeApiInterface("add", token, exam_impro_type_req).subscribe(
        data => {
          console.log(" type update has completed")
          this.submitting = false
          this.ngAfterViewInit()
        },
        error => {
          alert("error:" + error.error)
          this.submitting = false
        }
      )   
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })
  }
  borrar(id){
    this.submitting = true
    var exam_impro_type_req = {
      exam_impro_type:{
        id:id
      }
    }

    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.chenequeApiInterface("delete", token, exam_impro_type_req).subscribe(
        data => {
          console.log("delete has completed")
          this.ngAfterViewInit()
          this.submitting = false
        },
        error => {
          alert("error:" + error.error)
          this.submitting = false
        }
      )
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })    
  }

  onCopy(id:number){
    this.submitting=true;
    var request = {
      exam_impro_type:{
        id:id,
        label:"",
        "exam_impro_parameter(+)":[{
          label:"",
          idx:"",
          description:"",
          "exam_impro_criteria(+)":[{
            label:"",
            initially_selected:"",
            idx:"",
            description:"",
            "exam_impro_question(+)":[{
              label:"",
              description:"",
              points:"",
              idx:"",
              itemized:"",
              "exam_impro_observation(+)":[{
                label:"",
                description:"",
                idx:""
              }]
            }]
          }]
        }],
      },
      "orderBy":{
        "exam_impro_type.label":"",
      }
    }
    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.chenequeApiInterface("get", token, request).subscribe(
        data => { 
          var tipo = data["result"]
          tipo["id"] = null
          tipo["label"] = tipo["label"] + "-copia"

          var request_add = {
            exam_impro_type:tipo
          }
          this.examImprovisacionService.chenequeApiInterface("add", token, request_add).subscribe(
            data_add => {
              this.loadTypeList()
              this.submitting = false
            },
            error_add =>{
              alert( "Error:" + error_add.error.error)
              this.submitting = false
            }
          )
        },   
        error => {
          alert("error loading impro type")
          console.log(JSON.stringify(request))
          this.submitting = false
        }
      )
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
      this.submitting = false
    }) 
  }
}
