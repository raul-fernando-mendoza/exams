import { Component, EventEmitter, OnDestroy, OnInit, Inject } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { db , storage  } from 'src/environments/environment';
import { Reference } from "../exams/exams.module";
import { UserLoginService } from "../user-login.service";
import { UserPreferencesService } from "../user-preferences.service";
import * as uuid from 'uuid';
import { BusinessService } from "../business.service";
import { FileLoadedEvent, FileLoaderComponent } from "../file-loader/file-loader.component";

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MatInputModule } from '@angular/material/input';

import { MatDialogModule } from '@angular/material/dialog'

/* do not forget to add the dialog to the app.module.ts*/
@Component({
    selector: 'reference-edit',
    standalone: true,
    imports: [
      CommonModule
      ,MatIconModule
      ,MatButtonModule   
     
      ,FormsModule
      ,ReactiveFormsModule
      ,MatFormFieldModule
      ,MatInputModule 
  
      ,MatDialogModule 
      ,FileLoaderComponent
   
    ],    
    templateUrl: 'reference-edit.html' ,
    styleUrls: ['reference-edit.css']
    })
    export class ReferenceDialog{ 
    mr
    isAdmin = false
    organization_id = null

    id = null

    collection = null

    
    
    constructor(  
      public dialogRef: MatDialogRef<ReferenceDialog>,
      @Inject(MAT_DIALOG_DATA) public data,
      private fb: FormBuilder,
      private userLoginService: UserLoginService,
      private userPreferencesService: UserPreferencesService,
      private businessService:BusinessService
    ) 
    {
        this.organization_id = this.userPreferencesService.getCurrentOrganizationId()
        if( this.userLoginService.hasRole("role-admin-" + this.organization_id) ){
          this.isAdmin = true
        }   
        this.collection = data.collection


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
    //"/materias/" + this.data.materia_id + "/materiaReference/"
    getBasePath(){
        return "organizations/" + this.organization_id + "/" + this.collection + "/" + this.id 
    }
    onUrlChange(){
        console.log("url changed")
        this.mr.controls.filePath.setValue( null )        
    }
    fileLoaded(e){
        this.businessService.fileLoaded(this.collection, this.id, e).then( fileLoaded =>{
            this.mr.controls.filePath.setValue( fileLoaded.path )
            this.mr.controls.fileUrl.setValue( fileLoaded.url )
        })
    }  
    fileDeleted(e){
        this.businessService.fileDeleted(this.collection, this.id, e)
    }    
    onSubmit(){
        var materiaReference:Reference = {
            id:this.mr.controls.id.value,
            label: this.mr.controls.label.value,
            desc:this.mr.controls.desc.value,
            filePath: this.mr.controls.filePath.value,
            fileUrl:this.mr.controls.fileUrl.value

        }
        
        if( materiaReference.id == null){
            this.referenceCreate(materiaReference).then( () =>{
                this.dialogRef.close()
            })
        }
        else{
            this.referenceUpdate(materiaReference).then( () =>{
                this.dialogRef.close()
            })
        }

        
    }


    referenceCreate( reference:Reference ):Promise<void>{
        return new Promise<void>( ( resolve, reject) => {
            reference.id = this.id
            db.collection(this.collection).doc(reference.id).set(reference).then( () =>{
                console.log("materiaReference added")
                resolve()
            },
            reason=>{
                alert("ERROR update to collection:" + reason)
                reject(reason)
            }) 
        })
    }
    referenceUpdate( reference ):Promise<void>{
        return new Promise<void>( ( resolve, reject) => {
            var transactions = []
            //first erase the old file if it exists and is different from the old one
            if( this.data.filePath && reference.filePath != this.data.filePath){
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
                db.collection(this.collection).doc(reference.id).update(reference).then( () =>{
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

    getLabel(){
        this.data.label
    }
    getFileName(){
        return  this.data.filePath 
    }    
    
}
  