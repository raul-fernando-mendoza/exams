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
    var request = {
      exam_impro_type:[{ 
        id:"",
        label:""
      }]
    }
    var token = this.userLoginService.getUserIdToken() 

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

    var token = this.userLoginService.getUserIdToken() 

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
  }
  borrar(id){
    this.submitting = true
    var exam_impro_type_req = {
      exam_impro_type:{
        id:id
      }
    }

    var token = this.userLoginService.getUserIdToken() 

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
  }
}