import { Component, Inject, OnDestroy, OnInit, signal, ViewChild } from "@angular/core"
import { FormArray, FormControl, FormGroup, Validators, FormBuilder } from "@angular/forms"
import { MatDialog , MatDialogRef as MatDialogRef,  MAT_DIALOG_DATA } from "@angular/material/dialog"
import { MatSelectChange as MatSelectChange, MatSelectModule } from "@angular/material/select"
import { ExamenesImprovisacionService } from "../examenes-improvisacion.service"
import { CertificateType, Exam, Laboratory, Materia, MateriaEnrollment } from "../exams/exams.module"
import { UserLoginService } from "../user-login.service"
import { db , storage  } from 'src/environments/environment';



import { ActivatedRoute, Router } from "@angular/router"
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
import { MateriaLaboratoryListComponent } from "../materia-laboratory-list/materia-laboratory-list.component"
import { MateriaExamsListComponent } from "../materia-exams-list/materia-exams-list.component"

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
      ,MateriaLaboratoryListComponent
      ,MateriaExamsListComponent
    ],      
    templateUrl: 'materia-edit.html',
    styleUrls: ['materia-edit.css']
  })

export class DialogMateriaDialog implements OnInit{ 
   
  materia_observable: Observable<Materia> 

  materia = signal<Materia | null>(null)

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

  isAdmin:boolean = false

  isLoggedIn =false

  snapshots=Array<any>()

  userUid= null
  isEnrolled = false
  materiaEnrollment = signal<MateriaEnrollment|null>(null)

  materiaReferenceCollection = null

  submitting = signal(true)

  constructor(
      private fb: FormBuilder
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
      this.isAdmin = true
    }   
    if( this.userLoginService.getUserUid() ){
      this.isLoggedIn = true
      this.userUid = this.userLoginService.getUserUid()
    }
    if( this.route.snapshot.paramMap.get('materia_id') != 'null'){
      this.materia_id = this.route.snapshot.paramMap.get('materia_id')
      this.materiaReferenceCollection = "materias/" + this.materia_id + "/materiaReference"
    }

    
        
  }
  ngOnInit(): void {
    this.loadMastersList()
    this.update()
  }

  

  update(){
    this.examImprovisacionService.hasMateriaEnrollment(this.organization_id, this.materia_id, this.userUid).then( isEnrolled =>{
      this.isEnrolled = isEnrolled

      if( this.isEnrolled ){
        this.examImprovisacionService.getMateriaEnrollment(this.organization_id, this.materia_id, this.userUid).then( materiaEnrollment =>{
          this.materiaEnrollment.set( materiaEnrollment )
        })
      }
          
                  
      var unsubscribe = db.collection("materias").doc(this.materia_id).onSnapshot( 
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
          this.m.controls.label1.setValue("") 
          this.m.controls.label2.setValue("") 
          this.m.controls.label3.setValue("") 
          this.m.controls.label4.setValue("") 
          this.m.controls.color1.setValue("") 
          this.m.controls.color2.setValue("") 
          this.materia.set(m)
          
      }) 
    })  
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

  onEnroll(){
    if( this.userLoginService.getUserUid() ){

      this.router.navigate(['/payment',{"productId":"prod_MNGiZUsnJ1PA2t", "materiaId":this.materia_id}]);

    }      
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
    alert("url ha sido copiada al portapapeles")
  }    
  getMateriaReferenceCollection(){
    return this.materiaReferenceCollection
  }
}


  