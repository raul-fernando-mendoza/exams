import {  Component,  Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { UserPreferencesService } from '../user-preferences.service';
import * as uuid from 'uuid';
import { FormBuilder } from '@angular/forms';
import { UserLoginService } from '../user-login.service';
import { db , storage} from 'src/environments/environment';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { Revision, RevisionStatus, VideoMarker } from '../exams/exams.module';
import { DateFormatService } from '../date-format.service';



@Component({
    selector: 'revision-create-dlg',
    templateUrl: 'revision-create-dlg.html',
  })
export class RevisionCreateDialog { 

  organizationId=null
  collection = "revision"
  id=uuid.v4()
  isAdmin=false
  userUid=null  

  revisionFG = this.fb.group({
    label:[null],
    videoPath:[null],
    userUid:[null]
  })  

  constructor(
    public dialogRef: MatDialogRef<RevisionCreateDialog>
    ,private userPreferencesService: UserPreferencesService
    ,private userLoginService: UserLoginService
    ,private fb:FormBuilder
    ,private examImprovisacionService: ExamenesImprovisacionService
    ,private df:DateFormatService
    ,@Inject(MAT_DIALOG_DATA) public data:string) 
  {
    this.organizationId = this.userPreferencesService.getCurrentOrganizationId()
    if( this.userLoginService.hasRole("role-admin-" + this.organizationId) ){
      this.isAdmin = true
    }   
    if( this.userLoginService.getUserUid() ){
      this.userUid = this.userLoginService.getUserUid()
    }
    if( !this.isAdmin ){
      this.revisionFG.controls.userUid.setValue(this.userUid)
    }  
    this.collection = data  

  }
  getBasePath(){
    let path = ""
    if( this.collection.length == 0){
      path = "organizations/" + this.organizationId + "/revision/" + this.id 
    }
    else{
      path = "organizations/" + this.organizationId + "/" + this.collection.toLowerCase() + "/revision/" + this.id 
    }
    return path
  }    
  fileLoaded(path){
    console.log( path )
  }  
  onUserSelected(value){
    console.log( value )
  } 
  onSubmit(){
    console.log("form submit")

   

    var videoPath = this.revisionFG.controls.videoPath.value
    let storageRef = storage.ref( videoPath )
    storageRef.getDownloadURL().then( url =>{

      var revision:Revision ={
        id:this.id,
        organization_id:this.organizationId,
        label:this.revisionFG.controls.label.value,
        student_uid:this.revisionFG.controls.userUid.value,
        date:new Date(),
        dateId:this.df.getDayId(new Date()),
        status:RevisionStatus.requested,
     
      }
      this.examImprovisacionService.saveObject( this.collection + "/Revision", revision ).then(()=>{
        var videoMarker:VideoMarker= {
          id:uuid.v4(),
          videoUrl:url,
          videoPath:videoPath             
        }
        this.examImprovisacionService.saveObject( this.collection + "/Revision/" + revision.id + "/VideoMarker", videoMarker ).then( ()=>{
          this.dialogRef.close(this.id)
        })
      })
    },
    reason => alert("ERROR: the url is not available:" +  reason))
  }      

}
  