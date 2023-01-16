import { Component, Inject, OnInit, ViewChild } from "@angular/core"
import { FormArray, FormControl, FormGroup, Validators, FormBuilder } from "@angular/forms"
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog"
import { MatSelectChange } from "@angular/material/select"
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

  hasEnrollment:boolean

  modules = {
    toolbar: [
    ['bold', 'italic', 'underline', 'strike'], // toggled buttons
    [{ 'header': 1 }, { 'header': 2 }], // custom button values
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'script': 'sub' }, { 'script': 'super' }], // superscript/subscript
    [{ 'indent': '-1' }, { 'indent': '+1' }], // outdent/indent
    [{ 'direction': 'rtl' }], // text direction
    [{ 'size': ['small', false, 'large', 'huge'] }], // custom dropdown
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'color': [] }, { 'background': [] }], // dropdown with defaults from theme
    [{ 'font': [] }],
    [{ 'align': [] }],
    ['clean'] // remove formatting button
    ]
    };  

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
    }
    if( this.route.snapshot.paramMap.get('materia_id') != 'null'){
      this.materia_id = this.route.snapshot.paramMap.get('materia_id')
    }
    
        
  }


  ngOnInit(): void {
    if ( this.materia_id ){
      var unsubscribe = db.collection("materias").doc(this.materia_id).onSnapshot( 
        snapshot =>{
          this.materia = snapshot.data() as Materia
          this.update()
        },
        error=>{
          console.log("ERROR reading materia")
        })
    }
    else{
      this.update()
    }
    this.loadMastersList()
     
  }

  

  update(){
    if( this.materia_id ){
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
          exams:new FormArray([]),
          laboratories:new FormArray([])           
        })
        this.loadExams(this.materia_id, this.m.controls.exams as FormArray)
        this.loadLaboratories(this.materia_id, this.m.controls.laboratories as FormArray)  
    }
    else{
      this.m = this.fb.group({
        id: [null],
        isDeleted:[false],
        materia_name:[null, Validators.required],
        description:[null],
        pictureUrl:[null],
        videoUrl:[null],
        isEnrollmentActive:[false],
        label1:[""], 
        label2:[""], 
        label3:[""], 
        label4:[""], 
        color1:[""], 
        color2:[""], 
        exams:[]            
      })             

    }
  }

  loadMastersList(){
    this.certificateTypes = []
    db.collection("organizations/" + this.organization_id + "/certificateTypes").get().then( typeCertificatesSet =>{
      typeCertificatesSet.docs.map( typeCertificatesDoc =>{
        const typeCertificate:CertificateType = typeCertificatesDoc.data() as CertificateType
        this.certificateTypes.push( typeCertificate )
      })
    })
  }



        
  onPropertyChange(event){
    var id =this.m.controls.id.value

    var propertyName = event.srcElement.attributes.formControlname.value
    var value = event.target.value      
    this.m.controls[propertyName].setValue( value )
    if( id ){   
      var values = {}
      values[propertyName]=value                       
      db.collection('materias').doc(id).update(values).then( () =>{
        console.log("property has been update:" + propertyName + " " + value)
      },
      reason =>{
        alert("ERROR: writing property:" + reason)
      })
    }      
  }

  onCheckboxChange(event){
    var id =this.m.controls.id.value

    var propertyName = event.source.name
    var value = event.checked     
    this.m.controls[propertyName].setValue(value)
    if( id ){   
      var values = {}
      values[propertyName]=value                       
      db.collection('materias').doc(id).update(values).then( () =>{
        console.log("property has been update:" + propertyName + " " + value)
      },
      reason =>{
        alert("ERROR: writing property:" + reason)
      })
    }      
  }


  onSelectChange(event:MatSelectChange, fg:FormGroup){
    console.log("onSelectChange")

    var id =fg.controls.id.value

    var propertyName = event.source.ngControl.name
    var value = event.source.ngControl.value      
 
    if( id ){ 
      var values = {}
      values[propertyName]=value                                  
      db.collection('materias').doc(id).update(values).then( () =>{
        console.log("property has been update:" + propertyName + " " + value)
      },
      reason =>{
        alert("ERROR: writing property:" + reason)
      })   
    }
    
  }   
  
  getType( variable){
    console.log( typeof(variable) )
  }

  onCancel(){
    this.navigationService.back()
  }

  onClose(){
    const id = this.m.controls.id.value
    if( id == null){
      const materia_id = uuid.v4()
      const organization_id = this.userPreferencesService.getCurrentOrganizationId()
      
      if( this.m.valid ){ 
        const materia:Materia = {
          id:materia_id, 
          organization_id:organization_id,
          materia_name:this.m.controls.materia_name.value,
          isDeleted:this.m.controls.isDeleted.value,         
          description:this.m.controls.description.value,
          isEnrollmentActive:this.m.controls.isEnrollmentActive.value, 
        
          label1:this.m.controls.label1.value, 
          label2:this.m.controls.label2.value, 
          label3:this.m.controls.label3.value, 
          label4:this.m.controls.label4.value, 
          color1:this.m.controls.color1.value, 
          color2:this.m.controls.color2.value 
        }
        
        db.collection("materias").doc(materia_id).set(
          materia
        ).then( () =>{
          this.m.controls.id.setValue(materia_id)
          this.navigationService.back()
        },
        reason =>{
          alert("ERROR: creating materia:" + reason)
        })
        
      }
      else{
        alert("faltan algunos datos")
      }
    }
    else{
      this.navigationService.back()
    }
  }
  loadExams(materia_id:string, exams:FormArray):Promise<void>{
    return new Promise<void>((resolve, reject) =>{
      exams.controls.length = 0
      db.collection("materias/" + materia_id + "/exams")
      .where("isDeleted","==", false)
      .get().then( snapshot =>{
        snapshot.docs.map( doc =>{
          const exam = doc.data() as Exam
          var fc:FormGroup = this.fb.group({
            id:[exam.id],
            label:[exam.label]
          })
          exams.controls.push(fc)
        })
        
        exams.controls.sort( (a,b) => {
          const af = a as FormGroup
          const bf = b as FormGroup
          return af.controls.label.value > bf.controls.label.value ? 1:-1})
        resolve()
        
      },
      reason =>{
        console.log("ERROR reading exams:" + reason)
        reject()
      })
    })
  }
  onDeleteExam(materia_id:string, exam_id:string){
    db.collection("materias/" + materia_id + "/exams").doc(exam_id).update({"isDeleted":true}).then(
      result =>{
        console.log("exam delted")
        this.update()
      }
    )
  }
  onDuplicateExam(materia_id:string, exam_id:string, exam_label:string){
    this.submitting = true
    
    this.duplicateExam(materia_id, exam_id, exam_label).then( () =>{
      this.submitting = false
      this.update()
    },
    reason=>{
      alert("duplicate failed" + reason)
      this.submitting = false
    })
  }

  duplicateExam(materia_id, exam_id, exam_label:string):Promise<void>{
    
    var _resolve
    var _reject
    return new Promise<null>((resolve, reject)=>{
      _resolve = resolve
      _reject = reject
      var req = {
        materias:{
          id:materia_id,
          exams:
            {
              id:exam_id,
              label:exam_label + "_copy"
            }
          
        }
      }
      this.userLoginService.getUserIdToken().then( token => {
        this.examImprovisacionService.firestoreApiInterface("dupSubCollection", token, req).subscribe(
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

  onEditExam(materia_id, exam_id){
    this.router.navigate(['/ei-tipo-edit',{materia_id:materia_id, exam_id:exam_id}]);
  }

  createExam(materia_id:string, label:string){

    var id = uuid.v4()
    const exam:Exam = {
      id:id,
      label:label,
      
      isDeleted:false,
      isRequired:false
    }
    db.collection('materias/' + materia_id + '/exams').doc(id).set(exam).then( () =>{
      this.update()
    },
    reason =>{
      alert("ERROR creating exam:" + reason)
    })
  }

  onCreateExam(){

    const dialogRef = this.dialog.open(DialogMateriaExamDialog, {
      height: '400px',
      width: '250px',
      data: { id:"", label:"" }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if( result != undefined ){
        console.debug( result )
        this.createExam(this.materia_id, result.label)
      }
      else{
        console.debug("none")
      }
    });
  }


  removePropertyValue(property){
    const json = {}
    json[property + "Url"] = null
    json[property + "Path"] = null

    
    db.collection("materias").doc(this.materia_id).update( json ).then( () =>{
      console.log("property was removed")
      this.m.controls[property].setValue(null)
    })
  }
  onEnroll(){
    if( this.userLoginService.getUserUid() ){

      this.router.navigate(['/payment',{"productId":"prod_MNGiZUsnJ1PA2t", "materiaId":this.materia_id}]);

    }      
  }

  selectFile(event) {


    var selectedFiles = event.target.files;
    const property = event.srcElement.name

    const bucketName = "organizations/" + this.organization_id + "/materias/" + this.materia_id + "/" + property + ".jpg"

    var file:File = selectedFiles[0]
    var storageRef = storage.ref( bucketName )

    var uploadTask = storageRef.put(file)
    var element = document.getElementById(property + "Status")
    var fileLoadObserver = new FileLoadObserver(storageRef, "materias", this.m.controls.id.value, property, element );
    uploadTask.on("state_change", fileLoadObserver)
  } 

  selectMasterIconFile(event) {
    var selectedFiles = event.target.files;
    const property = event.srcElement.name
    const path = "organizations/" + this.organization_id + "/masterIcons"
    var file:File = selectedFiles[0]

    const id = file.name.split(".")[0].replace(" ","_")

    const bucketName = path + "/" + id + "/" + id + ".jpg"

    var storageRef = storage.ref( bucketName )

    var uploadTask = storageRef.put(file)
    var element = document.getElementById(property + "Status")
    db.collection(path).doc(id).set( { id:id }).then( () =>{
      var fileLoadObserver = new FileLoadObserver(storageRef, path, id, property, element );
      uploadTask.on("state_change", fileLoadObserver)
    })
  } 
  onCertificateTypes( ){
    this.router.navigate(['certificate-type-list',{}])
  }
  

  onSelectionChanged = (event) => {
    console.log("selection has change")
  }
  onEditorContentChanged = (propertyName, event) => {
    
    console.log( "onEditorContentChanged" + this.materia_id)
    /*
 
    */
  }
  editorCreated(quill: any) {
    console.log("editor created")
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

  hasMateriaEnrollment(){
    this.examImprovisacionService.hasMateriaEnrollment(
      this.userPreferencesService.getCurrentOrganizationId(),
      this.materia_id,
      this.userLoginService.getUserUid()
    ).then( hasEnrollment =>{
      this.hasEnrollment = hasEnrollment
      console.log("hasEnrollment:" + hasEnrollment)
    })
  }
  loadLaboratories(materia_id:string, laboratories:FormArray):Promise<void>{
    return new Promise<void>((resolve, reject) =>{
      laboratories.controls.length = 0
      db.collection("materias/" + materia_id + "/laboratory")
      .where("isDeleted","==", false)
      .get().then( snapshot =>{
        snapshot.docs.map( doc =>{
          const laboratory = doc.data() as Laboratory
          var fc:FormGroup = this.fb.group({
            id:[laboratory.id],
            label:[laboratory.label]
          })
          laboratories.controls.push(fc)
        })
        
        laboratories.controls.sort( (a,b) => {
          const af = a as FormGroup
          const bf = b as FormGroup
          return af.controls.label.value > bf.controls.label.value ? 1:-1})
        resolve()
        
      },
      reason =>{
        console.log("ERROR reading Laboratory:" + reason)
        reject()
      })
    })
  }

  onCreateLaboratory(){

    const dialogRef = this.dialog.open(DialogNameDialog, {
      height: '400px',
      width: '250px',
      data: { label:"Leccion interactiva", name:"" }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if( result != undefined ){
        console.debug( result )
        this.createLaboratory(this.materia_id, result.name)
      }
      else{
        console.debug("none")
      }
    });
  }

  createLaboratory(materia_id, label:string){

    var id = uuid.v4()
    const laboratory:Laboratory = {
      id:id,
      label:label,
      
      isDeleted:false,
      isRequired:false
    }
    db.collection('materias/' + materia_id + '/laboratory').doc(id).set(laboratory).then( () =>{
      this.update()
    },
    reason =>{
      alert("ERROR creating exam:" + reason)
    })
  }
  onDeleteLaboratory(materia_id, laboratory_id:string){
    db.collection("materias/" + materia_id + "/laboratory").doc(laboratory_id).update({"isDeleted":true}).then(
      result =>{
        console.log("exam delted")
        this.update()
      }
    )
  }  
  onEditLaboratory(materia_id, laboratory_id){
    this.router.navigate(['/laboratory-edit',{materia_id:materia_id, laboratory_id:laboratory_id}]);
  }

  
}
  
  /* do not forget to add the dialog to the app.module.ts*/
@Component({
  selector: 'exam-dlg',
  templateUrl: 'exam-dlg.html'  
  })
  export class DialogMateriaExamDialog { 
  
  constructor(  
    public dialogRef: MatDialogRef<DialogMateriaExamDialog>,
    @Inject(MAT_DIALOG_DATA) public data) 
    {

    }
    
    show( obj ){
      return JSON.stringify(obj, null, 2)
    }
  
  }



  