import { Component, OnInit } from '@angular/core';
import { BusinessService } from '../business.service';
import { UserLoginService } from '../user-login.service';

import { db } from 'src/environments/environment';
import { Career, copyObj, Exam, ExamGrade, Laboratory, LaboratoryGrade, Materia, MateriaEnrollment, LaboratoryGradeStatus, getLaboratoryStatusName, Organization } from '../exams/exams.module';
import { SortingService } from '../sorting.service';
import { ExamgradesReportComponent } from '../examgrades-report/examgrades-report.component';
import { ActivatedRoute, RouteConfigLoadEnd, Router } from '@angular/router';
import { UserPreferencesService } from '../user-preferences.service';
import { map, shareReplay } from 'rxjs/operators';
import * as uuid from 'uuid';
import { FormService } from '../form.service';
import { DateFormatService } from '../date-format.service';
import { Observable } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule       
  ],  
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );  

  submitting = false
  organization:Organization = null  

  constructor(
      private router: Router
    , private userLoginService:UserLoginService
    , private businessService:BusinessService
    , private dateFormatService:DateFormatService
    , private sortingService:SortingService
    , private userPreferencesService:UserPreferencesService
    , private examFormService:FormService
    , private breakpointObserver: BreakpointObserver) { 
        this.organization = userPreferencesService.getCurrentOrganization()
    }
  
  ngOnInit(): void {


  }

  isEmailVerified(): boolean{
    return this.userLoginService.getIsEmailVerified()
  }

  emailVerify(): void{
    this.userLoginService.sendEmailLink()
  }
  isLoggedIn() : boolean{
    return this.userLoginService.getIsloggedIn()
  }

  onEjecutanteDetalles(){
    const query = db.collection("careers")
    .where("isDeleted","==",false)
    .where("organization_id","==",this.organization.id)
    .where("career_name","==","Ejecutante")
    
    this.submitting = true
    query.get().then( resultSet =>{
      this.submitting = false
      resultSet.docs.map( doc =>{
        let career = doc.data() as Career        
        this.router.navigate(['/career-edit',{id:career.id }]);
      })
    })

  }
  onCoreografoDetalles(){
    const query = db.collection("careers")
    .where("isDeleted","==",false)
    .where("organization_id","==",this.organization.id)
    .where("career_name","==","Coreógrafo y Docente")
    
    this.submitting = true
    query.get().then( resultSet =>{
      this.submitting = false
      resultSet.docs.map( doc =>{
        let career = doc.data() as Career        
        this.router.navigate(['/career-edit',{id:career.id }]);
      })
    })
  }
  register(){
    this.router.navigate(['/loginForm',{"isRegister":true}])
  }  
  onEmail(){
    window.location.href = "mailto:rsharkimonterrey@yahoo.com.mx?subject=Solicito%20informacion&body=Saludos";
  }
  

  onFacebook(){
    window.location.href="https://www.facebook.com/raxacademy";
  }
  onInstagram(){
    window.location.href="https://www.instagram.com/raksharkimty";
  }
}
