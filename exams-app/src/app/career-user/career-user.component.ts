import { Component, Input, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserPreferencesService } from '../user-preferences.service';
import { db } from 'src/environments/environment';
import { Career, Group, GroupGrade, Level, Materia, MateriaEnrollment } from '../exams/exams.module';
import { UserLoginService } from '../user-login.service';
import { ExamenImprovisacionFormComponent } from '../examen-improvisacion-form/examen-improvisacion-form.component';
import { BusinessService } from '../business.service';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';

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
  ],   
  templateUrl: './career-user.component.html',
  styleUrls: ['./career-user.component.css']
})
export class CareerUserComponent {
  
  @Input() career:Career
  @Input() useruid:string
  user_displayName:string
  organization_id:string

  isAdmin:boolean = false

  constructor(
    private userPreferences:UserPreferencesService,
    private userLogin:UserLoginService,
  ) { 

    this.organization_id = this.userPreferences.getCurrentOrganizationId()
    
    if( this.userLogin.hasRole("role-admin-" + this.organization_id) ){
      this.isAdmin = true
    }
  }



}
