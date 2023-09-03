import { Component, Input, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { UserPreferencesService } from '../user-preferences.service';
import { UserLoginService } from '../user-login.service';
import { db } from 'src/environments/environment';
import { AspectGrade } from '../exams/exams.module';
import { DescriptionApplyDialog } from './description-apply-dlg';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';

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
  aspectGrade:AspectGrade
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
      this.aspectGrade = doc.data() as AspectGrade

      
      this.aspectGradeForm = this.fb.group({
        score:[{ value:String(this.nvl(this.aspectGrade.score,"1")), disabled:this.disabled}],
        missingElements:[{ value:this.nvl(this.aspectGrade.missingElements,""), disabled:this.disabled}]
      })        
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
