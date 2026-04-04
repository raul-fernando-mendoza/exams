import { AfterViewInit, Component, Input, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserPreferencesService } from '../user-preferences.service';
import { db } from 'src/environments/environment';
import { Career, Group, GroupGrade, GROUP_GRADES_TYPES, Level, Materia, MateriaEnrollment, User, OptionalContainer, Cycle } from '../exams/exams.module';
import { UserLoginService } from '../user-login.service';
import { ExamenImprovisacionFormComponent } from '../examen-improvisacion-form/examen-improvisacion-form.component';
import { BusinessService } from '../business.service';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';
import { OptionalContainerDialogComponent } from '../career-edit/optionalContainer-dialog.component';


interface MateriaItem{ 
  materia:Materia 
  materiaEnrollment:MateriaEnrollment 
}


interface GroupItem{
  group:Group
  groupGrade:GroupGrade
  materias:Array<Materia>
}

interface LevelItem{
  level:Level
  groupItems:Array<GroupItem>
}

      


@Component({
  selector: 'app-career-user',
  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule   
    ,MatCardModule 
    ,MatProgressSpinnerModule 
    ,MatToolbarModule
    ,MatProgressBarModule
  ],   
  templateUrl: './career-user.component.html',
  styleUrls: ['./career-user.component.css']
})
export class CareerUserComponent implements OnInit  {
  
  @Input() career_id:string|null = null
  @Input() user_uid:string|null = null 
  organization_id:string

  isAdmin:boolean = false

  career = signal<Career|null>(null)
  user = signal<User|null>(null)
  user_display_name = signal("")
  levelItems = signal<Array<LevelItem>>([])

  submitting = signal(false)

  materiasApproved = signal<Map<string, boolean>>(new Map())


  optionalCounter = signal<Map<OptionalContainer, boolean>>(new Map())
  materiaCounter = signal<Map<Materia, boolean>>( new Map())

  totalMaterias = signal(0)
  totalApprovedMaterias = signal(0)
  totalApprovedOptional = signal(0)

  constructor(
    private route:ActivatedRoute,
    private userPreferences:UserPreferencesService,
    private userLogin:UserLoginService,
    private businessService:BusinessService,
    private router:Router,
    private userLoginService:UserLoginService,
    public dialog: MatDialog
  ) { 

    this.organization_id = this.userPreferences.getCurrentOrganizationId()
    
    if( this.userLogin.hasRole("role-admin-" + this.organization_id) ){
      this.isAdmin = true
    }

    if(this.route.snapshot.paramMap.get('user_uid')){
      this.user_uid = this.route.snapshot.paramMap.get('user_uid')
    }
    if(this.route.snapshot.paramMap.get('career_id')){
      this.career_id = this.route.snapshot.paramMap.get('career_id')
    }    

    
  }
 

  ngOnInit(): void {
      let p = db.collection('careers').doc(this.career_id!).get().then( doc =>{
        let career = doc.data() as Career
        this.career.set(career)        
      }).then( ()=>{
        let career:Career = this.career()!
        return this.findMateriasApproved(career.cycles!)
      }).then( ()=>{
        this.update()
      })
  }

  update(){
    this.businessService.getUser(this.user_uid).then( user =>{
      this.user.set(user)

      this.user_display_name.set(this.userLoginService.getDisplayNameForUser(user))
    })    
  }


  findMateriasApproved( cycles:Cycle[]): Promise<void>{
    console.log("findMateriasApproved started")
    let materiasApproved:Map<string, boolean> = new Map()
    let transactions:Promise<any>[] = []

    cycles.forEach( cycle =>{
      cycle.objectives.forEach( objective =>{
        objective.semesters.forEach( semester =>{
          semester.materias.forEach( materia =>{

            if( materia.hasOwnProperty('materias') ){
              
              let optionalContainer:OptionalContainer = materia as OptionalContainer
              
              this.optionalCounter().set( optionalContainer, false )
              optionalContainer.materias.forEach( e =>{
                let t = this.businessService.getMateriaEnrollment( this.organization_id, e.id, this.user_uid! ).then( enrollment =>{
                  if( enrollment && enrollment.certificateUrl ){
                    materiasApproved.set( e.id, true)
                  }
                })
                transactions.push( t )
              })
            }
            else{
              this.materiaCounter().set( materia , false)
              let t = this.businessService.getMateriaEnrollment( this.organization_id, materia.id, this.user_uid! ).then( enrollment =>{
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
    console.log("waiting for enrollments to end")
    return Promise.all( transactions ).then( () =>{
      console.log("all enrollments processed")
      this.materiasApproved.set(materiasApproved)
      let optApproved = 0
      let keys = this.optionalCounter().keys()
      for (const item of keys) {
        console.log(item);
        let op = item as OptionalContainer
        if( this.isOptionalApproved(item))
          optApproved++;
      }
      let matApproved = 0
      let mkeys = this.materiaCounter().keys()
      for (const item of keys) {
        let materia = item as Materia
        if( this.materiasApproved().get( materia.id ) ){
          matApproved++;
        }
      };
      this.totalMaterias.set(this.optionalCounter().size + this.materiaCounter().size)
      this.totalApprovedMaterias.set(matApproved)
      this.totalApprovedOptional.set(optApproved)
    })
  }
  isOptionalApproved( op:OptionalContainer ){
    let approved = op.materias.find( e => this.materiasApproved().get(e.id))
    if( approved ){
      return true
    }
    else{
      return false
    }
  }  
  editOptionalMateria( om:OptionalContainer){

    let optionalContainerCopy:OptionalContainer = {
      id: om.id,
      label: om.label,
      materias: [...om.materias]
    }

    const dialogRef = this.dialog.open(OptionalContainerDialogComponent, {
      data: { 
        optionalContainer:optionalContainerCopy, 
        materiasApproved:this.materiasApproved(),
        isReadOnly:true
      }
    });
  
    dialogRef.afterClosed().subscribe(data => {
      console.log('The dialog was closed');
      if( this.isAdmin && data != null ){
          om.materias = [...data["optionalContainer"].materias]
      }
      else{
        console.debug("dialog was canceled")
      }
    });
  }   
}
