import { AfterViewInit, Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { EiApplicationTableDataSource, MateriaItem } from './ei-tipo-list-datasource';
import { Router } from '@angular/router';
import { ExamenesImprovisacionService} from '../examenes-improvisacion.service'
import { UserLoginService } from '../user-login.service';
import { Exam, ExamMultipleRequest, ExamRequest, Materia, MateriaMultipleRequest, MateriaRequest} from 'src/app/exams/exams.module'
import { stringify } from '@angular/compiler/src/util';
import { materialize } from 'rxjs/operators';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

var ex_types: MateriaItem[] = [];

@Component({
  selector: 'app-ei-tipo-list',
  templateUrl: './ei-tipo-list.component.html',
  styleUrls: ['./ei-tipo-list.component.css']
})

export class EiTipoListComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<MateriaItem>;
  dataSource: EiApplicationTableDataSource;

  materia_new = "Hola"
 
  materiaItems:Array<MateriaItem> = new Array()

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = [ 'label', 'docente_requerido', 'ejecutante_requerido', 'id'];
  submitting = false

  constructor( private router: Router
    , private examImprovisacionService: ExamenesImprovisacionService
    , private userLoginService:UserLoginService
    , private fb: FormBuilder
    , public dialog: MatDialog
  ) {}

  materiasList:FormGroup = this.fb.group({
    materias: new FormArray([])
  })

  ngOnInit() {
  }

  ngAfterViewInit() {
    
    this.updateList()
  }

  updateList(){

    var req:MateriaMultipleRequest = {
      materia:[{
        id:null,
        label:null,
      }],
      orderBy:
        { field:"label" }
    }
    this.submitting = true
    this.userLoginService.getUserIdToken().then( token => {
      this.submitting = false
      this.examImprovisacionService.firestoreApiInterface("get", token, req).subscribe( data =>{
        var materiaList:Materia[] = data["result"]
        materiaList.forEach( m => {
          var i:MateriaItem = {
            id:m.id,
            label:m.label,
            materia_id:m.id,
            materia_name:m.label,            
            docente_requerido:false,
            ejecutante_requerido:false,
            nodeClass:"Materia",
            formGroup:null            
          }
          this.materiaItems.push(i)
          this.loadExamList( m.id, m.label )
        })
        this.dataSource = new EiApplicationTableDataSource(this.materiaItems)
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.table.dataSource = this.dataSource;          

      })
    })

  }

  loadExamList(materia_id, materia_label){

    var req:ExamMultipleRequest = {
      exams:[{
        id:null,
        label:null,
        materia_id:materia_id,
        materia_label:materia_label
      }],
      orderBy:
        { field:"label" }
    }
    this.submitting = true
    this.userLoginService.getUserIdToken().then( token => {
      this.submitting = false
      this.examImprovisacionService.firestoreApiInterface("get", token, req).subscribe( data =>{
        var result:Exam[] = data["result"] //ex_types.push( {id:t["id"],name:t["label"]} )
        this.materiaItems= new Array() 
        var previousMateria = ""

        result.forEach( e => {
          if (e.materia_label == null){
            e.materia_id = "abanicos"
            e.materia_label = "abanicos"
          }

           
          var g = this.fb.group({
            id:e.id,          
            docente_requerido:true,
            ejecutante_requerido:true
          })

          if( e.materia_label != previousMateria){
            var m:MateriaItem = {
              id:e.id,
              label:e.materia_label,
              materia_id:e.materia_id,
              materia_name:e.materia_label,            
              docente_requerido:true,
              ejecutante_requerido:true,
              nodeClass:"root",
              formGroup:g            
            }
           
            this.materiaItems.push(m)
            var fa:FormArray = this.materiasList.controls.materias as FormArray
            fa.controls.push(g)
            previousMateria = e.materia_label
          }
          var m:MateriaItem = {
            id:e.id,
            label:e.label,
            materia_id:e.materia_id,
            materia_name:e.materia_label,            
            docente_requerido:true,
            ejecutante_requerido:true,
            nodeClass:"leaf",
            formGroup:g            
          }
          
          this.materiaItems.push(m)
          var fa:FormArray = this.materiasList.controls.materias as FormArray
          fa.controls.push(g)

        })     
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
        label:"Nueva Materia",
        materia_id:null,
        materia_label:null
      }
    }

    this.userLoginService.getUserIdToken().then( token =>{
      this.examImprovisacionService.firestoreApiInterface("add", token, req).subscribe(
        data => {
          console.log(" type update has completed")
          this.submitting = false
          this.updateList()
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
          this.updateList()
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
          this.updateList()
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
  onChange(row){

  }


  onCreateMateria(){
 
    const dialogRef = this.dialog.open(DialogMateriaDialog, {
      height: '400px',
      width: '250px',
      data: {name:""}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if( result != undefined ){
        console.debug( result )
        this.createMateria(result)
      }
      else{
        console.debug("none")
      }

    });

  }
  
  createMateria(materia_label){
    this.submitting = true
    var req:MateriaRequest = {
      materia:{
        id:null,
        label:materia_label
      }
    }

    this.userLoginService.getUserIdToken().then( token =>{
      this.examImprovisacionService.firestoreApiInterface("add", token, req).subscribe(
        data => {
          console.log("Materia Adicionada con existo")
          this.submitting = false
          this.updateList()
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

}

export interface DialogMateriaData {
  name: string
}

/* do not forget to add the dialog to the app.module.ts*/
@Component({
  selector: 'ei-materia-dlg',
  templateUrl: 'ei-materia-dlg.html',
})
export class DialogMateriaDialog { 
  
  constructor(
    public dialogRef: MatDialogRef<DialogMateriaDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogMateriaData) {}

  closeDialog() {
    this.dialogRef.close('Pizza!');
  }
}


