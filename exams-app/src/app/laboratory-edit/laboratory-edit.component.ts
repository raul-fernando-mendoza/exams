import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog  } from '@angular/material/dialog';
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
export class LaboratoryEditComponent implements OnInit , OnDestroy{

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
    ,private examImprovisacionService:ExamenesImprovisacionService
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
  fileLoaded(e){
    this.examImprovisacionService.fileLoaded("materias/" + this.materia_id + "/laboratory", this.laboratory.id, e)
  }  
  fileDeleted(e){
    this.examImprovisacionService.fileDeleted("materias/" + this.materia_id + "/laboratory", this.laboratory.id, e)
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
  getVideoId(videoPath){
    return this.examImprovisacionService.getVideoId(videoPath)
  }
}
