import { Component, OnDestroy, OnInit } from '@angular/core';
import { Exam, ExamRequest, Materia, MateriaEnrollment, MateriaRequest } from '../exams/exams.module';
import { db } from 'src/environments/environment';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { UserLoginService } from '../user-login.service';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { UserPreferencesService } from '../user-preferences.service';
import { DialogNameDialog } from '../name-dialog/name-dlg';
import * as uuid from 'uuid';
import { Alert } from 'selenium-webdriver';

interface MateriaItem{
  materia:Materia
  materiaEnrollment:MateriaEnrollment
  
}

@Component({
  selector: 'app-materia-list',
  templateUrl: './materia-list.component.html',
  styleUrls: ['./materia-list.component.css']
})
export class MateriaListComponent implements OnInit , OnDestroy{

  materiasList:Array<MateriaItem> = []
 
  submitting = false

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
      this.submitting = true
      this.unsubscribe = db.collection("materias")
      .where("organization_id","==", this.organization_id)
      .where("isDeleted","==", false)
      .onSnapshot( snapshot =>{
        this.materiasList.length = 0
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
          this.materiasList.push(materiaItem)          
        })
        this.materiasList.sort( (a,b) => {return a.materia.materia_name > b.materia.materia_name? 1:-1})
        this.submitting = false
        resolve()
      },
      reason =>{
        this.submitting = false
        console.log("materias where not loaded:" + reason)
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
        this.submitting = false
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
