import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { EiApplicationTableDataSource, EiApplicationTableItem } from './ei-tipo-list-datasource';
import { Router } from '@angular/router';
import { ExamenesImprovisacionService} from '../examenes-improvisacion.service'
import { UserLoginService } from '../user-login.service';
import { Exam, ExamMultipleRequest, ExamRequest} from 'src/app/exams/exams.module'
import { stringify } from '@angular/compiler/src/util';

var ex_types: EiApplicationTableItem[] = [];



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
  displayedColumns = [ 'label', 'id'];
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

    var req:ExamMultipleRequest = {
      exams:[{
        id:null,
        label:null
      }],
      orderBy:
        { field:"label" }
    }
    this.submitting = true
    this.userLoginService.getUserIdToken().then( token => {
      this.submitting = false
      this.examImprovisacionService.firestoreApiInterface("get", token, req).subscribe( data =>{
        var result:Exam[] = data["result"] //ex_types.push( {id:t["id"],name:t["label"]} )
        this.dataSource = new EiApplicationTableDataSource(result)
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.table.dataSource = this.dataSource;      
      },
      error => {
        alert("Error loading improvisation exam types"+ error.error)
      })
    },
    error => {
      this.submitting = false
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })  

  }

  editar(row_id){
    this.router.navigate(['/ei-tipo-edit',{id:row_id}]);
  }

  createType(){
    this.submitting = true
    var req:ExamRequest = {
      exams:{
        id:null,
        label:"Nueva Materia"
      }
    }

    this.userLoginService.getUserIdToken().then( token =>{
      this.examImprovisacionService.firestoreApiInterface("add", token, req).subscribe(
        data => {
          console.log(" type update has completed")
          this.submitting = false
          this.loadTypeList()
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
    var req:ExamRequest = {
      exams:{
        id:id
      }
    }

    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.firestoreApiInterface("delete", token, req).subscribe(
        data => {
          console.log("delete has completed")
          this.loadTypeList()
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

  onCopy(row){
    this.submitting=true;

    var req:ExamRequest = {
      exams:{
        id:row["id"],
        label:row["label"]
      }
    }
    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.firestoreApiInterface("dupDocument", token, req).subscribe(
        data => { 
          var exam:Exam = data["result"]
          this.loadTypeList()
        },   
        error => {
          alert("error loading impro type")
          console.log(JSON.stringify(req))
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
