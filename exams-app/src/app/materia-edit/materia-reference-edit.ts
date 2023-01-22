import { Component, EventEmitter, OnDestroy, OnInit, Inject } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { db , storage  } from 'src/environments/environment';
import { MateriaReference } from "../exams/exams.module";
import { UserLoginService } from "../user-login.service";
import { UserPreferencesService } from "../user-preferences.service";
import * as uuid from 'uuid';


/* do not forget to add the dialog to the app.module.ts*/
@Component({
    selector: 'materia-reference-edit',
    templateUrl: 'materia-reference-edit.html' ,
    styleUrls: ['materia-reference-edit.css']
    })
    export class MateriaReferenceDialog{ 
    mr
    isAdmin = false
    organization_id = null

    id = null
    
    constructor(  
      public dialogRef: MatDialogRef<MateriaReferenceDialog>,
      @Inject(MAT_DIALOG_DATA) public data,
      private fb: FormBuilder,
      private userLoginService: UserLoginService,
      private userPreferencesService: UserPreferencesService
    ) 
    {
        this.organization_id = this.userPreferencesService.getCurrentOrganizationId()
        if( this.userLoginService.hasRole("role-admin-" + this.organization_id) ){
          this.isAdmin = true
        }   


        this.mr = this.fb.group({
          id:[this.data.id],
          label: [this.data.label, Validators.required],
          desc: [this.data.desc],
          filePath: [this.data.filePath],
          fileUrl:[this.data.fileUrl]
        })

        if( data.id ){
            this.id = data.id
        }
        else{
            this.id = uuid.v4()
        }
    }
    getBasePath(){
        return "organizations/" + this.organization_id + "/materias/" + this.data.materia_id + "/materiaReference/" + this.id 
    }
    fileLoaded(path){
        this.mr.controls.filePath.setValue(path)
        let storageRef = storage.ref( path )
        storageRef.getDownloadURL().then( url =>{
            this.mr.controls.fileUrl.setValue( url )
        })        
    }  
    fileDeleted(path){
        console.log("file deleted:" + path)
        this.mr.controls.filePath.setValue( null )
        this.mr.controls.fileUrl.setValue( null )
    }
    onUrlChange(){
        console.log("url changed")
        this.mr.controls.filePath.setValue( null )        
    }
    onSubmit(){
        var materiaReference:MateriaReference = {
            id:this.mr.controls.id.value,
            label: this.mr.controls.label.value,
            desc:this.mr.controls.desc.value,
            filePath: this.mr.controls.filePath.value,
            fileUrl:this.mr.controls.fileUrl.value

        }
        
        if( materiaReference.id == null){
            this.materiaReferenceCreate(materiaReference).then( () =>{
                this.dialogRef.close()
            })
        }
        else{
            this.materiaReferenceUpdate(materiaReference).then( () =>{
                this.dialogRef.close()
            })
        }

        
    }


    materiaReferenceCreate( materiaReference:MateriaReference ):Promise<void>{
        return new Promise<void>( ( resolve, reject) => {
            materiaReference.id = this.id
            db.collection("materias/" + this.data.materia_id + "/materiaReference").doc(materiaReference.id).set(materiaReference).then( () =>{
                console.log("materiaReference added")
                resolve()
            },
            reason=>{
                alert("ERROR update to collection:" + reason)
                reject(reason)
            }) 
        })
    }
    materiaReferenceUpdate( materiaReference ):Promise<void>{
        return new Promise<void>( ( resolve, reject) => {
            var transactions = []
            //first erase the old file if it exists and is different from the old one
            if( this.data.filePath && materiaReference.filePath != this.data.filePath){
                let storageRef = storage.ref( this.data.filePath )
                var trans_del = storageRef.delete().then( () =>{
                    console.log("old file removed")
                })
                .catch( reason =>{
                    console.log("old file can not be erased")
                })
                transactions.push(trans_del)        
            }   
            //now that the new file is there we can update the materiaReference
            Promise.all( transactions ).then( () =>{
                db.collection("materias/" + this.data.materia_id + "/materiaReference").doc(materiaReference.id).update(materiaReference).then( () =>{
                    console.log("materiaReference updated")
                    resolve()
                },
                reason=>{
                    alert("ERROR update to collection:" + reason)
                    reject(reason)
                }) 
            })
        })   
    }  

    
}
  