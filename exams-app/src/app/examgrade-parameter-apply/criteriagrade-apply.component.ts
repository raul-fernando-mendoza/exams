import { Component, Input, OnDestroy, OnInit, Output , EventEmitter, signal} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserPreferencesService } from '../user-preferences.service';
import { UserLoginService } from '../user-login.service';
import { db } from 'src/environments/environment';
import { AspectGrade, CriteriaGrade } from '../exams/exams.module';
import { AspectGradeStarsApplyComponent, AspectGradeStartsApplyChange } from './aspectgrade-stars-apply.component';

import { CommonModule } from '@angular/common';
import { AspectGradeItemsApplyComponent } from './aspectgrade-items-apply.component';

export class CriteriaGradeApplyChange{
  criteriaGradeGrade_id:string
  change:{
    score:number
    earnedPoints:number
    availablePoints:number
  }
}

@Component({
  selector: 'criteriagrade-apply',
  standalone: true,
  imports: [
    CommonModule 
    ,AspectGradeStarsApplyComponent
    ,AspectGradeItemsApplyComponent
  ],  
  templateUrl: './criteriagrade-apply.component.html',
  styleUrls: ['./criteriagrade-apply.component.css']
})
export class CriteriaGradeApplyComponent implements OnInit, OnDestroy {

  organization_id:string
  isAdmin:boolean
  
  @Input() collection:string
  @Input() criteriaGrade_id:string
  @Input() scoreType:string
  @Input() disabled:boolean
  @Output() change = new EventEmitter<CriteriaGradeApplyChange>();

  criteriaGrade = signal<CriteriaGrade|null>(null)
  aspectGrades = signal<AspectGrade[]>([])
  
  

  constructor(
    private activatedRoute: ActivatedRoute 
    ,private userPreferencesService: UserPreferencesService
    ,private userLoginService:UserLoginService
    ){ 
    this.organization_id = this.userPreferencesService.getCurrentOrganizationId()
    this.isAdmin = this.userLoginService.hasRole("role-admin-" + this.organization_id)
  }
  ngOnDestroy(): void {
  
  }

  ngOnInit(): void {
    this.update()
  }
  update(){
    db.collection(this.collection).doc(this.criteriaGrade_id).get().then( doc =>{
      this.criteriaGrade.set(doc.data() as CriteriaGrade) 
      this.loadAspects()
    },
    reason =>{
      alert("Error reading parameter:" + reason)
    } )     
  }
  loadAspects(){
    let newAspectGrades = new Array<AspectGrade>()
    db.collection(this.collection + "/" + this.criteriaGrade_id + "/aspectGrades").get().then( set =>{

      set.docs.map( doc =>{
          let aspectGrade:AspectGrade = doc.data() as AspectGrade
          newAspectGrades.push(aspectGrade)
      })
      newAspectGrades.sort( (a, b) =>{ 
        if(a.idx > b.idx){
          return 1
        }
        else{
          return -1
        }
      })
      this.aspectGrades.set(newAspectGrades)
    },
    reason =>{
        alert("Error reading aspect list" + reason)
    })    
  }
  onAspectGradeChange(e:AspectGradeStartsApplyChange){
    e.aspectGrade_id

    //update the criteria in memory with the new earnedPoint
    for(let i=0; i<this.aspectGrades().length; i++){
      if( this.aspectGrades()[i].id == e.aspectGrade_id ){
        this.aspectGrades()[i].score = e.change.score
      }
    }    
    //calculate the new earnedPoint and availablePoints and score for criteria.
    this.criteriaGrade().availablePoints = this.aspectGrades().length
    this.criteriaGrade().earnedPoints = 0
    for(let i=0; i<this.aspectGrades().length; i++){
      this.criteriaGrade().earnedPoints += this.aspectGrades()[i].score
    }
    this.criteriaGrade().score = Number(( (this.criteriaGrade().earnedPoints/this.criteriaGrade().availablePoints) * 10).toFixed(1))
    var values:CriteriaGradeApplyChange = {
      change: {
        score: this.criteriaGrade().score,
        availablePoints: this.criteriaGrade().availablePoints,
        earnedPoints: this.criteriaGrade().earnedPoints
      },
      criteriaGradeGrade_id: this.criteriaGrade_id
    }
    var thiz = this
    
    db.collection(this.collection).doc(this.criteriaGrade_id).update( values.change ).then( () =>{
      console.log("criteria updated")
      thiz.change.emit(values)
    },
    reason =>{
      console.log("ERROR:updating criteria")
    })
    
  }  
}
