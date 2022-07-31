import { Component, Inject, OnInit } from "@angular/core"
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms"
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog"
import { MatSelectChange } from "@angular/material/select"
import { ExamenesImprovisacionService } from "../examenes-improvisacion.service"
import { Materia } from "../exams/exams.module"
import { UserLoginService } from "../user-login.service"
import { db } from 'src/environments/environment';

/* do not forget to add the dialog to the app.module.ts*/
@Component({
    selector: 'materia-dlg',
    templateUrl: 'materia-dlg.html',
  })

export class DialogMateriaDialog implements OnInit{ 
   
    m = this.fb.group({
      id: [this.materia.id],
      isDeleted:[this.materia.isDeleted],
      materia_name:[this.materia.materia_name, Validators.required],
      typeCertificate:[this.materia.typeCertificate, Validators.required],
      iconCertificate:[this.materia.iconCertificate, Validators.required],
      description:[this.materia.description],
      videoUrl:[this.materia.videoUrl],
      isEnrollmentActive:[this.materia.isEnrollmentActive]
    })        

    typeCertificates = []
    iconCertificates = []
  
    constructor(
        private fb: FormBuilder,
        private examImprovisacionService: ExamenesImprovisacionService,
        private userLoginService: UserLoginService,
        public dialogRef: MatDialogRef<DialogMateriaDialog>,
        @Inject(MAT_DIALOG_DATA) public materia: Materia) {}
  
  
    ngOnInit(): void {
        
      this.loadMastersList()
      this.loadIconList()
      
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
  
          
    async onPropertyChange(event){
      var id =this.m.controls.id.value
 
      var propertyName = event.srcElement.attributes.formControlname.value
      var value = event.target.value      
      this.materia[propertyName] = value
      if( id ){   
        var values = {}
        values[propertyName]=value                       
        await db.collection('materias').doc(id).update(values)
      }      
    }

    async onCheckboxChange(event){
      var id =this.m.controls.id.value
 
      var propertyName = event.source.name
      var value = event.checked     
      this.materia[propertyName] = value
      if( id ){   
        var values = {}
        values[propertyName]=value                       
        await db.collection('materias').doc(id).update(values)
      }      
    }


    async onSelectChange(event:MatSelectChange, fg:FormGroup){
      console.log("onSelectChange")

      var id =fg.controls.id.value
 
      var propertyName = event.source.ngControl.name
      var value = event.source.ngControl.value      
      this.materia[propertyName] = value

      
      var values = {}

      if( propertyName == "typeCertificate"){
        switch(value){
          case "Experta.jpeg": 
            this.materia["label1"] = "RAKS SHARKI"
            this.materia["label2"] = ""
            this.materia["label3"] = ""
            this.materia["label4"] = "Danza Oriental y Fusiones"
            this.materia["color1"] = "#d9ad43"
            this.materia["color2"] = "black"
            break
          case "Especialista.jpeg": 
            this.materia["label1"] = "RAKS SHARKI"
            this.materia["label2"] = ""
            this.materia["label3"] = ""
            this.materia["label4"] = "Danza Oriental y Fusiones"
            this.materia["color1"] = "#5b2383"
            this.materia["color2"] = "black"
            break            

          case "habilidades_tecnicas.jpeg": 
            this.materia["label1"] = ""
            this.materia["label2"] = this.materia.materia_name
            this.materia["label3"] = ""
            this.materia["label4"] = "WWW.RAXACADEMY.COM"
            this.materia["color1"] = "#5b2383"
            this.materia["color2"] = "black"     
            break;    
          case "habilidades_tematicas.jpeg": 
            this.materia["label1"] = ""
            this.materia["label2"] = this.materia.materia_name
            this.materia["label3"] = ""
            this.materia["label4"] = "WWW.RAXACADEMY.COM"
            this.materia["color1"] = "#5b2383"
            this.materia["color2"] = "red"
            break;                      
        }
        if( id ){
          values = {
            typeCertificate:this.materia.typeCertificate,
            label1:this.materia.label1,
            label2:this.materia.label2,
            label3:this.materia.label3,
            label4:this.materia.label4,
            color1:this.materia.color1,
            color2:this.materia.color2
          }
          await db.collection('materias').doc(id).update(values)
        }
      }
      else{
        if( id )                      
          await db.collection('materias').doc(id).update(values)   
      }
    }   
    
    getType( variable){
      console.log( typeof(variable) )
    }
  }
  