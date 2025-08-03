import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder,Validators } from '@angular/forms';
import { MatDialog  } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { NavigationService } from '../navigation.service';
import { UserLoginService } from '../user-login.service';
import { UserPreferencesService } from '../user-preferences.service';
import { db , storage  } from 'src/environments/environment';
import { getLaboratoryStatusName, Laboratory, LaboratoryGrade, LaboratoryGradeStatus, LaboratoryGradeStudentData, Marker, VideoMarker } from '../exams/exams.module';
import { ExamFormService } from '../form.service';
import { DateFormatService } from '../date-format.service';
import { Observer } from 'rxjs';
import { FileLoadObserver } from '../load-observers/load-observers.module';
import { FileLoadedEvent } from '../file-loader/file-loader.component';
import * as uuid from 'uuid';


import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatStepperModule} from '@angular/material/stepper';

@Component({
  selector: 'app-laboratory-grade-edit',
  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule   
   
    ,FormsModule
    ,ReactiveFormsModule
    ,MatFormFieldModule

    ,MatStepperModule 

  ],  
  templateUrl: './laboratory-grade-edit.component.html',
  styleUrls: ['./laboratory-grade-edit.component.css']
})
export class LaboratoryGradeEditComponent implements OnInit {

  public LaboratoryGradeStatus = LaboratoryGradeStatus
  
  organizationId = null
  isAdmin = false
  isLoggedIn = false
  materiaId = null
  laboratoryGradeId = null
  laboratoryGrade:LaboratoryGrade = null
  laboratory:Laboratory = null
  videoMarker = null
  unsubscribe = null
  unsubscribeVideoMarker = null
 
  videoUrl:[null]
  videoPath:[null]  

  path = "laboratoryGrades" 

  newVideoMakerId= uuid.v4()

  videoMarkerFG = this.fb.group({
    videoPath:["", Validators.required],
    videoUrl:["",Validators.required]
  })

  constructor(
    private fb: FormBuilder
    ,private route: ActivatedRoute
    ,private dateFormatService:DateFormatService
    ,private userLoginService: UserLoginService
    ,private userPreferencesService: UserPreferencesService
    ,public dialog: MatDialog
    ,private router:Router
    ,private examenesImprovisacionService:ExamenesImprovisacionService
  ) {
    this.organizationId = this.userPreferencesService.getCurrentOrganizationId()
    if( this.userLoginService.hasRole("role-admin-" + this.organizationId) ){
      this.isAdmin = true
    }   
    if( this.userLoginService.getUserUid() ){
      this.isLoggedIn = true
    }
    this.laboratoryGradeId = this.route.snapshot.paramMap.get('laboratory_grade_id')
  
    
  }
  ngAfterViewInit(): void {

    this.unsubscribe = db.collection("laboratoryGrades").doc(this.laboratoryGradeId).onSnapshot( doc =>{
      this.laboratoryGrade  = doc.data() as LaboratoryGrade
      this.loadLaboratory( this.laboratoryGrade.materia_id, this.laboratoryGrade.laboratory_id )
      if( this.unsubscribeVideoMarker ){ 
        this.unsubscribeVideoMarker() 
      }
      this.unsubscribeVideoMarker = db.collection("laboratoryGrades/" + this.laboratoryGradeId + "/VideoMarker" ).where("isDeleted","==",false).onSnapshot( set =>{
        set.docs.map( doc =>{
          this.videoMarker = doc.data() as VideoMarker
        })          
      },
      reason =>{
        alert("ERROR reading video Marker:" + reason)
      })
    })
  }
  loadLaboratory(materia_id:string, laboratory_id:string){

    db.collection("materias/" + materia_id + "/laboratory/" ).doc(laboratory_id).get().then( 
      doc =>{
        this.laboratory = doc.data() as Laboratory
      },
      error=>{
        console.log("ERROR reading materia")
    })    
    
    
  }

  ngOnDestroy(): void {
    this.unsubscribe()
    if( this.unsubscribeVideoMarker ){
      this.unsubscribeVideoMarker()
    }
  }

  ngOnInit(): void {

  }


 


  onCompleted(){

    if( this.videoMarker ){
      db.collection( this.getCollection() + "/VideoMarker").doc(this.videoMarker.id).update({isDeleted:true}).then( ()=>{
        console.log("Old videoMarker updated")
      },
      reason=>{
        alert("Error creating videoMarker:" + reason)
      })
    } 
    
    let videoPath = this.videoMarkerFG.controls.videoPath.value
    let videoUrl = this.videoMarkerFG.controls.videoUrl.value
    let videoMarker:VideoMarker={
      id:this.newVideoMakerId,
      videoPath:videoPath,
      videoUrl:videoUrl,
      isDeleted:false
    }
    db.collection( this.getCollection() + "/VideoMarker").doc(videoMarker.id).set(videoMarker).then( ()=>{
      console.log("Video Marker completed")
    },
    reason=>{
      alert("Error creating videoMarker:" + reason)
    })


    const data = {
      status:LaboratoryGradeStatus.requestGrade,
      requestedDay:this.dateFormatService.getDayId(new Date()),
      requestedMonth:this.dateFormatService.getMonthId(new Date()),
      requestedYear:this.dateFormatService.getYearId(new Date()),
      updatedon:new Date()
    }   
    db.collection("laboratoryGrades").doc(this.laboratoryGradeId).update(data).then( data =>{
      alert("su video ha sido enviado a revision")
      this.laboratoryGrade.status = LaboratoryGradeStatus.requestGrade
      this.router.navigate(['/home'])
    })
  }

  onReleased(){
    db.collection("laboratoryGrades").doc(this.laboratoryGradeId).update({ status:LaboratoryGradeStatus.accepted}).then( data =>{
      this.laboratoryGrade.status = LaboratoryGradeStatus.accepted
      this.router.navigate(["/laboratory-grade-list"])
    })
  }  
  onRework(){
    db.collection("laboratoryGrades").doc(this.laboratoryGradeId).update({ status:LaboratoryGradeStatus.rework}).then( data =>{
      this.laboratoryGrade.status = LaboratoryGradeStatus.rework
      this.router.navigate(["/laboratory-grade-list"])
    })
  }  

  getLaboratoryGradeStatusName(laboratoryGradeStatus:LaboratoryGradeStatus){
    return getLaboratoryStatusName(laboratoryGradeStatus)
  }
  getBasePath(){
    return "organizations/" + this.organizationId + "/laboratoryGrades/" + this.laboratoryGradeId + "/VideoMarker/" + "practiceData"
  }
  getCollection(){
    return "/laboratoryGrades/" + this.laboratoryGradeId
  }  

  removePreviousVideo(videoPath:string):Promise<void>{
    return new Promise<void>((resolve, reject)=>{
      db.collection(this.getCollection() + "/VideoMarker").doc("practiceData").get().then(doc=>{
        if( doc.exists ){
          let previousVideoMarker=doc.data() as VideoMarker
          if( previousVideoMarker.videoPath != videoPath ){
            var storageOldRef = storage.ref( previousVideoMarker.videoPath ).delete().then( () =>{
              console.log("previous path was removed")
            })
          }
          //now remove all previous sounds
          db.collection( this.getCollection() + "/VideoMarker/practiceData/Marker").get().then( set =>{
            let transactions = set.docs.map( doc =>{
              let marker = doc.data() as Marker
              return storage.ref( marker.commentPath ).delete().then( () =>{
                console.log("previous commentPath was removed")
              })
            })
            Promise.all( transactions ).then(
              ()=>{
                resolve()
              },
              reason=>{
                reject( reason )
              }
            )
          })            
        }
        else{
          resolve()
        }
      })
    })
  }

  fileLoaded(videoPath:string){
    let storageRef = storage.ref( videoPath )
    storageRef.getDownloadURL().then( url =>{
      this.videoMarkerFG.controls.videoUrl.setValue( url )
    })    

  }  
  fileDeleted(e:FileLoadedEvent){
    this.examenesImprovisacionService.fileDeleted('laboratoryGrades/' + this.laboratoryGradeId + "/VideoMarker", "practiceData", e)
  }

  getVideoId(url){
    return this.examenesImprovisacionService.getVideoId(url)
  }
}
