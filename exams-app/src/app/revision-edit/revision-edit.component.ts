import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserLoginService } from "../user-login.service"
import * as uuid from 'uuid';
import { UserPreferencesService } from '../user-preferences.service';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { FileLoadedEvent } from '../file-loader/file-loader.component';
import { Revision, RevisionStatus, VideoMarker } from '../exams/exams.module';
import { db , storage} from 'src/environments/environment';
import { FormBuilder } from '@angular/forms';


@Component({
  selector: 'app-revision-edit',
  templateUrl: './revision-edit.component.html',
  styleUrls: ['./revision-edit.component.css']
})
export class RevisionEditComponent implements OnInit, OnDestroy{

  organizationId=null
  parameterId=null

  
  isAdmin=false
  userUid=null

  revision:Revision=null
  videoMarker:VideoMarker

  collection = "Revision"
  unsubscribe 

  revisionFG = this.fb.group({
    videoPath:[null],
    userUid:[null]
  })  



  constructor(
     private route: ActivatedRoute
    ,private router: Router
    ,private fb:FormBuilder
    ,private userLoginService: UserLoginService
    ,private userPreferencesService: UserPreferencesService
    ,private examImprovisacionService: ExamenesImprovisacionService

  ) {
    this.organizationId = this.userPreferencesService.getCurrentOrganizationId()
    if( this.userLoginService.hasRole("role-admin-" + this.organizationId) ){
      this.isAdmin = true
    }   
    if( this.userLoginService.getUserUid() ){
      this.userUid = this.userLoginService.getUserUid()
    }    
    if( this.route.snapshot.paramMap.get('revisionId') != 'null'){
      this.parameterId = this.route.snapshot.paramMap.get('revisionId')
    }


   }
  ngOnDestroy(): void {
    if( this.unsubscribe ){
      this.unsubscribe()
    }
  }

  ngOnInit(): void {

    this.unsubscribe = db.collection(this.collection).doc(this.parameterId).onSnapshot( doc =>{
      this.revision= doc.data() as Revision
      var controls = this.revisionFG.controls
      //controls.videoPath.setValue(this.revision.videoPath)
      controls.userUid.setValue(this.revision.student_uid)
      db.collection(this.collection + "/"+ this.revision.id + "/VideoMarker" ).get().then( set=>{
        set.docs.map( doc =>{
          this.videoMarker = doc.data() as VideoMarker
        })
      })
    },
    reason =>{
      alert("ERROR reading revision:" + reason)
    })

  }

  getBasePath(){
    return "organizations/" + this.organizationId + "/"+ this.collection + "/" + this.revision.id 
  } 
/*
  fileLoaded(path){
    //this.revision.videoPath = null
    //this.revision.videoUrl = null
    var videoPath = this.revisionFG.controls.videoPath.value
    let storageRef = storage.ref( videoPath )
    storageRef.getDownloadURL().then( videoUrl =>{
      this.examImprovisacionService.updateRevision( {id:this.revision.id, videoPath:videoPath, videoUrl:videoUrl} ).then(()=>{
         console.log("update completed")
      },
      reason =>{
        alert("video could not be updated")
      })
    })

  }  
  
  fileDeleted(e){
    this.revision.videoPath= null
  }  
  */
  onUserSelected(value){
    console.log( value )
  }
  
  onSubmit(){
    console.log("form submit")

    this.examImprovisacionService.updateRevision( { id:this.revision.id, status:RevisionStatus.completed } ).then(()=>{
      this.router.navigate(['revision-list',{  }])
    })
  }
}
