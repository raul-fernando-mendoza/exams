import { Component, inject, OnDestroy, OnInit, signal } from "@angular/core"
import { FormGroup, Validators, FormBuilder } from "@angular/forms"
import { MatDialog , MatDialogRef as MatDialogRef,  MAT_DIALOG_DATA } from "@angular/material/dialog"
import { MatSelectChange as MatSelectChange, MatSelectModule } from "@angular/material/select"
import { ExamenesImprovisacionService } from "../examenes-improvisacion.service"
import { CertificateType, COLORS, Exam, Laboratory, Materia, MateriaEnrollment, User } from "../exams/exams.module"
import { UserLoginService } from "../user-login.service"
import { db } from 'src/environments/environment';



import { ActivatedRoute, Router, RouterModule } from "@angular/router"
import * as uuid from 'uuid';
import { NavigationService } from "../navigation.service"
import { UserPreferencesService } from "../user-preferences.service"
import { Observable, Observer } from "rxjs"
import { FileLoadObserver } from "../load-observers/load-observers.module"
import { DialogNameDialog } from "../name-dialog/name-dlg"
import { FileLoadedEvent, FileLoaderComponent } from "../file-loader/file-loader.component"


import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MatInputModule } from '@angular/material/input';

import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"
import { MatCheckboxModule } from "@angular/material/checkbox"
import { MatCardModule } from "@angular/material/card"
import { MateriaExamsListComponent } from "../materia-exams-list/materia-exams-list.component"
import { MatExpansionModule } from "@angular/material/expansion"
import { MateriaExamsShortListComponent } from "../materia-exams-shortlist/materia-exams-shortlist.component"
import {
  MatSnackBar,
  MatSnackBarAction,
  MatSnackBarActions,
  MatSnackBarLabel,
  MatSnackBarRef
} from '@angular/material/snack-bar';
import { ReferenceComponent } from "../reference-list/reference-list"
import { MatMenuModule } from "@angular/material/menu"

/* do not forget to add the dialog to the app.module.ts*/
@Component({
    selector: 'materia-edit',
    standalone: true,
    imports: [
      CommonModule
      ,MatIconModule
      ,MatButtonModule   
     
      ,FormsModule
      ,ReactiveFormsModule
      ,MatFormFieldModule
      ,MatCardModule 
      ,MatInputModule 
      ,MatCheckboxModule
      ,MatSelectModule
  
      ,MatDialogModule  
      ,MatProgressSpinnerModule
      ,FileLoaderComponent
      
      ,MatExpansionModule
      ,MateriaExamsListComponent
      ,MateriaExamsShortListComponent
      ,ReferenceComponent
      ,RouterModule
      ,MatMenuModule
    ],      
    templateUrl: 'materia-edit.component.html',
    styleUrls: ['materia-edit.component.css']
  })

export class DialogMateriaDialog implements OnInit, OnDestroy{ 
   
  materia_observable: Observable<Materia> 

  materia = signal<Materia>(null)

  examenes:Array<Exam>=[]

  materia_id = null
  m:FormGroup =  this.fb.group({
            id: [""],
            isDeleted:[false],
            materia_name:["", Validators.required],
            
            certificateTypeId:[""],

            description:[""],
            videoUrl:[""],
            videoDescription:[""],
            pictureUrl:[""],
            pictureDescription:[""],
            isEnrollmentActive:[false],
            label1:[""], 
            label2:[""], 
            label3:[""], 
            label4:[""], 
            color1:[""], 
            color2:[""], 
          })

  certificateTypes:Array<CertificateType> = []
  certificateIcons = []

  organization_id:string = null

  selectedFiles

  isAdmin = signal(false)

  isLoggedIn =false

  snapshots=Array<any>()

  userUid= null
  user:User = null
  isEnrolled = false
  materiaEnrollment = signal<MateriaEnrollment>(null)

  materiaReferenceCollection = null

  submitting = signal(true)

  private _snackBar = inject(MatSnackBar);
  durationInSeconds = 5;

  unsubscribe = undefined

  colors = COLORS

  hasExamGrades = signal(false)
  constructor(
      private activatedRoute: ActivatedRoute
      ,private fb: FormBuilder
      ,private route: ActivatedRoute
      ,private router: Router
      ,private examImprovisacionService: ExamenesImprovisacionService
      ,private userLoginService: UserLoginService
      ,private userPreferencesService: UserPreferencesService
      ,private navigationService: NavigationService
      ,public dialog: MatDialog
      ) {
    
    this.organization_id = this.userPreferencesService.getCurrentOrganizationId()
    if( this.userLoginService.hasRole("role-admin-" + this.organization_id) ){
      this.isAdmin.set(true)
    }  
    
    this.user =  this.userLoginService.getUser()

    if( this.userLoginService.getUserUid() ){
      this.isLoggedIn = true
      this.userUid = this.userLoginService.getUserUid()
    }
    var thiz = this
    this.activatedRoute.paramMap.subscribe( {
      next(paramMap){
        thiz.materia_id = null
        if( paramMap.get('materia_id') )
          thiz.materia_id = paramMap.get('materia_id')
          thiz.update()
        }
    })
    
        
  }
  ngOnDestroy(): void {
    this.unsubscribe()
  }
  ngOnInit(): void {
    this.loadMastersList()
    this.update()
  }

  

  update(){
    this.unsubscribe = db.collection("materias").doc(this.materia_id).onSnapshot( 
      snapshot =>{
        this.submitting.set(false)
        let m = snapshot.data() as Materia

        this.m.controls.id.setValue(m.id)
        this.m.controls.isDeleted.setValue(m.isDeleted)
        this.m.controls.materia_name.setValue(m.materia_name)
          
        this.m.controls.certificateTypeId.setValue(m.certificateTypeId)

        this.m.controls.description.setValue(m.description)
        this.m.controls.videoUrl.setValue(m.videoUrl)
        this.m.controls.videoDescription.setValue(m.videoDescription)
        this.m.controls.pictureUrl.setValue(m.pictureUrl)
        this.m.controls.pictureDescription.setValue(m.pictureDescription)
        this.m.controls.isEnrollmentActive.setValue(m.isEnrollmentActive)
        this.m.controls.label1.setValue(m.label1) 
        this.m.controls.label2.setValue(m.label2) 
        this.m.controls.label3.setValue(m.label3) 
        this.m.controls.label4.setValue(m.label4) 
        this.m.controls.color1.setValue(m.color1) 
        this.m.controls.color2.setValue(m.color2) 
        this.materia.set(m)
        
    },
    reason =>{
      alert("ERROR:" + reason)
    }) 

    this.examImprovisacionService.hasMateriaEnrollment(this.organization_id, this.materia_id, this.userUid).then( isEnrolled =>{
      this.isEnrolled = isEnrolled

      if( this.isEnrolled ){
        this.examImprovisacionService.getMateriaEnrollment(this.organization_id, this.materia_id, this.userUid).then( materiaEnrollment =>{
          this.materiaEnrollment.set( materiaEnrollment )
        },
        reason=>{
          alert("ERROR:" + reason)
        })
      }
          
                  
    },
    reason =>{
      alert("Error:" + reason)
    })
    this.getExamGrades()  
  }

  loadMastersList(){
    db.collection("organizations/" + this.organization_id + "/certificateTypes").get().then( typeCertificatesSet =>{
      this.certificateTypes.length = 0
      typeCertificatesSet.docs.map( typeCertificatesDoc =>{
        const typeCertificate:CertificateType = typeCertificatesDoc.data() as CertificateType
        this.certificateTypes.push( typeCertificate )
      })
    })
  }



        
  onPropertyChange(event){
    var propertyName = event.srcElement.attributes.formControlname.value
    var value = event.target.value      
    var values = {}
    values[propertyName]=value                       
    db.collection('materias').doc(this.materia_id).update(values).then( () =>{
      console.log("property has been update:" + propertyName + " " + value)
    },
    reason =>{
      alert("ERROR: writing property:" + reason)
    })
  }

  onCheckboxChange(event){
    var propertyName = event.source.name
    var value = event.checked     
    var values = {}
    values[propertyName]=value                       
    db.collection('materias').doc(this.materia_id).update(values).then( () =>{
      console.log("property has been update:" + propertyName + " " + value)
    },
    reason =>{
      alert("ERROR: writing property:" + reason)
    })
  }


  onSelectChange(event:MatSelectChange, fg:FormGroup){
    console.log("onSelectChange")

    var propertyName = event.source.ngControl.name
    var value = event.source.ngControl.value      
 
    var values = {}
    values[propertyName]=value                                  
    db.collection('materias').doc(this.materia_id).update(values).then( () =>{
      console.log("property has been update:" + propertyName + " " + value)
    },
    reason =>{
      alert("ERROR: writing property:" + reason)
    })   
    
  }   

  public onBlur(propertyName, event:any): void {
    var values = {}
    values[propertyName]=this.m.controls[propertyName].value                                
    db.collection('materias').doc(this.materia_id).update(values).then( () =>{
      console.log("property has been update:" + propertyName + " " + values)
    },
    reason =>{
      alert("ERROR: writing property:" + reason)
    })        
  }  

  getBasePath(){
    return "organizations/" + this.organization_id + "/materias/" + this.m.controls["id"].value  
  }  
  fileLoaded(e:FileLoadedEvent){

    this.examImprovisacionService.fileLoaded('materias', this.materia().id, e)

  }  
  fileDeleted(e:FileLoadedEvent){
    this.examImprovisacionService.fileDeleted('materias', this.materia().id, e)
  }
  onCopyToClipboard(){
    this._snackBar.open("copiado al clipboard", "X",{
      duration: 3000
    });
  }    
  onCertificateTypes( ){
    this.router.navigate(['certificate-type-list',{}])
  }  

  getExamGrades(){
    this.examImprovisacionService.getExamGrades(this.organization_id, this.materia_id, this.userUid ).then( examExamGrades =>{
      examExamGrades.forEach( e=>{
        if( e.examGrade && e.examGrade.isReleased ){
          this.hasExamGrades.set(true)
        }
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
        this.router.navigate(['materia-list',{}]) 
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
        this.examImprovisacionService.firestoreApiInterface("dupDocument", token, req, options).subscribe(
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
}

