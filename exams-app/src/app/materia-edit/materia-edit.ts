import { Component, Inject, OnInit } from "@angular/core"
import { UntypedFormArray, UntypedFormBuilder, FormControl, UntypedFormGroup, Validators } from "@angular/forms"
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog"
import { MatSelectChange } from "@angular/material/select"
import { ExamenesImprovisacionService } from "../examenes-improvisacion.service"
import { CertificateIcon, CertificateType, Exam, Materia } from "../exams/exams.module"
import { UserLoginService } from "../user-login.service"
import { db , storage  } from 'src/environments/environment';



import { ActivatedRoute, Router } from "@angular/router"
import * as uuid from 'uuid';
import { NavigationService } from "../navigation.service"
import { UserPreferencesService } from "../user-preferences.service"
import { Observable, Observer } from "rxjs"
import { FileLoadObserver } from "../load-observers/load-observers.module"

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
  m:UntypedFormGroup = null
  submitting:boolean = false

  certificateTypes:Array<CertificateType> = []
  certificateIcons = []

  organization_id:string = null

  selectedFiles

  isAdmin:boolean = false

  isLoggedIn =false

  snapshots=Array<any>()

  constructor(
      private fb: UntypedFormBuilder
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
    this.loadIconList()      
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
          exams:new UntypedFormArray([])            
        })
        this.loadExams(this.materia_id, this.m.controls.exams as UntypedFormArray)  
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



  loadIconList(){
    this.certificateIcons = []

    var req = {
      "path":"certificates_logos/" + this.userPreferencesService.getCurrentOrganizationId() + "/"
    }

    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.gsApiInterface("list", token, req).subscribe(
        data => { 
          if( data["result"]){
            var listIcons = data["result"];
            listIcons.forEach(icon => {
              this.certificateIcons.push(
                {
                  id:icon["name"].split("/").pop(),
                  label:icon["name"].split("/").pop()  
                }  
              )          
            });
          }
          else{
            console.log("error reading certificates logos:" + data["error"])
          }
        },     
        error => {
          alert("error loading impro type")
          console.log("Error loading ExamType:" + error.error)
        }
      )
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
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


  onSelectChange(event:MatSelectChange, fg:UntypedFormGroup){
    console.log("onSelectChange")

    var id =fg.controls.id.value

    var propertyName = event.source.ngControl.name
    var value = event.source.ngControl.value      
/*
    
    var values = {}

    if( propertyName == "typeCertificate"){
      switch(value){
        case "Experta.jpeg": 
          this.m.controls.label1.setValue("RAKS SHARKI")
          this.m.controls.label2.setValue("")
          this.m.controls.label3.setValue("")
          this.m.controls.label4.setValue("Danza Oriental y Fusiones")
          this.m.controls.color1.setValue("#d9ad43")
          this.m.controls.color2.setValue("black")
          break
        case "Especialista.jpeg": 
          this.m.controls.label1.setValue("RAKS SHARKI")
          this.m.controls.label2.setValue("")
          this.m.controls.label3.setValue("")
          this.m.controls.label4.setValue("Danza Oriental y Fusiones")
          this.m.controls.color1.setValue("#5b2383")
          this.m.controls.color2.setValue("black")
          break            

        case "habilidades_tecnicas.jpeg": 
          this.m.controls.label1.setValue("")
          this.m.controls.label2.setValue(this.m.controls.materia_name.value)
          this.m.controls.label3.setValue("")
          this.m.controls.label4.setValue("WWW.RAXACADEMY.COM")
          this.m.controls.color1.setValue("#5b2383")
          this.m.controls.color2.setValue("black")     
          break;    
        case "habilidades_tematicas.jpeg": 
          this.m.controls.label1.setValue("")
          this.m.controls.label2.setValue(this.m.controls.materia_name.value)
          this.m.controls.label3.setValue("")
          this.m.controls.label4.setValue("WWW.RAXACADEMY.COM")
          this.m.controls.color1.setValue("#5b2383")
          this.m.controls.color2.setValue( "red")
          break;                      
      }
      if( id ){
        values = {
          typeCertificate:this.m.controls.typeCertificate.value,
          label1:this.m.controls.label1.value,
          label2:this.m.controls.label2.value,
          label3:this.m.controls.label3.value,
          label4:this.m.controls.label4.value,
          color1:this.m.controls.color1.value,
          color2:this.m.controls.color2.value
        }
        db.collection('materias').doc(id).update(values).then( () =>{
          console.log("property has been update:" + propertyName + " " + value)
        },
        reason =>{
          alert("ERROR: writing property:" + reason)
        })
      }
    }
    else{
*/      
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
  loadExams(materia_id:string, exams:UntypedFormArray):Promise<void>{
    return new Promise<void>((resolve, reject) =>{
      exams.controls.length = 0
      db.collection("materias/" + materia_id + "/exams")
      .where("isDeleted","==", false)
      .get().then( snapshot =>{
        snapshot.docs.map( doc =>{
          const exam = doc.data() as Exam
          var fc:UntypedFormGroup = this.fb.group({
            id:[exam.id],
            label:[exam.label]
          })
          exams.controls.push(fc)
        })
        
        exams.controls.sort( (a,b) => {
          const af = a as UntypedFormGroup
          const bf = b as UntypedFormGroup
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
  onEnroll(materiaId){
    if( this.userLoginService.getUserUid() ){
      this.examImprovisacionService.createMateriaEnrollment(this.userPreferencesService.getCurrentOrganizationId(), materia_id,this.userLoginService.getUserUid()).then( () =>{
        
        alert("Usted ha sido enrollado en esta materia.")
        this.update()
      },
      reason => {
        alert("usted ya esta enrollado en esta materia")
      })
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

  