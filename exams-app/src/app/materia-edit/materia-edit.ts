import { Component, Inject, OnInit, ViewChild } from "@angular/core"
import { FormArray, FormControl, FormGroup, Validators, FormBuilder } from "@angular/forms"
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from "@angular/material/legacy-dialog"
import { MatLegacySelectChange as MatSelectChange } from "@angular/material/legacy-select"
import { ExamenesImprovisacionService } from "../examenes-improvisacion.service"
import { CertificateType, Exam, Laboratory, Materia } from "../exams/exams.module"
import { UserLoginService } from "../user-login.service"
import { db , storage  } from 'src/environments/environment';



import { ActivatedRoute, Router } from "@angular/router"
import * as uuid from 'uuid';
import { NavigationService } from "../navigation.service"
import { UserPreferencesService } from "../user-preferences.service"
import { Observable, Observer } from "rxjs"
import { FileLoadObserver } from "../load-observers/load-observers.module"
import { DialogNameDialog } from "../name-dialog/name-dlg"
import { FileLoadedEvent } from "../file-loader/file-loader.component"


var storageRef
var materia_id

/* do not forget to add the dialog to the app.module.ts*/
@Component({
    selector: 'materia-edit',
    templateUrl: 'materia-edit.html',
    styleUrls: ['materia-edit.css']
  })

export class DialogMateriaDialog implements OnInit{ 
   
  materia_observable: Observable<Materia> 

  materia:Materia=null

  examenes:Array<Exam>=[]

  materia_id = null
  m:FormGroup = null
  submitting:boolean = false

  certificateTypes:Array<CertificateType> = []
  certificateIcons = []

  organization_id:string = null

  selectedFiles

  isAdmin:boolean = false

  isLoggedIn =false

  snapshots=Array<any>()

  userUid= null
  isEnrolled = false
  materiaEnrollment = null

  materiaReferenceCollection = null

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
          this.materiaEnrollment = materiaEnrollment
        })
      }
          
                  
      var unsubscribe = db.collection("materias").doc(this.materia_id).onSnapshot( 
        snapshot =>{
          this.materia = snapshot.data() as Materia

          this.m = this.fb.group({
            id: [this.materia.id],
            isDeleted:[this.materia.isDeleted],
            materia_name:[this.materia.materia_name, Validators.required],
            
            certificateTypeId:[this.materia.certificateTypeId],

            description:[this.materia.description],
            videoUrl:[this.materia.videoUrl],
            videoDescription:[this.materia.videoDescription],
            pictureUrl:[this.materia.pictureUrl],
            pictureDescription:[this.materia.pictureDescription],
            isEnrollmentActive:[this.materia.isEnrollmentActive],
            label1:[""], 
            label2:[""], 
            label3:[""], 
            label4:[""], 
            color1:[""], 
            color2:[""], 
          })
          //this.loadExams(this.materia_id, this.m.controls.exams as FormArray)
          //this.loadLaboratories(this.materia_id, this.m.controls.laboratories as FormArray) 
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

    this.examImprovisacionService.fileLoaded('materias', this.materia.id, e)

  }  
  fileDeleted(e:FileLoadedEvent){
    this.examImprovisacionService.fileDeleted('materias', this.materia.id, e)
  }
  onCopyToClipboard(){
    alert("url ha sido copiada al portapapeles")
  }    
  getMateriaReferenceCollection(){
    return this.materiaReferenceCollection
  }
}


  