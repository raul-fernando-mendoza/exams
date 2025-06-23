import {  Component, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { Career, Group, Level, Materia } from '../exams/exams.module';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { db } from 'src/environments/environment';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UserLoginService } from '../user-login.service';
import { UserPreferencesService } from '../user-preferences.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogListSelectDialog } from '../list-select/list-select-dialog';
import { MatMenuModule } from '@angular/material/menu';

interface MateriaGroup{
  id:string
  materia_id:string  
}

interface MateriaGroupItem{
  materiaGroup:MateriaGroup
  materia: Materia
  fg:FormGroup
}

@Component({
  selector: 'app-materiagroup-list',
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule   
   
    ,MatMenuModule
  ],
  templateUrl: './materiagroup-list.component.html',
  styleUrl: './materiagroup-list.component.css'
})
export class MateriaGroupListComponent implements OnInit,OnDestroy{
  @Input() career:Career
  @Input() level:Level
  @Input() group:Group

  materiaGroupItems = signal<Array<MateriaGroupItem>>(null)
  submitting = signal<boolean>(false)
  unsubscribe
  isAdmin = false
  organization_id 

  constructor(private fb:FormBuilder
    , private userLoginService:UserLoginService
    , private userPreferencesService:UserPreferencesService
    , public dialog: MatDialog
  ){

    this.organization_id = this.userPreferencesService.getCurrentOrganizationId()
      if( this.userLoginService.hasRole("role-admin-" + this.organization_id) ){
        this.isAdmin = true
      }       
  }
  ngOnDestroy(): void {
    this.unsubscribe();
  }
  ngOnInit(): void {
    this.loadMaterias(this.career.id, this.level.id, this.group.id);
  }
  onAddMateria(){
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
            career_id:this.career.id, 
            level_id:this.level.id, 
            group_id:this.group.id,
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

  loadMaterias( career_id:string, level_id:string, group_id:string){
    this.unsubscribe = db.collection("careers/" + career_id + "/levels/" + level_id + "/groups/" + group_id + "/materias").onSnapshot( set =>{
      let materiaGroupItems = new Array<MateriaGroupItem>()
      var map = set.docs.map( doc =>{
        const materiaGroup:MateriaGroup = doc.data() as MateriaGroup
        var fg = this.fb.group({
          id:[materiaGroup.materia_id]
        })
        let materiaGroupItem:MateriaGroupItem = {
          materiaGroup: materiaGroup,
          materia: undefined,
          fg: fg
        }
        materiaGroupItems.push( materiaGroupItem )
        return db.collection("materias").doc( materiaGroup.materia_id).get().then( doc =>{
          const materia:Materia = doc.data() as Materia
          materiaGroupItem.materia = materia
        },
        reason=>{
          console.log("materia not found:" + materiaGroup.id + "-" + reason)
        })
      })
      Promise.all( map ).then( ()=>{
        materiaGroupItems.sort( (a,b) =>{
          return a.materia?.materia_name > b.materia?.materia_name ? 1:-1
        })
        this.materiaGroupItems.set(materiaGroupItems)
      })
    })
  }

  onRemoveMateria( materia_id:string ){
    db.collection("careers/" + this.career.id + "/levels/" + this.level.id + "/groups/" + this.group.id + "/materias").doc(materia_id).delete().then( () =>{
      console.log("materia has been deleted")
    },
    reason=>{
      alert("ERROR: removing materia:" + reason)
    })
  }

}
