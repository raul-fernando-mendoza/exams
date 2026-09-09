import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserPreferencesService } from '../user-preferences.service';
import { UserLoginService } from '../user-login.service';
import { db } from 'src/environments/environment';
import { CriteriaGrade, ParameterGrade, User } from '../exams/exams.module';
import { CriteriaGradeApplyChange, CriteriaGradeApplyComponent } from './criteriagrade-apply.component';
import { MatDialog, MatDialogModule  } from '@angular/material/dialog';
import { ParameterGradeCommentDialog } from './parameterGrade-comment-dlg';
import { BusinessService } from '../business.service';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {MatGridListModule} from '@angular/material/grid-list';

import { FormsModule, ReactiveFormsModule,FormBuilder, } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

export class ParameterGradeApplyChange{
  parameterGradeGrade_id:string
  change:{
    score?:number
    earnedPoints?:number
    availablePoints?:number
    isCompleted?:boolean
  }
}

@Component({
  selector: 'parametergrade-apply',
  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule       
    ,MatGridListModule
    ,CriteriaGradeApplyComponent

    ,FormsModule
    ,ReactiveFormsModule
    ,MatFormFieldModule
    ,MatInputModule
    ,MatSelectModule     

    ,MatDialogModule     
  ],    
  templateUrl: './parametergrade-apply.component.html',
  styleUrls: ['./parametergrade-apply.component.css']
})
export class ParameterGradeApplyComponent implements OnInit, OnDestroy {

  organization_id:string
  isAdmin:boolean
  isDisabled = false
  submitting = false  
  
  @Input() collection!:string
  @Input() parameterGrade_id!:string
  @Output() change=new EventEmitter<ParameterGradeApplyChange>()
  examGrade_id!:string
  parameterGrade = signal<ParameterGrade|null>(null)
  evaluators = signal<Array<User>>([])
  parameterGradeDisplayName = signal<string>("")

  criteriaGrades = signal<CriteriaGrade[]>([])

  commentCharacterLimit = 200

  fg = this.fb.group({
    evaluator_uid:[""],
    evaluator_comment:[""]
  })

  constructor(
    private activatedRoute: ActivatedRoute 
    ,private userPreferencesService: UserPreferencesService
    ,private userLoginService:UserLoginService
    ,public dialog: MatDialog
    ,private businessService: BusinessService
    ,private router:Router    
    ,private fb: FormBuilder
    ){ 
    this.organization_id = this.userPreferencesService.getCurrentOrganizationId()
    this.isAdmin = this.userLoginService.hasRole("role-admin-" + this.organization_id)
  }
  ngOnDestroy(): void {
  }

  ngOnInit(): void {
    this.examGrade_id = this.collection.split("/").reverse()[1]



    db.collection(this.collection).doc(this.parameterGrade_id).get().then( doc =>{
      this.parameterGrade.set(doc.data() as ParameterGrade)
      this.fg.controls.evaluator_comment.setValue( this.parameterGrade().evaluator_comment || "" )

      this.userLoginService.getUserIdToken().then( token => {
        this.businessService.getEvaluators(this.organization_id, token).then( evaluators =>{
          this.evaluators.set(evaluators)        
          if( this.parameterGrade() ){
            let parameterGrade:ParameterGrade = this.parameterGrade()!
            if( parameterGrade.evaluator_uid ){
              let evaluator_uid:string = parameterGrade.evaluator_uid
              this.fg.controls.evaluator_uid.setValue( evaluator_uid )
              this.parameterGradeDisplayName.set( this.evaluators().find( e => e.uid == evaluator_uid)?.displayName || "" )
            }            
          }        
        })
      })      

      this.loadCriterias()
    },
    reason =>{
      alert("Error reading parameter:" + reason)
    })
    
  }
  loadCriterias(){
    let newCriteriaGrades:Array<CriteriaGrade> = new Array<CriteriaGrade>()
    db.collection(this.collection + "/" + this.parameterGrade_id + "/criteriaGrades").get().then( set =>{
      set.docs.map( doc =>{
          let criteriaGrade:CriteriaGrade = doc.data() as CriteriaGrade
          newCriteriaGrades.push(criteriaGrade)
      })
      this.criteriaGrades.set( newCriteriaGrades )
      this.onInitializedEarnedPoints()
      this.criteriaGrades().sort( (a, b) =>{ 
        if(a.idx > b.idx){
          return 1
        }
        else{
          return -1
        }
      })
      this.criteriaGrades.set( newCriteriaGrades )
    },
    reason =>{
        alert("Error reading criteria list" + reason)
    })    
  }

  onInitializedEarnedPoints(){
    this.parameterGrade().earnedPoints = 0
    this.parameterGrade().availablePoints = 0    
    for(let i=0; i<this.criteriaGrades().length; i++){
      this.parameterGrade().availablePoints += this.criteriaGrades()[i].availablePoints
      this.parameterGrade().earnedPoints += this.criteriaGrades()[i].earnedPoints
    }
    //recalculate parameter score
    this.parameterGrade().score =  Number(( (this.parameterGrade().earnedPoints/this.parameterGrade().availablePoints) * 10).toFixed(1))
  }  
  onCriteriaGradeChange(e:CriteriaGradeApplyChange){
    this.parameterGrade().earnedPoints = 0
    this.parameterGrade().availablePoints = 0

    
    for(let i=0; i<this.criteriaGrades().length; i++){
      if( this.criteriaGrades()[i].id == e.criteriaGradeGrade_id ){
        this.criteriaGrades()[i].score = e.change.score
        this.criteriaGrades()[i].earnedPoints = e.change.earnedPoints
        this.criteriaGrades()[i].availablePoints = e.change.availablePoints
      }
      this.parameterGrade().availablePoints += this.criteriaGrades()[i].availablePoints
      this.parameterGrade().earnedPoints += this.criteriaGrades()[i].earnedPoints
    }
    //recalculate parameter score
    this.parameterGrade().score =  Number((this.parameterGrade().earnedPoints/this.parameterGrade().availablePoints * 10).toFixed(1))
  }
  submit(){

    let values:ParameterGradeApplyChange = {
      parameterGradeGrade_id: this.parameterGrade_id,
      change: {
        score: this.parameterGrade().score,
        earnedPoints: this.parameterGrade().earnedPoints,
        availablePoints: this.parameterGrade().availablePoints,
        isCompleted:true
      }
    }
    
    db.collection(this.collection).doc(this.parameterGrade_id).update( values.change  ).then( () =>{
      console.log("updated parameterGrade")
      this.openCommentDialog()
    },
    reason =>{
      alert("ERROR saving parameter update:" + reason )
    })    
    
  }
  openCommentDialog(){
    console.log("openCommentDialog")

    

    const dialogRef = this.dialog.open(ParameterGradeCommentDialog, {
      width: '250px',
      data: {
        calificacion:this.parameterGrade().score ? this.parameterGrade().score : 1, 
        comentario: this.parameterGrade().evaluator_comment ? this.parameterGrade().evaluator_comment : "",
        collection: this.collection,
        id: this.parameterGrade_id,
        property: "commentSound"
      }
      
    });

    var thiz = this

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if( result != undefined ){
        db.collection(this.collection).doc(this.parameterGrade_id).update( { "evaluator_comment":result } ).then( 
          () =>{
            let values:ParameterGradeApplyChange = {
              parameterGradeGrade_id: this.parameterGrade_id,
              change: {
                isCompleted:true
              }            
            }  
            thiz.change.emit( values )        
          },
          reason=>{
            alert("ERROR saving comment" + reason)
          }
        )        
      }
    });
  }
  onEditParameterGrade(){
    this.submitting = true
    this.newVersionExamGrade( this.examGrade_id, this.parameterGrade_id, this.parameterGrade().version).then( 
      parameterGrade =>{
        this.submitting = false
        this.router.navigate(['/examGrade-parameterGrade-apply',{examGrade_id:this.examGrade_id,parameterGrade_id:parameterGrade.id}]);
      },
      reason=>{
        this.submitting = false
        alert("ERROR creating new version of exam" + reason.toString())
      }
    )
  }  

  newVersionExamGrade(examGrade_id, parameterGrade_id, version):Promise<ParameterGrade>{
    var _resolve
    var _reject
    return new Promise<null>((resolve, reject)=>{
      _resolve = resolve
      _reject = reject

      if( examGrade_id == null || parameterGrade_id == null){
        reject(null)
      }
      var req = {
        "collectionPath":"examGrades/" + this.examGrade_id + "/parameterGrades",
        "id":this.parameterGrade_id,
        "versionKey":"version",
        "isCurrentVersionKey":"isCurrentVersion",
        "updateOnKey":"updated_on",
        "newValues":{
          "isCompleted":false
        },          
        "options":{}                                            
      }
      var options = {
        exceptions:[]
      }
      this.userLoginService.getUserIdToken().then( token => {
        this.businessService.firestoreApiInterface("createDocumentNewVersion", token, req, options).subscribe(
          {
            next(data){ 
              var parameterGrade:ParameterGrade = data["result"] as ParameterGrade
              //now update the examGrade updated_on

              db.collection("examGrades/").doc(examGrade_id).update({"updated_on": new Date()}).then(
                ()=>{
                  console.log("examgrade has been updated for updated_on")
                  _resolve(parameterGrade)
                },
                reason=>{
                  alert("Error updating old version:" + reason)
                }
              ) 
            },   
            error(reason){  
              alert( "ERROR: duplicando examen:" + JSON.stringify(reason))
              _reject()
            },
            complete(){
              console.log("never called")
            }
          }
        )
      },
      error => {
        alert("Error in token:" + error.errorCode + " " + error.errorMessage)
      }) 
    }) 
        
  }  
  onCommentChange(){
    let comment:string = this.fg.controls.evaluator_comment.value || ""
    comment = comment.slice(0, this.commentCharacterLimit)

    // keep the in-memory parameterGrade in sync so a later submit (and its
    // post-submit comment dialog) doesn't overwrite this with a stale value
    this.parameterGrade().evaluator_comment = comment ? comment : null

    db.collection(this.collection).doc(this.parameterGrade_id).update( { "evaluator_comment": comment ? comment : null } ).then( () =>{
      console.log("updated evaluator_comment")
    },
    reason =>{
      alert("ERROR saving comment:" + reason )
    })
  }

  evaluatorChange(event) {
    var evaluatorId = event.value

    let parameterGrade:ParameterGrade = {
      evaluator_uid: evaluatorId,
      evaluator: this.evaluators().find( e => e.uid == evaluatorId)
    }
    
    db.collection(this.collection).doc(this.parameterGrade_id).update( parameterGrade  ).then( () =>{
      console.log("updated evaluator")
      this.updateExamGradeEvaluators()
    },
    reason =>{
      alert("ERROR saving parameter update:" + reason )
    })      
  }  

  private updateExamGradeEvaluators() {
    db.collection("examGrades/" + this.examGrade_id + "/parameterGrades").get().then( snapshot => {
      let evaluatorUids: string[] = []
      snapshot.docs.forEach( doc => {
        const pg = doc.data() as ParameterGrade
        if (pg.evaluator_uid) {
          evaluatorUids.push(pg.evaluator_uid)
        }
      })
      // Remove duplicates
      const uniqueEvaluators = [...new Set(evaluatorUids)]
      // Update examGrade
      db.collection("examGrades").doc(this.examGrade_id).update({ evaluators: uniqueEvaluators }).then(
        () => console.log("ExamGrade evaluators updated"),
        reason => alert("ERROR updating examGrade evaluators: " + reason)
      )
    })
  }
}
