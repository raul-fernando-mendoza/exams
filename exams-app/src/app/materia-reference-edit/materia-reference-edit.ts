import { Component, EventEmitter, OnDestroy, OnInit, Inject } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { db , storage  } from 'src/environments/environment';
import { MateriaReference } from "../exams/exams.module";
import { UserLoginService } from "../user-login.service";
import { UserPreferencesService } from "../user-preferences.service";
import * as uuid from 'uuid';
import { ExamenesImprovisacionService } from "../examenes-improvisacion.service";
import { FileLoadedEvent } from "../file-loader/file-loader.component";


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

    collection = null

    
    
    constructor(  
      public dialogRef: MatDialogRef<MateriaReferenceDialog>,
      @Inject(MAT_DIALOG_DATA) public data,
      private fb: FormBuilder,
      private userLoginService: UserLoginService,
      private userPreferencesService: UserPreferencesService,
      private examenesImprovisacionService:ExamenesImprovisacionService
    ) 
    {
        this.organization_id = this.userPreferencesService.getCurrentOrganizationId()
        if( this.userLoginService.hasRole("role-admin-" + this.organization_id) ){
          this.isAdmin = true
        }   
        this.collection = "materias/" + this.data.materia_id + "/materiaReference"


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
    fileLoaded( e:FileLoadedEvent){
        if( this.data.id ){
            db.collection(this.collection).doc(this.data.id).get().then( doc =>{
                var materiaRefence:MateriaReference = doc.data() as MateriaReference 
                //first erase the old value if existed
                var promises = []
                var oldFilePath:string =materiaRefence[e.property + "Path"]
                if( oldFilePath && oldFilePath != e.fileFullPath){
                    var storageOldRef = storage.ref( oldFilePath )
                    
                    var promiseDelete = storageOldRef.delete().then( () =>{
                    console.log("old file was deleted:" + oldFilePath )
                    })
                    .catch( reason => {
                    console.log("old file could not be deleted")      
                    })
                    promises.push(promiseDelete)
                }  
                //now update the values of properties to kick a reload of the data page
                var values = {}
                values[e.property + "Path"]=null                       
                values[e.property + "Url"]=null
                var remove = db.collection(this.collection).doc(this.id).update(values).then( () =>{
                    console.log("property has been update:" + e.property + " " + e.fileFullPath)
                },
                reason =>{
                    alert("ERROR: writing property:" + reason)
                }) 
                promises.push( remove )

                Promise.all( promises ).then( () =>{
                    //now update the values in materia
                    let storageRef = storage.ref( e.fileFullPath )
                    storageRef.getDownloadURL().then( url =>{
                        var values = {}
                        values[e.property + "Path"]=e.fileFullPath                       
                        values[e.property + "Url"]=url        
                        db.collection(this.collection).doc(this.id).update(values).then( () =>{
                        console.log("property has been update:" + e.property + " " + e.fileFullPath)
                        },
                        reason =>{
                        alert("ERROR: writing property:" + reason)
                        })        
                    })  
                })     
            })
        }
        else{ // there is not an existing reference yet only load the file values in the form
            let storageRef = storage.ref( e.fileFullPath )
            storageRef.getDownloadURL().then( url =>{
                this.mr.controls[e.property + "Path"].setValue(e.fileFullPath)
                this.mr.controls[e.property + "Url"].setValue(url)        
            })
        }  
    }
    fileDeleted( e:FileLoadedEvent){
        if( this.data.id ){
          console.log("file deleted:" + e.fileFullPath)
          var values = {}
          values[e.property + "Path"]=null                       
          values[e.property + "Url"]=null
          db.collection(this.collection).doc(this.data.id).update(values).then( () =>{
            console.log("property has been update:" + e.property + " " + e.fileFullPath)
          },
          reason =>{
            alert("ERROR: writing property:" + reason)
          })      
        }
        else{
            this.mr.controls[e.property + "Path"].setValue(null)
            this.mr.controls[e.property + "Url"].setValue(null)              
        }
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

    getLabel(){
        if( this.data.filePath ){
            var path = this.data.filePath.split("/").reverse()
            return path[0]
        }
        else{
            return "Archivo"
        }
    }
    getFileName(){
        if( this.data.filePath ){
            var path = this.data.filePath.split("/").reverse()
            return path[0]
        }
        else{
            return null
        }
    }    
    
}
  