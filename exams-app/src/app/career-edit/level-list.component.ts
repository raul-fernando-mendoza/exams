import { AfterViewInit, Component, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { Career, Group, GROUP_GRADES_TYPES, Level, Materia } from '../exams/exams.module';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { db } from 'src/environments/environment';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import { UserLoginService } from '../user-login.service';
import { UserPreferencesService } from '../user-preferences.service';
import * as uuid from 'uuid';
import { MatDialog } from '@angular/material/dialog';
import { DialogNameDialog } from '../name-dialog/name-dlg';
import { GroupListComponent } from './group-list.component';

interface LevelItem{
  level:Level
  fg:FormGroup
}

@Component({
  selector: 'app-level-list',
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule   
   
    ,FormsModule
    ,ReactiveFormsModule
    ,MatFormFieldModule
    ,MatInputModule    
    ,MatExpansionModule
    ,MatMenuModule

    ,GroupListComponent
  ],
  templateUrl: './level-list.component.html',
  styleUrl: './level-list.component.css'
})
export class LevelListComponent implements OnInit,OnDestroy{
  @Input() career:Career

  levelItems = signal<Array<LevelItem>>(null)
  unsubscribe
  isAdmin = false
  organization_id 

  constructor(private fb:FormBuilder
    , private userLoginService:UserLoginService
    , private userPreferencesService:UserPreferencesService
    , public dialog: MatDialog
  ){

    this.organization_id = userPreferencesService.getCurrentOrganizationId()
      if( this.userLoginService.hasRole("role-admin-" + this.organization_id) ){
        this.isAdmin = true
      }       
  }
  ngOnDestroy(): void {
    this.unsubscribe();
  }
  ngOnInit(): void {
    this.loadLevels(this.career.id);
  }

  loadLevels( career_id:string ){
    this.unsubscribe = db.collection("careers/" + this.career.id + "/levels")
    .where("isDeleted","==",false)
    .onSnapshot( set =>{
      let levels = new Array<LevelItem>()
      
      set.docs.map( doc =>{          
        const level:Level = doc.data() as Level
        var fg = this.fb.group({
          id:[level.id],
          level_name: [ level.level_name ],
        })
        let levelItem:LevelItem = {
          level: level,
          fg: fg
        }
        levels.push( levelItem )
      })
      levels.sort( (a,b)=>a.level.level_name>b.level.level_name?1:-1)
      this.levelItems.set(levels)
    })
  }
  onRemoveLevel(level_id){
    db.collection("careers/" + this.career.id  + "/levels"  ).doc(level_id).delete().then( () =>{
      console.log("remove level has completed")
    },
    reason =>{
      alert("ERROR: remove level:" + reason)
    })
  }  
  onCreateLevel(){
    const dialogRef = this.dialog.open(DialogNameDialog, {
      height: '400px',
      width: '250px',
      data: { career_id:this.career.id, label:"Ciclo", name:""}
    });
  
    dialogRef.afterClosed().subscribe(data => {
      console.log('The dialog was closed');
      if( data != undefined ){
        console.debug( data )
        this.createLevel(this.career.id, data.name).then( ()=>{
          
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

}
