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
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { ExamFormService } from '../exam-form.service';
import { MateriaGroupListComponent } from './materiagroup-list.component';

interface GroupItem{
  group:Group
  fg:FormGroup
}

@Component({
  selector: 'app-group-list',
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
    ,MatToolbarModule

    ,MatSelectModule
    ,MateriaGroupListComponent
  ],
  templateUrl: './group-list.component.html',
  styleUrl: './group-list.component.css'
})
export class GroupListComponent implements OnInit,OnDestroy{
  @Input() career:Career
  @Input() level:Level

  groupItems = signal<Array<GroupItem>>(null)
  submitting = signal(false)
  unsubscribe
  isAdmin = false
  organization_id 

  constructor(private fb:FormBuilder
    , private userLoginService:UserLoginService
    , private userPreferencesService:UserPreferencesService
    , public dialog: MatDialog
    , public formService:ExamFormService
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
    this.loadGroups(this.career.id, this.level.id);
  }

  loadGroups( career_id:string , level_id:string){
    this.unsubscribe = db.collection("careers/" + career_id + "/levels/" + level_id + "/groups")
    .where("isDeleted","==",false)
    .onSnapshot( set =>{
      let groups = new Array<GroupItem>()
      
      set.docs.map( doc =>{          
        const group:Group = doc.data() as Group
        var fg = this.fb.group({
            id:[group.id],
            group_name: [ group.group_name ],
            group_grade_type_id: [ group.group_grade_type_id ],
          })
        let groupItem:GroupItem = {
          group: group,
          fg: fg
        }
        groups.push( groupItem )
      })
      groups.sort( (a,b)=>a.group.group_name>b.group.group_name?1:-1)
      this.groupItems.set(groups)
    })
  }
  onRemoveGroup(group_id){
    db.collection("careers/" + this.career.id + "/levels/" + this.level.id + "/groups/" ).doc(group_id).delete().then( () =>{
      console.log("remove group completed")
    },
    reason =>{
      alert("ERROR: remove group:" + reason)
    })        
  }
  onCreateGroup(){
    const dialogRef = this.dialog.open(DialogNameDialog, {
      height: '400px',
      width: '250px',
      data: {  label:"Group", name:""}
    });
  
    dialogRef.afterClosed().subscribe(data => {
      console.log('The dialog was closed');
      if( data != undefined ){
        console.debug( data )
        this.createGroup(data.name).then( ()=>{
          
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
  
  createGroup(group_name:string):Promise<void>{
    var id = uuid.v4()
  
    const group:Group = {
      id:id,
      group_name:group_name,
      isDeleted:false
    }
    return db.collection('careers/' + this.career.id + "/levels/" + this.level.id + "/groups").doc(id).set(group).then( ()=>{
      console.log("group added")
    },
    reason=>{
      alert("ERROR adding group:" + reason)
    })
  }
  getGroupGradeDescription(group_grade_type_id:number){
    var desc = "Not found"
    GROUP_GRADES_TYPES.map( ggt =>{
      if( ggt.id == group_grade_type_id){
        desc = ggt.description
      }
    })
    return desc
  }   
  getGroupGradeTypes(){
    return GROUP_GRADES_TYPES
  }   
}
