import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserLoginService } from '../user-login.service';
import { db } from 'src/environments/environment';
import { Career, Group, Level, Materia } from '../exams/exams.module';
import { ExamFormService } from '../exam-form.service';
import { UserPreferencesService } from '../user-preferences.service';
import * as uuid from 'uuid';
import { DialogNameDialog } from '../name-dialog/name-dlg';
import { MatDialog } from '@angular/material/dialog';
import { DialogListSelectDialog } from '../list-select/list-select-dialog';


@Component({
  selector: 'app-career-edit',
  templateUrl: './career-edit.component.html',
  styleUrls: ['./career-edit.component.css']
})
export class CareerEditComponent implements OnInit, OnDestroy {

  id = null

  organization_id = null

  snapshots:Array<any> = []

  c = this.fb.group({
    id: [null, Validators.required],
    career_name:[null, Validators.required],   
    description:[null],
    levels:new FormArray([])
  })

  constructor(
      private fb: FormBuilder
    , private route: ActivatedRoute
    , private userLoginService:UserLoginService
    , public formService:ExamFormService
    , public userPreferencesService:UserPreferencesService
    , public dialog: MatDialog
    ) { 
      this.id = this.route.snapshot.paramMap.get('id')
      this.organization_id =  this.userPreferencesService.getCurrentOrganizationId()
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
    this.update()
  }
  
  update(){
    this.loadCareer()
  }

  loadCareer():Promise<void>{
    return new Promise<void>( (resolve, reject) =>{
      db.collection('careers').doc(this.id).get().then( doc =>{
        const career:Career = doc.data() as Career
        this.c.controls.id.setValue(career.id)  
        this.c.controls.career_name.setValue(career.career_name)
        this.loadLevels(career.id, this.c.controls.levels as FormArray).then( () =>{
          resolve()
        })
      },
      reason =>{
        alert("ERROR: reading career" + reason)
        reject()
      })  
    })  
  }
  onCreateLevel(career_id){
    const dialogRef = this.dialog.open(DialogNameDialog, {
      height: '400px',
      width: '250px',
      data: { carrer_id:career_id, label:"Ciclo", name:""}
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
    return db.collection('careers/' + career_id + "/levels").doc(id).set(nivel)
  }
  loadLevels( career_id:string, levels:FormArray):Promise<void>{
    
    return new Promise<void>((resolve, reject)=>{
      var unsubscribe = db.collection("careers/" + career_id + "/levels")
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
    return db.collection('careers/' + career_id + "/levels/" + level_id + "/groups").doc(id).set(nivel)
  }
  loadGroups( career_id:string, level_id, groups:FormArray):Promise<void>{
    
    return new Promise<void>((resolve, reject)=>{
      var unsubscribe = db.collection("careers/" + career_id + "/levels/" + level_id + "/groups")
      .where("isDeleted", "==", false)
      .onSnapshot( set =>{
        groups.controls.length = 0
        var map = set.docs.map( doc =>{
          const group:Group = doc.data() as Group
          var fg = this.fb.group({
            id:[group.id],
            group_name: [ group.group_name ],
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
    )
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
            return a_FG.controls.materia_name.value > b_FG.controls.materia_name? 1:-1
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
      
    },
    reason=>{
      alert("ERROR: removing materia")
    })
  }
  onRemoveGroup(career_id, level_id, group_id){
    db.collection("careers/" + career_id + "/levels/" + level_id + "/groups/" ).doc(group_id).delete().then( () =>{
      
    },
    reason =>{
      alert("ERROR: remove group")
    })
  }
  onRemoveLevel(career_id, level_id){
    db.collection("careers/" + career_id + "/levels"  ).doc(level_id).delete().then( () =>{
      
    },
    reason =>{
      alert("ERROR: remove group")
    })
  }
    
}
