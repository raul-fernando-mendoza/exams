import { Component, inject, Injector, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { Validators,  FormBuilder, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserLoginService } from '../user-login.service';
import { db } from 'src/environments/environment';
import { Career, Cycle, Group, GROUP_GRADES_TYPES, Level, Materia, OptionalContainer, Objective, Semester } from '../exams/exams.module';
import { FormService } from '../form.service';
import { UserPreferencesService } from '../user-preferences.service';
import * as uuid from 'uuid';
import { DialogNameDialog } from '../name-dialog/name-dlg';
import { MatDialog } from '@angular/material/dialog';
import { DialogListSelectDialog } from '../list-select/list-select-dialog';
import { Observer } from 'rxjs';
import videojs from 'video.js';
import { BusinessService } from '../business.service';
import { FileLoadedEvent, FileLoaderComponent } from '../file-loader/file-loader.component';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { HtmlService } from '../html-service.service';
import { TextFieldModule} from '@angular/cdk/text-field';
import { MateriaSelectDialogComponent } from '../materia-select-dialog/materia-select-dialog.component';




@Component({
  selector: 'app-career-edit',
  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule   
   
    ,ReactiveFormsModule
    ,MatFormFieldModule
    ,MatInputModule
    
    ,MatProgressSpinnerModule 
    ,MatMenuModule 
    ,MatSelectModule
    ,FileLoaderComponent
    ,MatCardModule


    //,LevelListComponent
    ,MatSlideToggleModule
    ,TextFieldModule
    ,MatExpansionModule
  ],   
  templateUrl: './career-edit.component.html',
  styleUrls: ['./career-edit.component.css']
})
export class CareerEditComponent implements OnInit, OnDestroy {

  id = null
  collection = "careers"
  organization_id = null

  career = signal<Career>(null)

  description = signal<string>(null)
  pictureDescription = signal<string>(null)
  picture2Description = signal<string>(null)
  videoDescription = signal<string>(null)

  unsubscribe

  player: videojs.Player;

  isAdmin:boolean = false
  isLoggedIn =false
  userUid = null

  hasEnrollments = false
  submitting = signal(false)


  c = this.fb.group({
    id: ["", Validators.required],
    career_name:["", Validators.required], 
    description:[""],

    pictureDescription:[""],
    picture2Description:[""],   

    iconUrl:[""],
    videoUrl:[""],  
    videoDescription:[""],
    isPublished:[true],
    levels:new FormArray([])
    
  })

  nameForm = this.fb.group({
    object_name:[""]
  })

  pictureUrlStatus = {
    status:""
  }
  videoUrlStatus = {
    status:""
  }  

  cycles = signal(new Array<Cycle>())
  editComponentId = signal<string>(null)

  materiasApproved = signal<Map<string, boolean>>(new Map())

  constructor(
      private fb: FormBuilder
    , private route: ActivatedRoute
    , private userLoginService:UserLoginService
    , public formService:FormService
    , private userPreferencesService:UserPreferencesService
    , public dialog: MatDialog
    , public router:Router
    , private businessService:BusinessService
    , private htmlService:HtmlService
    ) { 
      this.id = this.route.snapshot.paramMap.get('id')
      this.organization_id = this.userPreferencesService.getCurrentOrganizationId()
      
      if( this.userLoginService.hasRole("role-admin-" + this.organization_id) ){
        this.isAdmin = true
      }   
      if( this.userLoginService.getIsloggedIn() ){
        this.userUid = this.userLoginService.getUserUid()
        this.isLoggedIn = true

        this.businessService.hasEnrollments(this.organization_id, this.userUid).then( hasEnrollments =>{
          this.hasEnrollments = true
        })
      }
      
  }
  ngOnDestroy(): void {
    if(this.unsubscribe){
      this.unsubscribe()
    }
  }
 
  ngOnInit(): void {
    console.log("reading career")
    this.unsubscribe = db.collection('careers').doc(this.id).onSnapshot( doc =>{
      console.log("career received")
      let career = doc.data() as Career
  
      this.c.controls.id.setValue(career.id ? career.id:"" )  
      this.c.controls.career_name.setValue(career.career_name)
      this.c.controls.description.setValue(career.description)
      this.description.set( this.htmlService.replace_html( career.description) )
      
      this.c.controls.pictureDescription.setValue(career.pictureDescription)
      this.pictureDescription.set( this.htmlService.replace_html( career.pictureDescription))

      this.c.controls.picture2Description.setValue(career.picture2Description)
      this.picture2Description.set( this.htmlService.replace_html( career.picture2Description ))

      this.c.controls.videoDescription.setValue(career.videoDescription)
      this.videoDescription.set( this.htmlService.replace_html( career.videoDescription ))
      this.c.controls.isPublished.setValue(career.isPublished)


      this.cycles.set(career.cycles)

      this.findMateriasApproved( career.cycles )

      this.career.set( career )
      //this.loadLevels(career.id, this.c.controls.levels as UntypedFormArray).then( () =>{
      //})
    },
    reason =>{
      alert("ERROR: reading career" + reason)
    })
  }



  getBasePath():string{
    return "organizations/" + this.organization_id + "/careers/" + this.career().id

  }
  fileLoaded(e:FileLoadedEvent){

    this.businessService.fileLoaded('careers', this.career().id, e)

  }  
  fileDeleted(e:FileLoadedEvent){
    this.businessService.fileDeleted('careers', this.career().id, e)
  }
  onRemove(){
    if( !confirm("Esta seguro de querer borrar el la carrera:" +  this.career().career_name) ){
      return
    } 
    let request:Career = {
      isDeleted:true
    }
    this.businessService.updateDoc( this.collection, this.id, request).then( ()=>{
      console.log("delete completed")
      this.router.navigate(['/career-list'])
    },
    error =>{
    alert( "ERROR:" + error)
    })
  }
  updateCycles(){
    let req:Career = {
      cycles:this.cycles()
    }
    this.businessService.updateDoc( this.collection, this.id, req )    
  }

  addCycle(){
    let newCycles = this.cycles()?this.cycles():[]
    let newCycle:Cycle = {
      id: uuid.v4(),
      cycleName: 'cycle' + newCycles.length,
      objectives: []
    }
    newCycles.push( newCycle )
    
    this.updateCycles()
  }
  removeCycle( c:Cycle ){
    let cycles = this.cycles()
    let idx =cycles.findIndex( e => e.id == c.id )
    if( idx >= 0){
      cycles.splice(idx,1)

      this.updateCycles()      
    }
  }  
  addObjective( cycle:Cycle ){
    let newObjective:Objective = {
      id: uuid.v4(),
      objectiveName: 'objective' + cycle.objectives.length,
      semesters: []
    }
    cycle.objectives.push(newObjective)

    this.updateCycles()
  }
  removeObjective( cycle:Cycle, o:Objective ){
    let cycles = this.cycles()
    let idx =cycle.objectives.findIndex( e => e.id == o.id )
    if( idx >= 0){
      cycle.objectives.splice(idx,1)

      this.updateCycles()      
    }
  }
  addSemester( o:Objective ){
    let newSemester:Semester = {
      id: uuid.v4(),
      semesterName: "" + o.semesters.length,
      materias: []
    }
    o.semesters.push(newSemester)

    this.updateCycles()
  }  
  removeSemester( o:Objective, s:Semester ){
    let cycles = this.cycles()
    let idx =o.semesters.findIndex( e => e.id == s.id )
    if( idx >= 0){
      o.semesters.splice(idx,1)

      this.updateCycles()      
    }
  } 
  addMateria(s:Semester){
    const dialogRef = this.dialog.open(MateriaSelectDialogComponent, {
      height: '400px',
      width: '250px',
      data: {id:null, materia_name:null}
    });
  
    dialogRef.afterClosed().subscribe(data => {
      console.log('The dialog was closed');
      if( data != null ){
        let idx = s.materias.findIndex( e => e.id == data.id )
        if( idx < 0){
          s.materias.push(data)
          this.updateCycles()
        }
        else{
          alert( "la materia ya existe")
        }
      }
      else{
        console.debug("none")
      }
    });
  }


  addMateriaOptional( s:Semester ){
    let newMateriaOptional:OptionalContainer = {
      id: uuid.v4(),
      materias: []
    }
    s.materias.push(newMateriaOptional)
    this.updateCycles()
  }   
  removeMateriaToOptional( s:Semester , mo:OptionalContainer){
    let idx = s.materias.findIndex( e => e.id == mo.id )
    if( idx >= 0){
      s.materias.splice( idx, 1)
    }
    this.updateCycles()
  }     
  
  
  addMateriaToOptional(mo:OptionalContainer){
    const dialogRef = this.dialog.open(MateriaSelectDialogComponent, {
      height: '400px',
      width: '250px',
      data: {id:null, materia_name:null}
    });
  
    dialogRef.afterClosed().subscribe(data => {
      console.log('The dialog was closed');
      if( data != null ){
        let idx = mo.materias.findIndex( e => e.id == data.id )
        if( idx < 0){
          mo.materias.push(data)
          this.updateCycles()
        }
        else{
          alert( "la materia ya existe")
        }
      }
      else{
        console.debug("none")
      }
    });

   
  }
  removeMateria( s:Semester , m:Materia){
    let idx =s.materias.findIndex( e => e.id == m.id )
    if( idx >= 0){
      s.materias.splice(idx,1)

      this.updateCycles()      
    }
  } 
  removeMateriaOptional(mo:OptionalContainer, m:Materia){
    let idx =mo.materias.findIndex( e => e.id == m.id )
    if( idx >= 0){
      mo.materias.splice(idx,1)

      this.updateCycles()      
    }    
  } 
  onRenameStart(c:any, propertyName){
    if( this.isAdmin ){
      this.nameForm.reset()
      this.nameForm.controls.object_name.setValue( c[propertyName] )
      this.editComponentId.set(c.id)
    }
  }
  onNameChange(c:any, propertyName:string){
    if( this.nameForm.dirty ){
      var value = this.nameForm.controls.object_name.value
      c[propertyName] = value
      
      
      this.updateCycles() 
    }  
    this.editComponentId.set(null)  
  }

  findMateriasApproved( cycles:Cycle[]){
    let materiasApproved:Map<string, boolean> = new Map()
    let transactions = []

    cycles.forEach( cycle =>{
      cycle.objectives.forEach( objective =>{
        objective.semesters.forEach( semester =>{
          semester.materias.forEach( materia =>{
            if( materia.hasOwnProperty('materias') ){
              let optionalContainer:OptionalContainer = materia as OptionalContainer


            }
            else{
              let t = this.businessService.getMateriaEnrollment( this.organization_id, materia.id, this.userLoginService.getUserUid() ).then( enrollment =>{
                if( enrollment && enrollment.certificateUrl ){
                  materiasApproved.set( materia.id, true)
                }
              })
              transactions.push( t )
              
            }
          })
        })
      })
    })
    Promise.all( transactions ).then( ()=>{
      this.materiasApproved.set(materiasApproved)
    })

    

  }  
}

