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
      id: [this.data.id],
      isDeleted:[this.data.isDeleted],
      materia_name:[this.data.materia_name, Validators.required],
      typeCertificate:[this.data.typeCertificate, Validators.required],
      iconCertificate:[this.data.iconCertificate, Validators.required]
    })        

    typeCertificates = []
    iconCertificates = []
  
    constructor(
        private fb: FormBuilder,
        private examImprovisacionService: ExamenesImprovisacionService,
        private userLoginService: UserLoginService,
        public dialogRef: MatDialogRef<DialogMateriaDialog>,
        @Inject(MAT_DIALOG_DATA) public data: Materia) {}
  
  
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
      this.data[propertyName] = value
      if( id ){   
        var values = {}
        values[propertyName]=value                       
        await db.collection('materias').doc(id).update(values)
      }      
    }

    async onChangeExamProperty(event:MatSelectChange, fg:FormGroup){
      console.log("onChangeExamProperty")

      var id =fg.controls.id.value
 
      var propertyName = event.source.ngControl.name
      var value = event.source.ngControl.value      
      this.data[propertyName] = value
      if( id ){   
        var values = {}
        values[propertyName]=value                       
        await db.collection('materias').doc(id).update(values)
      }

    }    
  }
  