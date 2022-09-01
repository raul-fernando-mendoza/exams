import { Component, OnInit } from '@angular/core';
import { Exam, ExamRequest, Materia, MateriaRequest } from '../exams/exams.module';
import { db } from 'src/environments/environment';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { UserLoginService } from '../user-login.service';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { UserPreferencesService } from '../user-preferences.service';
import { DialogNameDialog } from '../name-dialog/name-dlg';
import * as uuid from 'uuid';
import { Alert } from 'selenium-webdriver';

@Component({
  selector: 'app-materia-list',
  templateUrl: './materia-list.component.html',
  styleUrls: ['./materia-list.component.css']
})
export class MateriaListComponent implements OnInit {

  materias:Array<Materia> = []
 
  submitting = false

  organization_id:string

  constructor(
 
      private router: Router
    , private usetPreferenceService:UserPreferencesService
    , private userLoginService:UserLoginService
    , private userPreferenceService:UserPreferencesService
    , private examImprovisationService:ExamenesImprovisacionService
    , private dialog: MatDialog,
  ) { 
    this.organization_id = this.usetPreferenceService.getCurrentOrganizationId()
  }

  ngOnInit(): void {

    this.update()
  }

  update(){
    this.loadMaterias()
  }

  loadMaterias():Promise<void>{
    this.materias.length = 0
    return new Promise<void>((resolve, reject) =>{
      db.collection("materias")
      .where("organization_id","==", this.usetPreferenceService.getCurrentOrganizationId())
      .where("isDeleted","==", false)
      .get().then( snapshot =>{
        snapshot.docs.map( doc =>{
          const materia = doc.data() as Materia
          this.materias.push(materia)          
        })
        this.materias.sort( (a,b) => {return a.materia_name > b.materia_name? 1:-1})
        resolve()
      },
      reason =>{
        reject()
      })
    })
  }


  onEditMateria(materia:Materia){
    this.router.navigate(['/materia-edit',{materia_id:materia.id}]);
  }
  onCreateMateria(){
    const dialogRef = this.dialog.open(DialogNameDialog, {
      height: '400px',
      width: '250px',
      data: { label:"Materia", name:""}
    });
  
    dialogRef.afterClosed().subscribe(data => {
      console.log('The dialog was closed');
      if( data != undefined ){
        console.debug( data )
        this.createMateria(data.name).then( (id)=>{
          this.router.navigate(['/materia-edit',{materia_id:id}]);
        },
        reason =>{
          alert("ERROR: removing level")
        })
      }
      else{
        console.debug("none")
      }
    });
  }
  
 
  

  createMateria( materia_name ):Promise<string>{
    return new Promise<string>( (resolve, reject) =>{
      const id =uuid.v4()
      this.submitting = true
      db.collection("materias").doc(id).set({
        id:id,
        materia_name:materia_name,
        isDeleted:false,
        organization_id:this.organization_id
      }).then( () =>{
        this.submitting = false
        console.log("materia created")
        resolve( id )
      },
      reason =>{
        this.submitting = false
        alert("ERROR: Can not create materia:" + reason)
        reject( reason )
      })
    })

  }

  onRemoveMateria(materia_id, materia_name){
    if( !confirm("Esta seguro de querer borrar la materia:" + materia_name) ){
      return
    }
    else{
      this.submitting = true
      db.collection("materias").doc(materia_id).update({"isDeleted":true}).then(()=>{
        this.submitting = false
        this.update() 
      })

    }
    
  }  
  onDuplicateMateria(materia_id:string, materia_label:string){
    this.submitting = true
    
    this.duplicateMateria(materia_id, materia_label).then( () =>{
      this.submitting = false
      this.update()
    },
    reason=>{
      alert("duplicate failed" + reason)
      this.submitting = false
    })
  }

  duplicateMateria(materia_id, materia_name:string):Promise<void>{
    
    var _resolve
    var _reject
    return new Promise<null>((resolve, reject)=>{
      _resolve = resolve
      _reject = reject
      var req = {
        materias:{
          id:materia_id,

          materia_name:materia_name + "_copy"
        }
      }
      this.userLoginService.getUserIdToken().then( token => {
        this.examImprovisationService.firestoreApiInterface("dupSubCollection", token, req).subscribe(
          data => { 
            var exam:Exam = data["result"]
            _resolve()
          },   
          error => {  
            console.error( "ERROR: duplicando examen:" + JSON.stringify(req))
            _reject()
          }
        )
      },
      error => {
        alert("Error in token:" + error.errorCode + " " + error.errorMessage)
        this.submitting = false
      }) 
    }) 
       
  }


}
