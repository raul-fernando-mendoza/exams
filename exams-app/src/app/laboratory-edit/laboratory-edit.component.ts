import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { NavigationService } from '../navigation.service';
import { UserLoginService } from '../user-login.service';
import { UserPreferencesService } from '../user-preferences.service';
import { db , storage  } from 'src/environments/environment';
import { FileLoadObserver } from "../load-observers/load-observers.module"
import { Laboratory } from '../exams/exams.module';

@Component({
  selector: 'app-laboratory-edit',
  templateUrl: './laboratory-edit.component.html',
  styleUrls: ['./laboratory-edit.component.css']
})
export class LaboratoryEditComponent implements OnInit , AfterViewInit, OnDestroy{

  organization_id = null
  isAdmin = false
  isLoggedIn = false
  materia_id = null
  laboratory_id = null
  l = null
  laboratory:Laboratory = null
  unsubscribe = null

  constructor(
    private fb: FormBuilder
    ,private route: ActivatedRoute
    ,private userLoginService: UserLoginService
    ,private userPreferencesService: UserPreferencesService
    ,public dialog: MatDialog    
  ) {
    this.organization_id = this.userPreferencesService.getCurrentOrganizationId()
    if( this.userLoginService.hasRole("role-admin-" + this.organization_id) ){
      this.isAdmin = true
    }   
    if( this.userLoginService.getUserUid() ){
      this.isLoggedIn = true
    }
    this.materia_id = this.route.snapshot.paramMap.get('materia_id')
    this.laboratory_id = this.route.snapshot.paramMap.get('laboratory_id')
  }
  ngAfterViewInit(): void {


  
  }

  ngOnDestroy(): void {
    this.unsubscribe()
  }

  ngOnInit(): void {

    this.unsubscribe = db.collection("materias/" + this.materia_id + "/laboratory/" ).doc(this.laboratory_id).onSnapshot( 
      snapshot =>{
        this.laboratory = snapshot.data() as Laboratory
        this.l = this.fb.group({
          id: [this.laboratory_id],
          label:[this.laboratory.label],
          videoUrl:[this.laboratory.videoUrl],
          videoPath:[this.laboratory.videoPath],
          soundUrl:[this.laboratory.soundUrl],
          soundPath:[this.laboratory.soundPath],          
        })
      },
      error=>{
        console.log("ERROR reading materia")
    }) 
    
  }

  getBasePath(){
    return "organizations/" + this.organization_id + "/materias/" + this.materia_id + "/laboratory/" + this.laboratory_id
  }
  fileLoaded(path){
    this.l.controls.videoPath.setValue(null)
    this.l.controls.videoUrl.setValue( null )      
      

    var oldPath = this.l.controls.videoPath.value
    var transactions = []
    if( oldPath && oldPath != path){
      let storageRef = storage.ref( oldPath )
      var trans_del = storageRef.delete().then( () =>{
          console.log("old file removed")
      })
      .catch( reason =>{
          console.log("old file can not be erased")
      })
      transactions.push(trans_del)        
    } 
    Promise.all( transactions ).then( () =>{
      let storageRef = storage.ref( path )     
      storageRef.getDownloadURL().then( url =>{
        this.l.controls.videoPath.setValue(path)
        this.l.controls.videoUrl.setValue( url )
        let data = {
          videoPath: this.l.controls.videoPath.value,
          videoUrl: this.l.controls.videoUrl.value
        }
        db.collection("materias/" + this.materia_id + "/laboratory").doc(this.laboratory.id).update(data).then( () =>{
          console.log("url updated")
        })        
      })  
    })               
  }  
  fileDeleted(path){
      console.log("file deleted:" + path)
      this.l.controls.filePath.setValue( null )
      this.l.controls.fileUrl.setValue( null )
      let data = {
        videoPath: this.l.controls.videoPath.value,
        videoUrl: this.l.controls.videoUrl.value
      }
      db.collection("materias/" + this.materia_id + "/laboratory").doc(this.laboratory.id).update(data).then( () =>{
        console.log("url updated")
      })       
  }
  onPropertyChange(event){

    var propertyName = event.srcElement.attributes.formControlname.value
    var value = event.target.value      
    var data = {}
    data[propertyName]=value                       
    db.collection("materias/" + this.materia_id + "/laboratory").doc(this.laboratory.id).update(data).then( () =>{
      console.log("property updated")
    },
    reason =>{
      alert("ERROR: writing property:" + reason)
    })    
  }  
  soundLoaded(path){
    this.l.controls.soundPath.setValue(null)
    this.l.controls.soundUrl.setValue(null)      
      

    var oldPath = this.l.controls.soundPath.value
    var transactions = []
    if( oldPath && oldPath != path){
      let storageRef = storage.ref( oldPath )
      var trans_del = storageRef.delete().then( () =>{
          console.log("old file removed")
      })
      .catch( reason =>{
          console.log("old file can not be erased")
      })
      transactions.push(trans_del)        
    } 
    Promise.all( transactions ).then( () =>{
      let storageRef = storage.ref( path )     
      storageRef.getDownloadURL().then( url =>{

        let data = {
          soundPath: path,
          soundUrl: url
        }
        db.collection("materias/" + this.materia_id + "/laboratory").doc(this.laboratory.id).update(data).then( () =>{
          this.l.controls.soundPath.setValue(path)
          this.l.controls.soundUrl.setValue( url )          
          console.log("url updated")
        })        
      })  
    })               
  }  
  soundDeleted(path){
      console.log("file deleted:" + path)
      this.l.controls.soundPath.setValue( null )
      this.l.controls.soundUrl.setValue( null )
      let data = {
        videoPath: this.l.controls.soundPath.value,
        videoUrl: this.l.controls.soundUrl.value
      }
      db.collection("materias/" + this.materia_id + "/laboratory").doc(this.laboratory.id).update(data).then( () =>{
        console.log("url updated")
      })       
  }  

}
