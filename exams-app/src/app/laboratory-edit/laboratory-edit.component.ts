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
    this.l = this.fb.group({
      id: [this.laboratory_id],
      videoUrl:[null],
      videoPath:[null],
      videoUserUrl:[null],
      videoUserPath:[null]  
    })

  
  }

  ngOnDestroy(): void {
    this.unsubscribe()
  }

  ngOnInit(): void {

    this.unsubscribe = db.collection("materias/" + this.materia_id + "/laboratory/" ).doc(this.laboratory_id).onSnapshot( 
      snapshot =>{
        this.laboratory = snapshot.data() as Laboratory
        this.update(this.laboratory)
      },
      error=>{
        console.log("ERROR reading materia")
    }) 
    
  }

  update(laboratory:Laboratory){
    this.l = this.fb.group({
      id: [this.laboratory_id],
      videoUrl:[ laboratory.videoUrl],
      videoPath:[laboratory.videoPath],
      videoUserUrl:[null],
      videoUserPath:[null]  
    })    
  }

  selectFile(event) {

    
    var selectedFiles = event.target.files;
    const property = event.srcElement.name
    this.laboratory[property + "Url"] = null
    this.laboratory[property + "Path"] = null

    const bucketName = "organizations/" + this.organization_id + "/materias/" + this.materia_id + "/laboratory/" + this.laboratory_id + "/" + property + ".jpg"

    var file:File = selectedFiles[0]
    var storageRef = storage.ref( bucketName )

    var uploadTask = storageRef.put(file)
    var element = document.getElementById(property + "Status")
    var fileLoadObserver = new FileLoadObserver(storageRef, "materias/" + this.materia_id + "/laboratory" , this.l.controls.id.value, property, element );
    uploadTask.on("state_change", fileLoadObserver)
  }   
  removePropertyValue(property){
    const json = {}
    json[property + "Url"] = null
    json[property + "Path"] = null

    
    db.collection("materias/" + this.materia_id + "/laboratory").doc(this.laboratory_id).update( json ).then( () =>{
      console.log("property was removed")
      this.l.controls[property].setValue(null)
    })
  }

}
