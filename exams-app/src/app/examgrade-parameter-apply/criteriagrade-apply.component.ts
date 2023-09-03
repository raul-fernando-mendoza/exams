import { Component, Input, OnDestroy, OnInit, Output , EventEmitter} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserPreferencesService } from '../user-preferences.service';
import { UserLoginService } from '../user-login.service';
import { db } from 'src/environments/environment';
import { AspectGrade, CriteriaGrade } from '../exams/exams.module';
import { AspectGradeStartsApplyChange } from './aspectgrade-stars-apply.component';


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

  criteriaGrade:CriteriaGrade
  aspectGrades:AspectGrade[] = []
  
  

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
      this.criteriaGrade = doc.data() as CriteriaGrade
      this.loadAspects()
    },
    reason =>{
      alert("Error reading parameter:" + reason)
    } )     
  }
  loadAspects(){
    db.collection(this.collection + "/" + this.criteriaGrade_id + "/aspectGrades").get().then( set =>{
      this.aspectGrades.length = 0
      set.docs.map( doc =>{
          let aspectGrade:AspectGrade = doc.data() as AspectGrade
          this.aspectGrades.push(aspectGrade)
      })
      this.aspectGrades.sort( (a, b) =>{ 
        if(a.idx > b.idx){
          return 1
        }
        else{
          return -1
        }
      })
    },
    reason =>{
        alert("Error reading aspect list" + reason)
    })    
  }
  onAspectGradeChange(e:AspectGradeStartsApplyChange){
    e.aspectGrade_id

    //update the criteria in memory with the new earnedPoint
    for(let i=0; i<this.aspectGrades.length; i++){
      if( this.aspectGrades[i].id == e.aspectGrade_id ){
        this.aspectGrades[i].score = e.change.score
      }
    }    
    //calculate the new earnedPoint and availablePoints and score for criteria.
    this.criteriaGrade.availablePoints = this.aspectGrades.length
    this.criteriaGrade.earnedPoints = 0
    for(let i=0; i<this.aspectGrades.length; i++){
      this.criteriaGrade.earnedPoints += this.aspectGrades[i].score
    }
    this.criteriaGrade.score = this.criteriaGrade.earnedPoints / this.criteriaGrade.availablePoints
    var values:CriteriaGradeApplyChange = {
      change: {
        score: this.criteriaGrade.score,
        availablePoints: this.criteriaGrade.availablePoints,
        earnedPoints: this.criteriaGrade.earnedPoints
      },
      criteriaGradeGrade_id: this.criteriaGrade_id
    }
    var thiz = this
    
    db.collection(this.collection).doc(this.criteriaGrade_id).update( values.change ).then( () =>{
      console.log("criteria updated")
      thiz.change.emit(values)
    })
    
  }  
}
