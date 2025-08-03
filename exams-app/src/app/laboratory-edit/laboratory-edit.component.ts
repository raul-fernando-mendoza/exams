import { AfterViewInit, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog  } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BusinessService } from '../business.service';
import { NavigationService } from '../navigation.service';
import { UserLoginService } from '../user-login.service';
import { UserPreferencesService } from '../user-preferences.service';
import { db , storage  } from 'src/environments/environment';
import { FileLoadObserver } from "../load-observers/load-observers.module"
import { Laboratory } from '../exams/exams.module';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-laboratory-edit',
  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule   
   
    ,FormsModule
    ,ReactiveFormsModule
    ,MatFormFieldModule
    ,MatInputModule

  ],   
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
  laboratory = signal<Laboratory>(null)
  unsubscribe = null

  constructor(
    private fb: FormBuilder
    ,private route: ActivatedRoute
    ,private userLoginService: UserLoginService
    ,private userPreferencesService: UserPreferencesService
    ,public dialog: MatDialog    
    ,private examImprovisacionService:BusinessService
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
        let laboratory = snapshot.data() as Laboratory
        this.l = this.fb.group({
          id: [laboratory.id],
          label:[laboratory.label],
          videoUrl:[laboratory.videoUrl],
          videoPath:[laboratory.videoPath],
          soundUrl:[laboratory.soundUrl],
          soundPath:[laboratory.soundPath],          
        })
        this.laboratory.set(laboratory)
      },
      error=>{
        console.log("ERROR reading materia")
    }) 
    
  }

  getBasePath(){
    return "organizations/" + this.organization_id + "/materias/" + this.materia_id + "/laboratory/" + this.laboratory_id
  }
  fileLoaded(e){
    this.examImprovisacionService.fileLoaded("materias/" + this.materia_id + "/laboratory", this.laboratory().id, e)
  }  
  fileDeleted(e){
    this.examImprovisacionService.fileDeleted("materias/" + this.materia_id + "/laboratory", this.laboratory().id, e)
  }
  onPropertyChange(event){

    var propertyName = event.srcElement.attributes.formControlname.value
    var value = event.target.value      
    var data = {}
    data[propertyName]=value                       
    db.collection("materias/" + this.materia_id + "/laboratory").doc(this.laboratory().id).update(data).then( () =>{
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
