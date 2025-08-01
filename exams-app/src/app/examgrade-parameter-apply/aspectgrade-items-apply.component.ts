import { Component, Input, EventEmitter, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { UserPreferencesService } from '../user-preferences.service';
import { UserLoginService } from '../user-login.service';
import { db } from 'src/environments/environment';
import { AspectGrade } from '../exams/exams.module';
import { DescriptionApplyDialog } from './description-apply-dlg';
import { MatDialog  } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

export class AspectGradeItemsApplyChange{
  aspectGrade_id:string
  change:{
    isGraded:boolean
    score:number
    missingElements:string
  }
  
}

@Component({
  selector: 'aspectgrade-items-apply',
  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule   
    ,FormsModule
    ,ReactiveFormsModule
    ,MatFormFieldModule
    ,MatInputModule 
    ,MatButtonToggleModule
  ],   
  templateUrl: './aspectgrade-items-apply.component.html',
  styleUrls: ['./aspectgrade-items-apply.component.css']
})
export class AspectGradeItemsApplyComponent implements OnInit, OnDestroy {

  organization_id:string
  isAdmin:boolean
  
  @Input() collection:string
  @Input() aspectGrade_id:string
  @Input() disabled:boolean = false
  @Output() changeGrade = new EventEmitter<AspectGradeItemsApplyChange>();
  aspectGrade = signal<AspectGrade | null>(null)
  aspectGradeForm
  
  unsubscribe

  constructor(
     private userPreferencesService: UserPreferencesService
    ,private userLoginService:UserLoginService
    ,public dialog: MatDialog
    ,private fb: FormBuilder    
    ){ 
    this.organization_id = this.userPreferencesService.getCurrentOrganizationId()
    this.isAdmin = this.userLoginService.hasRole("role-admin-" + this.organization_id)
  }
  ngOnDestroy(): void {
    if(this.unsubscribe){
      this.unsubscribe()
    }
  }

  ngOnInit(): void {
    this.update()
  }
  nvl(val1, val2){
    if( val1 != undefined && val1 != null){
      return val1
    }
    else{
      return val2
    }
  }    
  update(){
    this.unsubscribe = db.collection(this.collection).doc(this.aspectGrade_id).onSnapshot( doc =>{
      let newAspectGrade = doc.data() as AspectGrade
      this.aspectGradeForm = this.fb.group({
        score:[{ value:String(this.nvl(newAspectGrade.score,"1")), disabled:this.disabled}],
        missingElements:[{ value:this.nvl(newAspectGrade.missingElements,""), disabled:this.disabled}]
      })  
      this.aspectGrade.set( newAspectGrade )      
    },
    reason =>{
      alert("Error reading parameter:" + reason)
    } )     
  }
  showText(str){
    const dialogRef = this.dialog.open(DescriptionApplyDialog, {
      width: '250px',
      data: { description: str}
    });    
  }  
  onChangeAspect(){
    if( !this.disabled ){
      let values:AspectGradeItemsApplyChange = {
        aspectGrade_id:this.aspectGrade_id,
        change:{
          isGraded: true,
          score: Number(this.aspectGradeForm.controls.score.value),
          missingElements: this.aspectGradeForm.controls.missingElements.value
        }
      }    
      db.collection(this.collection).doc(this.aspectGrade_id).update(values.change).then( 
        () =>{
          console.debug("aspect updated:" + values.change.score)
          this.changeGrade.emit( values )
        },
        reason =>{
          alert("error updating aspect:" + reason )
        }
      ) 
    } 
  }    
}
