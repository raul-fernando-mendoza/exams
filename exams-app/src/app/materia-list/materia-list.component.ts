import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Exam, ExamRequest, Materia, MateriaEnrollment, MateriaRequest } from '../exams/exams.module';
import { db } from 'src/environments/environment';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { UserLoginService } from '../user-login.service';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog , MatDialogRef as MatDialogRef,  MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import { UserPreferencesService } from '../user-preferences.service';
import { DialogNameDialog } from '../name-dialog/name-dlg';
import * as uuid from 'uuid';
import { Alert } from 'selenium-webdriver';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';

interface MateriaItem{
  materia:Materia
  materiaEnrollment:MateriaEnrollment
  
}

@Component({
  selector: 'app-materia-list',
  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule   
   
    ,FormsModule
    ,ReactiveFormsModule
    ,MatFormFieldModule
    ,MatInputModule 

    ,MatDialogModule  
    ,MatButtonToggleModule
    ,MatProgressSpinnerModule
    ,MatMenuModule
    ,MatCardModule 
  ],    
  templateUrl: './materia-list.component.html',
  styleUrls: ['./materia-list.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class MateriaListComponent implements OnInit , OnDestroy{

  materiasList = signal( new Array<MateriaItem>() )
 
  submitting = signal(false)

  organization_id:string
  isAdmin = false

  search = null

  enrolledOnly = false

  unsubscribe = null
  userUid = null

  constructor(
 
      private router: Router
    , private userPreferenceService:UserPreferencesService
    , private userLoginService:UserLoginService
    , private examImprovisationService:ExamenesImprovisacionService
    , private dialog: MatDialog,
  ) { 
    this.organization_id = this.userPreferenceService.getCurrentOrganizationId()
    this.isAdmin = this.userLoginService.hasRole("role-admin-" + this.organization_id)
    this.userUid = this.userLoginService.getUserUid()
  }
  ngOnDestroy(): void {
    this.unsubscribe()
  }

  ngOnInit(): void {

    this.update()
  }

  update(){
    this.loadMaterias()
  }

  loadMaterias():Promise<void>{
    return new Promise<void>((resolve, reject) =>{
      this.submitting.set(true)
      this.unsubscribe = db.collection("materias")
      .where("organization_id","==", this.organization_id)
      .where("isDeleted","==", false)
      .onSnapshot( snapshot =>{
        this.submitting.set(false)
        let newMateriasList = new Array<MateriaItem>()
        snapshot.docs.map( doc =>{
          const materia = doc.data() as Materia

          var materiaItem:MateriaItem = {
            materia:materia,
            materiaEnrollment:null
          }
          this.examImprovisationService.getMateriaEnrollment( this.organization_id, materia.id, this.userUid).then( materiaEnrollement =>{
            if( materiaEnrollement){
              this.enrolledOnly = true
            }
            materiaItem.materiaEnrollment = materiaEnrollement
          }
          ,reason=>{
            console.log("ERROR when reading getMateriaEnrollment:" + reason)
          })
          newMateriasList.push(materiaItem)          
        })
        newMateriasList.sort( (a,b) => {return a.materia.materia_name > b.materia.materia_name? 1:-1})
        
        this.materiasList.set( newMateriasList )
        resolve()
      },
      reason =>{
        this.submitting.set(false)
        console.log("materias where not loaded:" + reason)
        reject(reason)
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
      this.submitting.set(true)
      db.collection("materias").doc(id).set({
        id:id,
        materia_name:materia_name,
        isDeleted:false,
        organization_id:this.organization_id
      }).then( () =>{
        this.submitting.set(false)
        console.log("materia created")
        resolve( id )
      },
      reason =>{
        this.submitting.set(false)
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
      this.submitting.set(true)
      db.collection("materias").doc(materia_id).update({"isDeleted":true}).then(()=>{
        this.submitting.set(false)
        this.update() 
      })

    }
    
  }  
  onDuplicateMateria(materia_id:string, materia_label:string){
    this.submitting.set(true)
    
    this.duplicateMateria(materia_id, materia_label).then( () =>{
      this.submitting.set(false)
      this.update()
    },
    reason=>{
      alert("duplicate failed" + reason)
      this.submitting.set(false)
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
      var options = {
        exceptions:["Reference","references","laboratory","Path","Url"]
      }
      this.userLoginService.getUserIdToken().then( token => {
        this.examImprovisationService.firestoreApiInterface("dupDocument", token, req, options).subscribe(
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
        this.submitting.set(false)
      }) 
    }) 
       
  }

  isSearched( materiaItem:MateriaItem ):string{
    if( this.enrolledOnly && (materiaItem.materiaEnrollment == null)){
      return "hidden"
    }
    if( this.search != null && this.search.length > 1){
      if( materiaItem.materia.materia_name.toUpperCase().includes(this.search.toUpperCase()) != true ){
        return "hidden"
      }
      else return ""
      
    }
    else{
      return ""
    }
  }


}
