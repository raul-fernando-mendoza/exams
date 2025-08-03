import {  Component,  Inject } from '@angular/core';
import { MatDialog , MatDialogRef as MatDialogRef,  MAT_DIALOG_DATA} from '@angular/material/dialog';
import { UserPreferencesService } from '../user-preferences.service';
import * as uuid from 'uuid';
import { FormBuilder } from '@angular/forms';
import { UserLoginService } from '../user-login.service';
import { db , storage} from 'src/environments/environment';
import { BusinessService } from '../business.service';
import { Revision, RevisionStatus, VideoMarker } from '../exams/exams.module';
import { DateFormatService } from '../date-format.service';



@Component({
    selector: 'revision-create-dlg',
    templateUrl: 'revision-create-dlg.html',
  })
export class RevisionCreateDialog { 

  organizationId=null
  collection = ""
  id=uuid.v4()
  markerId=uuid.v4()
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
    ,private businessService: BusinessService
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
    path = "organizations/" + this.organizationId + "/Revision/" + this.id + "/VideoMarker/" + this.markerId

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
        isDeleted:false     
      }
      this.businessService.saveObject( "Revision", revision ).then(()=>{
        var videoMarker:VideoMarker= {
          id:this.markerId,
          videoUrl:url,
          videoPath:videoPath,
          isDeleted:false           
        }
        this.businessService.saveObject( "Revision/" + revision.id + "/VideoMarker", videoMarker ).then( ()=>{
          this.dialogRef.close(this.id)
        })
      })
    },
    reason => alert("ERROR: the url is not available:" +  reason))
  }      

}
  