import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserLoginService } from '../user-login.service';
import { db, storage } from 'src/environments/environment';
import { Career, Group, GROUP_GRADES_TYPES, Level, Materia } from '../exams/exams.module';
import { ExamFormService } from '../exam-form.service';
import { UserPreferencesService } from '../user-preferences.service';
import * as uuid from 'uuid';
import { DialogNameDialog } from '../name-dialog/name-dlg';
import { MatDialog } from '@angular/material/dialog';
import { DialogListSelectDialog } from '../list-select/list-select-dialog';
import { Observer } from 'rxjs';
import videojs from 'video.js';
import { FileLoadObserver, VideoLoadObserver  } from '../load-observers/load-observers.module';

@Component({
  selector: 'app-career-edit',
  templateUrl: './career-edit.component.html',
  styleUrls: ['./career-edit.component.css']
})
export class CareerEditComponent implements OnInit, OnDestroy {

  id = null

  organization_id = null

  career:Career = null

  snapshots:Array<any> = []

  player: videojs.Player;

  isAdmin:boolean = false
  isLoggedIn =false


  c = this.fb.group({
    id: [null, Validators.required],
    career_name:[null, Validators.required], 
    description:[null],
    pictureUrl:[null],
    pictureDescription:[null],
    iconUrl:[null],
    videoUrl:[null],  
    videoDescription:[null],
    levels:new FormArray([])
  })

  pictureUrlStatus = {
    status:""
  }
  videoUrlStatus = {
    status:""
  }  

  constructor(
      private fb: FormBuilder
    , private route: ActivatedRoute
    , private userLoginService:UserLoginService
    , public formService:ExamFormService
    , public userPreferencesService:UserPreferencesService
    , public dialog: MatDialog
    , public router:Router
    ) { 
      this.id = this.route.snapshot.paramMap.get('id')
      this.organization_id =  this.userPreferencesService.getCurrentOrganizationId()
      this.organization_id = this.userPreferencesService.getCurrentOrganizationId()
      if( this.userLoginService.hasRole("role-admin-" + this.organization_id) ){
        this.isAdmin = true
      }   
      if( this.userLoginService.getUserUid() ){
        this.isLoggedIn = true
      }
  }
  ngOnDestroy(): void {
    this.snapshots.map( func =>{
      func()
    })
  }


  getFormArrayControls( fg:FormGroup , property):AbstractControl[]{
    var fa:FormArray = fg.controls[property] as FormArray
    return fa.controls
  }  
  ngOnInit(): void {
    const unsubscribe = db.collection('careers').doc(this.id).onSnapshot( doc =>{
      this.career = doc.data() as Career
      this.c.controls.id.setValue(this.career.id)  
      this.c.controls.career_name.setValue(this.career.career_name)
      this.c.controls.description.setValue(this.career.description)
      this.c.controls.pictureUrl.setValue(this.career.pictureUrl)
      this.c.controls.pictureDescription.setValue(this.career.pictureDescription)
      this.c.controls.videoUrl.setValue(this.career.videoUrl)
      this.c.controls.videoDescription.setValue(this.career.videoDescription)
      this.loadLevels(this.career.id, this.c.controls.levels as FormArray).then( () =>{
      })
    },
    reason =>{
      alert("ERROR: reading career" + reason)
    })
    this.snapshots.push(unsubscribe)  

  }

  onCreateLevel(career_id){
    const dialogRef = this.dialog.open(DialogNameDialog, {
      height: '400px',
      width: '250px',
      data: { career_id:career_id, label:"Ciclo", name:""}
    });
  
    dialogRef.afterClosed().subscribe(data => {
      console.log('The dialog was closed');
      if( data != undefined ){
        console.debug( data )
        this.createLevel(career_id, data.name).then( ()=>{
          
        },
        reason =>{
          alert("ERROR: removing level")
        })
      }
      else{
        console.debug("none")
      }
    });
  }
  
  createLevel(career_id, level_name:string):Promise<void>{
    var id = uuid.v4()
  
    const nivel:Level = {
      id:id,
      level_name:level_name,
      isDeleted:false
    }
    return db.collection('careers/' + career_id + "/levels").doc(id).set(nivel).then( ()=>{
    })
  }

  loadLevels( career_id:string, levels:FormArray):Promise<void>{
    return new Promise<void>((resolve, reject)=>{
      const unsubscribe = db.collection("careers/" + career_id + "/levels")
      .where("isDeleted","==",false)
      .onSnapshot( set =>{
        levels.controls.length = 0
        var map = set.docs.map( doc =>{          
          const level:Level = doc.data() as Level
          var level_FG = this.fb.group({
            id:[level.id],
            level_name: [ level.level_name ],
            groups: new FormArray([])
          })
          levels.controls.push( level_FG )
          return this.loadGroups( career_id, level.id, level_FG.controls.groups as FormArray)
        })
        Promise.all( map ).then( ()=>{
          levels.controls.sort( (a,b) =>{
            var a_FG = a as FormGroup
            var b_FG = b as FormGroup
            return a_FG.controls.level_name.value > b_FG.controls.level_name.value? 1:-1
          })
          resolve()
        })
      })
      this.snapshots.push( unsubscribe )
    })
  }

  onCreateGroup(career_id, level_id){
    const dialogRef = this.dialog.open(DialogNameDialog, {
      height: '400px',
      width: '250px',
      data: { career_id:career_id, level_id:level_id, label:"Group", name:""}
    });
  
    dialogRef.afterClosed().subscribe(data => {
      console.log('The dialog was closed');
      if( data != undefined ){
        console.debug( data )
        this.createGroup(data.career_id, data.level_id,  data.name).then( ()=>{
          
        },
        reason =>{
          alert("ERROR can not create group:" + reason)
        })
      }
      else{
        console.debug("none")
      }
    });
  }
  
  createGroup(career_id, level_id, group_name:string):Promise<void>{
    var id = uuid.v4()
  
    const nivel:Group = {
      id:id,
      group_name:group_name,
      isDeleted:false
    }
    return db.collection('careers/' + career_id + "/levels/" + level_id + "/groups").doc(id).set(nivel).then( ()=>{
      console.log("group added")
    },
    reason=>{
      alert("ERROR adding group:" + reason)
    })
  }
  loadGroups( career_id:string, level_id, groups:FormArray):Promise<void>{
    
    return new Promise<void>((resolve, reject)=>{
      const unsubscribe = db.collection("careers/" + career_id + "/levels/" + level_id + "/groups")
      .where("isDeleted", "==", false)
      .onSnapshot( set =>{
        groups.controls.length = 0
        var map = set.docs.map( doc =>{
          const group:Group = doc.data() as Group
          var fg = this.fb.group({
            id:[group.id],
            group_name: [ group.group_name ],
            group_grade_type_id: [ group.group_grade_type_id ],
            materias: new FormArray([])
          })
          groups.controls.push( fg )
          return this.loadMaterias(career_id, level_id, group.id, fg.controls.materias as FormArray)
        })
        Promise.all( map ).then( ()=>{
          groups.controls.sort( (a,b) =>{
            var a_FG = a as FormGroup
            var b_FG = b as FormGroup
            return a_FG.controls.group_name.value > b_FG.controls.group_name.value ? 1:-1
          })
          resolve()
        })
      },
      reason => {
        alert("can not read groups:" + reason)
      })
      this.snapshots.push( unsubscribe )
    })
  }

  
  onAddMateria(career_id, level_id, group_id:string){
      db.collection("materias")
      .where("isDeleted", "==", false)
      .where("organization_id","==", this.organization_id)
      .get()
      .then( set =>{
        var materias:Materia[] = [] 
        var map = set.docs.map( doc =>{
          const materia = doc.data() as Materia
          materias.push(materia)
        })
        materias.sort( (a,b)=>{
          return a.materia_name > b.materia_name ? 1: -1
        })
        const dialogRef = this.dialog.open(DialogListSelectDialog, {
          height: '400px',
          width: '250px',
          data: { 
            career_id:career_id, 
            level_id:level_id, 
            group_id:group_id,
            label:"Materia", 
            name:"",
            options:materias,
            property:"materia_name",
            value:null
          }
        });
      
        dialogRef.afterClosed().subscribe(data => {
          console.log('The dialog was closed');
          if( data != undefined ){
            console.debug( data )
            this.AddMateria(data.career_id, data.level_id, data.group_id, data.value).then( ()=>{
              
            },
            reason =>{
              alert("ERROR can not create group:" + reason)
            })
          }
          else{
            console.debug("none")
          }
        });
    
        
      })

  }

  AddMateria(career_id, level_id, group_id, materia_id){
    const id = materia_id
    return db.collection("careers/" + career_id + "/levels/" + level_id + "/groups/" + group_id + "/materias").doc(id).set(
      {
        id:id,
        materia_id:materia_id
      }
    ).then( ()=>{
      console.log("materias added")
    },
    reason =>{
      alert("ERROR: adding materia" + reason)
    })
  }

  loadMaterias( career_id:string, level_id:string, group_id:string, materias:FormArray):Promise<void>{
    return new Promise<void>((resolve, reject)=>{
      
      var unsubscribe = db.collection("careers/" + career_id + "/levels/" + level_id + "/groups/" + group_id + "/materias").onSnapshot( set =>{
        materias.controls.length = 0
        var map = set.docs.map( doc =>{
          const materia:Materia = doc.data() as Materia
          var fg = this.fb.group({
            id:[materia.id],
            materia_name: null
          })
          materias.controls.push( fg )
          return db.collection("materias").doc( materia.id).get().then( doc =>{
            const materiaDetail:Materia = doc.data() as Materia
            fg.controls.materia_name.setValue( materiaDetail.materia_name )
          })
        })
        Promise.all( map ).then( ()=>{
          materias.controls.sort( (a,b) =>{
            var a_FG = a as FormGroup
            var b_FG = b as FormGroup
            return a_FG.controls.materia_name.value > b_FG.controls.materia_name.value ? 1:-1
          })
          resolve()
        })
      },
      reason => {
        alert("can not read groups:" + reason)
      })
      this.snapshots.push( unsubscribe )
    })
  }

  onRemoveMateria(career_id, level_id, group_id, materia_id){
    db.collection("careers/" + career_id + "/levels/" + level_id + "/groups/" + group_id + "/materias").doc(materia_id).delete().then( () =>{
      console.log("materia has been deleted")
    },
    reason=>{
      alert("ERROR: removing materia")
    })
  }
  onRemoveGroup(career_id, level_id, group_id){
    db.collection("careers/" + career_id + "/levels/" + level_id + "/groups/" ).doc(group_id).delete().then( () =>{
      console.log("remove group completed")
    },
    reason =>{
      alert("ERROR: remove group")
    })
  }
  onRemoveLevel(career_id, level_id){
    db.collection("careers/" + career_id + "/levels"  ).doc(level_id).delete().then( () =>{
      console.log("remove level has completed")
    },
    reason =>{
      alert("ERROR: remove group")
    })
  }
 
  selectFile(event) {
    var selectedFiles = event.target.files;
    const property = event.srcElement.name

    this.removePropertyValue(property).then( ()=>{
      const bucketName = "organizations/" + this.organization_id + "/careers/" + this.id + "/" + property + ".jpg"

      var file:File = selectedFiles[0]
      var storageRef = storage.ref( bucketName )

      var uploadTask = storageRef.put(file)
      var statusElement = document.getElementById(property + "Status")
      var fileLoadObserver = new FileLoadObserver(storageRef, "careers", this.id, property, statusElement );
      uploadTask.on("state_change", fileLoadObserver)
    })

  } 


  removePropertyValue(property):Promise<void>{
    const json = {}
    json[property + "Url"] = null
    json[property + "Path"] = null

    
    return db.collection("careers").doc(this.id).update( json ).then( () =>{
      console.log("property was removed")
      //this.c.controls[property].setValue(null)
    })
  }

  selectVideo(event) {
    var selectedFiles = event.target.files;
    const property = event.srcElement.name

    const bucketName = "organizations/" + this.organization_id + "/careers/" + this.id + "/" + property + ".mp4"

    var file:File = selectedFiles[0]
    var storageRef = storage.ref( bucketName )

    var uploadTask = storageRef.put(file)
    var statusElement = document.getElementById(property + "Status")
    var fileLoadObserver = new VideoLoadObserver(storageRef, "careers", this.id, property, statusElement );
    uploadTask.on("state_change", fileLoadObserver)
  } 
  getGroupGradeTypes(){
    return GROUP_GRADES_TYPES
  }
  getGroupGradeDescrption( id ){
    for( let i = 0; i<GROUP_GRADES_TYPES.length; i++){
      if( GROUP_GRADES_TYPES[i].id = id){
        return GROUP_GRADES_TYPES[i].description
      }
    }
  }
  onPropertyChange(event){
    var id =this.c.controls.id.value

    var propertyName = event.srcElement.attributes.formControlname.value
    var value = event.target.value      
    this.c.controls[propertyName].setValue( value )
    if( id ){   
      var values = {}
      values[propertyName]=value                       
      db.collection('careers').doc(id).update(values).then( () =>{
        console.log("property has been update:" + propertyName + " " + value)
      },
      reason =>{
        alert("ERROR: writing property:" + reason)
      })
    }      
  }


}

