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
import { db } from 'src/environments/environment';
import { UserPreferencesService } from '../user-preferences.service';

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


 
  materiaItems:Array<MateriaItem> = new Array()

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = [ 'label', 'docente_requerido', 'ejecutante_requerido', 'id'];
  submitting = false

  constructor( private router: Router
    , private examImprovisacionService: ExamenesImprovisacionService
    , private userLoginService:UserLoginService
    , private fb: FormBuilder
    , public dialog: MatDialog
    , private userPreferencesService:UserPreferencesService
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

    db.collection("materias").where("owners","array-contains","uZP1VwpZJCg8zjMrnHNwh7s2Q3e2").where("isDeleted","==",false).get().then( 
      snapshot =>{
        var docs = snapshot.forEach(doc =>{
          var materiaItem:MateriaItem = {
            materia_id:doc.id,
            materia_name:doc.data().materia_name,            
            nivel_id:doc.data().nivel_id,
            nivel_name:doc.data().nivel_name,

            docente_requerido:doc.data().docente_requerido,
            ejecutante_requerido:doc.data().ejecutante_requerido,
            interprete_requerido:doc.data().interprete_requerido,
            organization_id:doc.data().organization_id,
            formGroup:this.fb.group({
              docente_requerido:[doc.data().docente_requerido],
              ejecutante_requerido:[doc.data().ejecutante_requerido], 
              interprete_requerido:[doc.data().interprete_requerido]
            })
          }
          this.materiaItems.push(
            materiaItem
          )
          console.log( doc.id  )
          console.log( doc.data() )      
        })
        this.dataSource = new EiApplicationTableDataSource(this.materiaItems)
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.table.dataSource = this.dataSource;          
        console.log( "***DONE***" )
      },
      reason => {
        alert(reason)
      }
    )  

        
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
    var materia_name:string = ""
    var nivel:number = 1
 
    const dialogRef = this.dialog.open(DialogMateriaDialog, {
      height: '400px',
      width: '250px',
      data: {materia_name:materia_name, nivel:nivel }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if( result != undefined ){
        console.debug( result )
        this.createMateria(result.materia_name, result.nivel)
      }
      else{
        console.debug("none")
      }

    });

  }
  
  async createMateria(materia_name:string, nivel:number){
    this.submitting = true

    const res = await  db.collection('materias').add({
      id:null,
      materia_name:materia_name,
      nivel:nivel,
      owners:[this.userLoginService.getUserUid()],
    
      docente_requerido:false,
      ejecutante_requerido:false,
      interprete_requerido:false,

      isDeleted:false,
      organization_id:this.userPreferencesService.getCurrentOrganizationId()
    });
    this.submitting = false
  }
}

export interface DialogMateriaData {
  materia_name: string
  nivel:string
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


