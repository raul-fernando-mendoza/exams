import { Component, Inject, OnInit } from "@angular/core"
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms"
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog"
import { MatSelectChange } from "@angular/material/select"
import { ExamenesImprovisacionService } from "../examenes-improvisacion.service"
import { Exam, Materia } from "../exams/exams.module"
import { UserLoginService } from "../user-login.service"
import { db } from 'src/environments/environment';
import { ActivatedRoute, Router } from "@angular/router"
import * as uuid from 'uuid';
import { NavigationService } from "../navigation.service"

/* do not forget to add the dialog to the app.module.ts*/
@Component({
    selector: 'materia-edit',
    templateUrl: 'materia-edit.html',
    styleUrls: ['materia-edit.css']
  })

export class DialogMateriaDialog implements OnInit{ 
   
   

    materia_id = null
    m:FormGroup = null
    submitting:boolean = false

    typeCertificates = []
    iconCertificates = []
  
    constructor(
        private fb: FormBuilder
        ,private route: ActivatedRoute
        ,private router: Router
        ,private examImprovisacionService: ExamenesImprovisacionService
        ,private userLoginService: UserLoginService
        ,private navigationService: NavigationService
        ,public dialog: MatDialog
        ) {
          if( this.route.snapshot.paramMap.get('materia_id') != 'null')
            this.materia_id = this.route.snapshot.paramMap.get('materia_id')

        }
  
  
    ngOnInit(): void {
      if ( this.materia_id ){
        db.collection("materias").doc(this.materia_id).get().then( doc =>{
          const materia = doc.data() as Materia
          this.m = this.fb.group({
            id: [materia.id],
            isDeleted:[materia.isDeleted],
            materia_name:[materia.materia_name, Validators.required],
            typeCertificate:[materia.typeCertificate, Validators.required],
            iconCertificate:[materia.iconCertificate, Validators.required],
            description:[materia.description],
            videoUrl:[materia.videoUrl],
            isEnrollmentActive:[materia.isEnrollmentActive],
            label1:[""], 
            label2:[""], 
            label3:[""], 
            label4:[""], 
            color1:[""], 
            color2:[""], 
            exams:new FormArray([])            
          })
          return this.loadExams(this.materia_id, this.m.controls.exams as FormArray)           
        })  

      }
      else{
        this.m = this.fb.group({
          id: [null],
          isDeleted:[false],
          materia_name:[null, Validators.required],
          typeCertificate:[null, Validators.required],
          iconCertificate:[null, Validators.required],
          description:[null],
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
  

      this.loadMastersList()
      this.loadIconList()
      
    }

    update(){
      if( this.m.controls.id.value ){
        this.loadExams(this.materia_id, this.m.controls.exams as FormArray) 
      }
    }

    loadMastersList(){
      this.typeCertificates = []
  
      var req = {
        "path":"certificates_master"
      }
      this.userLoginService.getUserIdToken().then( token => {
        this.examImprovisacionService.gsApiInterface("list", token, req).subscribe(
          data => { 
            var listIcons = data["result"];
            listIcons.forEach(m => {
              this.typeCertificates.push(
                {
                  label:m["name"].split("/")[1],
                  value:m["name"].split("/")[1]  
                }  
              )          
            });
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
  
  
  
    loadIconList(){
      this.iconCertificates = []
  
      var req = {
        "path":"certificates_logos"
      }
  
      this.userLoginService.getUserIdToken().then( token => {
        this.examImprovisacionService.gsApiInterface("list", token, req).subscribe(
          data => { 
            var listIcons = data["result"];
            listIcons.forEach(icon => {
              this.iconCertificates.push(
                {
                  label:icon["name"].split("/")[1],
                  value:icon["name"].split("/")[1]  
                }  
              )          
            });
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
        db.collection('materias').doc(id).update(values)
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
        db.collection('materias').doc(id).update(values)
      }      
    }


    onSelectChange(event:MatSelectChange, fg:FormGroup){
      console.log("onSelectChange")

      var id =fg.controls.id.value
 
      var propertyName = event.source.ngControl.name
      var value = event.source.ngControl.value      
      this.m.controls[propertyName].setValue(value)

      
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
          db.collection('materias').doc(id).update(values)
        }
      }
      else{
        if( id ){ 
          var values = {}
          values[propertyName]=value                                  
          db.collection('materias').doc(id).update(values)   
        }
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
       
        if( this.m.valid ){ 
          const materia:Materia = {
            id:materia_id, 
            materia_name:this.m.controls.materia_name.value,
            isDeleted:this.m.controls.isDeleted.value, 
          
            typeCertificate:this.m.controls.typeCertificate.value, 
            iconCertificate:this.m.controls.iconCertificate.value, 
          
            description:this.m.controls.description.value, 
            videoUrl:this.m.controls.videoUrl.value, 
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
  
  
  }
  
  /* do not forget to add the dialog to the app.module.ts*/
@Component({
  selector: 'exam-dlg',
  templateUrl: 'exam-dlg.html'  
  })
  export class DialogMateriaExamDialog { 
  
  constructor(
  
    public dialogRef: MatDialogRef<DialogMateriaExamDialog>,
    @Inject(MAT_DIALOG_DATA) public data) {

    }
    show( obj ){
      return JSON.stringify(obj, null, 2)
    }
  
  }