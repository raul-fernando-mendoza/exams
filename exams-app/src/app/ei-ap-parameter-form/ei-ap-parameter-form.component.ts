import { Component, OnInit, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormArray, Validators, FormControl } from '@angular/forms';
import { ExamenesImprovisacionService} from '../examenes-improvisacion.service'
import { ActivatedRoute, Route, Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { UserLoginService } from '../user-login.service';
import {  AspectGrade,  AspectGradeRequest,  AspectRequest,  copyObj,  CriteriaGrade, ExamGrade, ExamGradeRequest, Materia, ParameterGrade, ParameterGradeRequest, User } from '../exams/exams.module';

import { db } from 'src/environments/environment';
import { NavigationService } from '../navigation.service';
import { UserPreferencesService } from '../user-preferences.service';
import { DateFormatService } from '../date-format.service';

export interface DialogData {
  calificacion: number,
  comentario: string,
  collection:string,
  id:string,
  property:string
}

export interface DescriptionDlgData {
  description: string
}

@Component({
  selector: 'app-ei-ap-parameter-form',
  templateUrl: './ei-ap-parameter-form.component.html',
  styleUrls: ['./ei-ap-parameter-form.component.css']
})



export class EiApParameterFormComponent implements OnInit {

  constructor(private fb: UntypedFormBuilder
    , private activatedRoute: ActivatedRoute
    , private examImprovisacionService: ExamenesImprovisacionService
    , private userPreferencesService: UserPreferencesService
    , public dialog: MatDialog
    , private userLoginService:UserLoginService
    , private navigation: NavigationService
    , private router:Router
    ,private  dateFormatService:DateFormatService) { 

      this.organization_id = this.userPreferencesService.getCurrentOrganizationId()
      this.isAdmin = this.userLoginService.hasRole("role-admin-" + this.organization_id)
      /*
      this.examGrade_id = this.activatedRoute.snapshot.paramMap.get('examGrade_id')
      this.parameterGrade_id =this.activatedRoute.snapshot.paramMap.get('parameterGrade_id')
      this.collection = "examGrades/" + this.examGrade_id + "/parameterGrades" 
      */
            
      var thiz = this
      this.activatedRoute.paramMap.subscribe( {
        next(paramMap){
          thiz.examGrade_id = paramMap.get('examGrade_id')
          thiz.parameterGrade_id = paramMap.get('parameterGrade_id')
          thiz.collection = "examGrades/" + thiz.examGrade_id + "/parameterGrades" 

          thiz.update()
        }
      })
      
    }
  
  examGrade_id = null
  parameterGrade_id = null  

  examGradeFG=null

  examGrade:ExamGrade = null
  parameterGrade:ParameterGrade=null
  
  submitting = false

  isDisabled = false
  organization_id = null
  isAdmin = false

  collection:string = null

  nvl(val1, val2){
    if( val1 != undefined && val1 != null){
      return val1
    }
    else{
      return val2
    }
  }

  getFormGroupArray (fg:UntypedFormGroup, controlname:string): UntypedFormGroup[] {
    if( fg == null){
      console.error("ERROR controls for " + controlname + " in " + fg)
    }
    var fa:UntypedFormArray =  fg.controls[controlname] as UntypedFormArray
    if( fa == null){
      console.error("I can not find controls for:" + controlname)
    }
    return fa.controls as UntypedFormGroup[]
  }

  ngOnInit(): void {
    //this.update()
  }  

  update(){
    db.collection("examGrades").doc(this.examGrade_id).get().then( doc => {
      this.examGrade = doc.data() as ExamGrade

      let dateStr = this.dateFormatService.formatDate( ((this.examGrade.applicationDate) as any).toDate() )

      this.examGradeFG =  this.fb.group({
        id: [this.examGrade.id],
        organization_id: [this.organization_id],
        exam_id:[this.examGrade.exam_id], 
     
        isCompleted: [this.examGrade.isCompleted],
        applicationDate:[dateStr],
    
        student_uid:[this.examGrade.student_uid, Validators.required],
        student_name:[null],

        materia_id:[this.examGrade.materia_id, Validators.required],
        materia_name:[null],        
    
    
        title: [{value:this.examGrade.title,disabled:!this.isAdmin}],
        expression: [this.examGrade.expression],
        level:[this.examGrade.level],
        score:[this.examGrade.score],
        isApproved:[this.examGrade.isApproved],
        
        parameterGrades: new UntypedFormArray([])        
      })

      var userReq = {
        "uid":doc.data().student_uid
      }      
    
      this.examImprovisacionService.authApiInterface("getUser", null, userReq).then( response =>{
        const user = response["result"]
        let student_name = (user["displayName"] != null && user["displayName"] != '') ? user["displayName"] : user["email"]
        this.examGradeFG.controls.student_name.setValue(student_name)
      })
 
      db.collection("materias").doc(doc.data().materia_id).get().then( doc => {
        this.examGradeFG.controls.materia_name.setValue(  doc.data().materia_name )
      })
      this.addParameterGrades(doc.data().id, this.examGradeFG.controls.parameterGrades )
    },
    reason=>{
      alert("ERROR reading exam parameter:" + reason.toString())
    })

  }
  addParameterGrades( examGrade_id:string, parameterGrades:UntypedFormArray):Promise<void>{
    var _resolve
    return new Promise<void>((resolve, reject) =>{
      _resolve = resolve
      db.collection(`examGrades/${examGrade_id}/parameterGrades`).doc(this.parameterGrade_id).get().then( doc =>{
        this.parameterGrade = doc.data() as ParameterGrade

        if(this.parameterGrade.isCompleted == true){
          this.isDisabled = true
        }
        else{
          this.isDisabled = false
        }

        var g = this.fb.group({
          id:[this.parameterGrade.id],
          organization_id:[this.organization_id],
          idx:[this.parameterGrade.idx],
          label:[this.parameterGrade.label],
          description:[this.parameterGrade.description],
          scoreType:[this.parameterGrade.scoreType],
          score:[{value:this.parameterGrade.score, disable: !this.isAdmin}],
          evaluator_uid:[this.parameterGrade.evaluator_uid],
          evaluator_name:[null],
          evaluator_comment:[this.parameterGrade.evaluator_comment],
          isCompleted:[this.parameterGrade.isCompleted],
          commentSoundUrl:[this.parameterGrade.commentSoundUrl],
          criteriaGrades: new UntypedFormArray([])
        })

        var userReq = {
          "uid":this.parameterGrade.evaluator_uid
        }      
      
        this.examImprovisacionService.authApiInterface("getUser", null, userReq).then( response =>{
          const user = response["result"]
          let user_displayName = (user["displayName"] != null && user["displayName"] != '') ? user["displayName"] : user["email"]
          g.controls.evaluator_name.setValue(user_displayName)
        })

        parameterGrades.push(g)
        this.addCriteriaGrades(examGrade_id, this.parameterGrade.id, g.controls.criteriaGrades as UntypedFormArray).then( () =>{
          parameterGrades.controls.sort( (a, b)=>{
            if( a.get("idx").value > b.get("idx").value )
              return 1
            else return -1
          })
          _resolve()
        })
      })
    })

  } 

  addCriteriaGrades(examGrade_id:string, parameterGrade_id:string, criteriaGrades:UntypedFormArray):Promise<void>{
    var _resolve 
    return new Promise<void>((resolve, reject) =>{
      _resolve = resolve
      db.collection(`examGrades/${examGrade_id}/parameterGrades/${parameterGrade_id}/criteriaGrades`).get().then( set =>{
        var map = set.docs.map( doc =>{
          let c = doc.data()
          var g = this.fb.group({
            id:[c.id],
            idx:[c.idx],
            label:[c.label],
            description:[c.description],
            score:[c.score],
            isSelected:[ c.isSelected ],
  
            aspectGrades: new UntypedFormArray([])
          })
  
          criteriaGrades.push(g)
          return this.addAspectGrades(examGrade_id, parameterGrade_id, doc.data().id, g.controls.aspectGrades as UntypedFormArray)
        })
        Promise.all(map).then( () => {
          criteriaGrades.controls.sort( (a, b)=>{
            if( a.get("idx").value > b.get("idx").value )
              return 1
            else return -1
          })          
          _resolve()
        })        
      },
      reason =>{
        console.error("ERROR loading criteria:" + reason)
      })
    })
    
  } 

  addAspectGrades(examGrade_id:string, parameterGrade_id:string, criteriaGrades_id:string, aspectGrades:UntypedFormArray):Promise<void>{
    return new Promise((resolve, reject)=>{
      db.collection(`examGrades/${examGrade_id}/parameterGrades/${parameterGrade_id}/criteriaGrades/${criteriaGrades_id}/aspectGrades`).get().then( set =>{
        var map = set.docs.map( doc =>{
          let a = doc.data()
          var g = this.fb.group({
            id:[a.id],
            idx:[a.idx],
            label:[a.label],
            description:[a.description],
            isGraded:[this.nvl(a.isGraded, false)],
            score:[{ value:String(this.nvl(a.score,"1")), disabled:this.isDisabled}],
            missingElements:[{ value:this.nvl(a.missingElements,""), disabled:this.isDisabled}]
          })
          aspectGrades.push(g)
        })
        aspectGrades.controls.sort( (a, b)=>{
          if( a.get("idx").value > b.get("idx").value )
            return 1
          else return -1
        })          
        resolve()
      })  
    })
  } 

    
    
  onChangeAspect(e:UntypedFormGroup, p:UntypedFormGroup, c:UntypedFormGroup, a:UntypedFormGroup){

    let examGrade_id = e.controls.id.value
    let parameterGrade_id = p.controls.id.value
    let criteriaGrades_id = c.controls.id.value
    let aspectGrades_id = a.controls.id.value

    let values = {
      id:a.controls.id.value,
      isGraded:a.controls.isGraded.value,
      score:Number(a.controls.score.value),
      missingElements:a.controls.missingElements.value
    }    

    db.collection(`examGrades/${examGrade_id}/parameterGrades/${parameterGrade_id}/criteriaGrades/${criteriaGrades_id}/aspectGrades`).doc(aspectGrades_id).update(values).then( 
      doc =>{
        console.debug("aspect updated:" + doc)
      },
      reason =>{
        console.log("error updating aspect:" + reason )
      })
  }

  onChangeStarts(e:UntypedFormGroup, p:UntypedFormGroup, c:UntypedFormGroup, a:UntypedFormGroup){

    let examGrade_id = e.controls.id.value
    let parameterGrade_id = p.controls.id.value
    let criteriaGrades_id = c.controls.id.value
    let aspectGrades_id = a.controls.id.value

    let values = {
      isGraded:true,
      score:Number(a.controls.score.value)
    }    

    db.collection(`examGrades/${examGrade_id}/parameterGrades/${parameterGrade_id}/criteriaGrades/${criteriaGrades_id}/aspectGrades`).doc(aspectGrades_id).update(values).then( 
      doc =>{
        console.debug("aspect updated:" + doc)
      },
      reason =>{
        console.log("error updating aspect:" + reason )
      })    
  }
  submit(){
    console.log("submit called")
    this.submitting = true
    this.updateScore()
    this.updateExamGrade().then(()=>{
      this.openCommentDialog()
    })
    
  }
  
  updateScore(){
    console.log("update score")
    var totalPoints:number= 0;
    var earnedPoints:number = 0;
    var finalScore:number = 0;
    let parameterGrades_array:UntypedFormArray = this.examGradeFG.controls.parameterGrades as UntypedFormArray
    let parameterGrade:UntypedFormGroup = parameterGrades_array.controls[0] as UntypedFormGroup
    let criteriaGrades_array = parameterGrade.controls.criteriaGrades as UntypedFormArray
    for( var i =0; i<criteriaGrades_array.controls.length; i++){
      let criteriaGrade:UntypedFormGroup = criteriaGrades_array.controls[i] as UntypedFormGroup
      if( criteriaGrade.controls.isSelected.value == true ){
        let aspectGrade_array:UntypedFormArray = criteriaGrade.controls.aspectGrades as UntypedFormArray
        for( var j=0; j<aspectGrade_array.controls.length; j++){
          totalPoints = totalPoints + 1
          let aspectGrade:UntypedFormGroup = aspectGrade_array.controls[j] as UntypedFormGroup
          earnedPoints = earnedPoints + Number(aspectGrade.controls.score.value)
        }
      }
    }
    finalScore = Number( ((earnedPoints / totalPoints) * 10 ).toFixed(2) )
    parameterGrade.controls.score.setValue( finalScore ) 
    if( finalScore > 7 ){
      this.examGradeFG.controls.isApproved.setValue( true )
    }  
  }


  openCommentDialog(){
    console.log("openCommentDialog")
    var parameterGrades_array:UntypedFormArray = this.examGradeFG.controls.parameterGrades as UntypedFormArray
    var parameterGrade:UntypedFormGroup = parameterGrades_array.controls[0] as UntypedFormGroup

    var calificacion = parameterGrade.controls.score.value

    let comentario = parameterGrade.controls.evaluator_comment.value ? parameterGrade.controls.evaluator_comment.value: ""

    const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      width: '250px',
      data: {
        calificacion:calificacion, 
        comentario: comentario,
        collection: this.collection,
        id: this.parameterGrade_id,
        property: "commentSound"
      }
      
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if( result != undefined ){
        var parameterGrades_array = this.examGradeFG.controls.parameterGrades as UntypedFormArray
        var parameterGrade:UntypedFormGroup = parameterGrades_array.controls[0] as UntypedFormGroup
        parameterGrade.controls.evaluator_comment.setValue(result) 
        this.updateComment( this.examGradeFG, parameterGrade) 
      }
      else{
        this.close()
      }

    });
  }

  updateComment(e:UntypedFormGroup, p:UntypedFormGroup): void{

    let examGrade_id = e.controls.id.value
    let parameterGrade_id = p.controls.id.value

    let comment = p.controls.evaluator_comment.value

    let values = {
      evaluator_comment:comment
    }    

    db.collection(`examGrades/${examGrade_id}/parameterGrades`).doc(parameterGrade_id).update(values).then( 
      doc =>{
        console.debug("aspect updated:" + doc)
        this.close() 
      },
      reason =>{
        console.log("error updating aspect:" + reason )
      })
  
  }  

  selector(key, value) {
    const toSaveFields = new Set(["id","isGraded","score","missingElements"])    
    var firstShot = typeof value;
    if (firstShot === 'object') {
        return value;
    } 
    else if (value.constructor === [].constructor) {
        return value;
    }
    else if (value.constructor === {}.constructor) {
        return value;
    }
    else {
        if ( toSaveFields.has(key) )
         return value;
    } 
    return null;
  } 

  selectKeys(json,parentId, toSaveFields){
    var outJson = {id:null}
    var keys = Object.keys(json)
    for( var key of keys){
      var value = json[key]
      if ( value != null && (value.constructor === [].constructor) ){
        outJson[key] = []
        for(var i =0; i< value.length; i++){
          var obj = this.selectKeys(json[key][i], key, toSaveFields);
          outJson[key].push(obj)
        } 
      }  
      else if ( value != null && (value.constructor === {}.constructor)){
        var obj = this.selectKeys(json[key], key, toSaveFields);
        outJson[key] = obj
      }
      else {
          if ( key == "id" || toSaveFields.has(parentId + "." + key) == true )
            outJson[key] = json[key]
      } 
    }
    return outJson
  }

  close(): void{
    console.log("close")
    var parameterGrade_arr = this.examGradeFG.controls.parameterGrades as UntypedFormArray
    var parameterGrade = parameterGrade_arr.controls[0] as UntypedFormGroup
    let values = {
          score: parameterGrade.controls.score.value,
          isCompleted:true
        }
    
    db.collection(`examGrades/${this.examGrade_id}/parameterGrades`).doc(this.parameterGrade_id).update(values).then( 
      doc =>{
        console.debug("end update score:" + doc)
        if(this.isAdmin) {
          this.router.navigate(["grades"])
        }
        else{
          this.router.navigate(["ExamenesImprovisacion"])
        }
      },
      reason =>{
        console.log("ERROR: updating score:" + reason )
      })        
  }

  showDescription(desc){
    const dialogRef = this.dialog.open(DescriptionDialog, {
      width: '250px',
      data: { description: desc}
    });    
  }

  showText(str){
    const dialogRef = this.dialog.open(DescriptionDialog, {
      width: '250px',
      data: { description: str}
    });    
  }  

  getformValue(){
    return JSON.stringify(this.examGradeFG)
  }  



  isEvaluador(){
    return this.userLoginService.hasRole("role-evaluador-" + this.organization_id)
  }

  updateHeader(){
    
    console.log("close")
    var parameterGrade_arr = this.examGradeFG.controls.parameterGrades as UntypedFormArray
    var parameterGrade = parameterGrade_arr.controls[0] as UntypedFormGroup
    let values = {
        title: this.examGradeFG.controls.title.value
    }
    

    db.collection(`examGrades`).doc(this.examGrade_id).update(values).then( 
      doc =>{
        console.debug("title updated:" + doc)

      },
      reason =>{
        console.log("error updating title:" + reason )
      })        
  }


updateExamGrade():Promise<void>{

  let examGrade_id = this.examGradeFG.controls.id.value
  var parameter_resolve = null
  return new Promise<void>((resolve, reject) =>{  
    parameter_resolve = resolve
    let parameterGrades = this.examGradeFG.controls.parameterGrades as UntypedFormArray
    let pa = parameterGrades.controls.map(e =>{       
      let p = e as UntypedFormGroup
      return this.updateParameterGrade(examGrade_id, p)
    })
    Promise.all(pa).then( () =>{
      console.log("End updating parameters")
      parameter_resolve()
    }) 
    .catch(reason =>{
      console.error("Error waiting for parameters:" + reason)
    })  
  })        
}
 


  updateParameterGrade(examGrade_id:string, pFG:UntypedFormGroup):Promise<void>{
    let parameterGrade_id = pFG.controls.id.value
    let json = {
      score:pFG.controls.score.value,
      isCompleted:true
    }

    var parameter_resolve = null
    return new Promise<void>((resolve, reject) =>{
      parameter_resolve = resolve
      db.collection(`examGrades/${examGrade_id}/parameterGrades`).doc(parameterGrade_id).update(json).then(()=>{
    
        console.log("adding parameterGrade" + pFG.controls.id.value)
        let criteriaGradesFA = pFG.controls.criteriaGrades as UntypedFormArray
        
        let cm = criteriaGradesFA.controls.map( c => {
            return this.updateCriteriaGrades(examGrade_id, parameterGrade_id, c as UntypedFormGroup)             
        })
        Promise.all(cm).then( () =>{
          parameter_resolve()
        })
        .catch(reason =>{
          console.error("Error waiting for criteria:" + reason)
        })        
      },
      reason => {
        console.error("ERROR:parameterGrade not created " + reason )
        reject()
      }) 
    })
  }

  updateCriteriaGrades(examGrade_id:string, parameterGrade_id:string, criteriaGradeFG:UntypedFormGroup):Promise<void>{
    let criteriaGrade_id = criteriaGradeFG.controls.id.value
    let json = {
      score:criteriaGradeFG.controls.score.value
    }
    var criteria_resolve = null    
    return new Promise<void>((resolve, reject) =>{
      criteria_resolve = resolve    
      db.collection(`examGrades/${examGrade_id}/parameterGrades/${parameterGrade_id}/criteriaGrades`).doc(criteriaGrade_id).update(json).then(()=>{
        console.log("adding CriteriaGrade" + criteriaGrade_id)
        criteria_resolve()        
      },
      reason => {
        alert("ERROR:criteriaGrade not created " + reason )
        reject()
      })       
    })         
  }
  onEditParameterGrade(){
    this.submitting = true
    this.newVersionExamGrade( this.examGrade.id, this.parameterGrade.id, this.parameterGrade.version ).then( 
      parameterGrade =>{
        this.submitting = false
        this.router.navigate(['/ei-ap-parameter-form-component',{examGrade_id:this.examGrade.id,parameterGrade_id:parameterGrade.id}]);
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
        examGrades:{
          id:examGrade_id,
          parameterGrades:
            {
              id:parameterGrade_id,
              version: version + 1,
              isCurrentVersion: true,
              isCompleted:false
            }          
        }
      }
      var options = {
        exceptions:["references","Path","Url"]
      }
      this.userLoginService.getUserIdToken().then( token => {
        this.examImprovisacionService.firestoreApiInterface("dupSubCollection", token, req, options).subscribe(
          {
            next(data){ 
              var parameterGrade:ParameterGrade = data["result"] as ParameterGrade
              //now update the old version as not current

              db.collection("examGrades/" + examGrade_id + "/parameterGrades").doc(parameterGrade_id).update({"isCurrentVersion": false}).then(
                ()=>{
                  console.log("parameter grade old version has been udpated")
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

}
/* do not forget to add the dialog to the app.module.ts*/
@Component({
  selector: 'ei-ap-parameter-comentario-dlg',
  templateUrl: 'ei-ap-parameter-comentario-dlg.html',
})
export class DialogOverviewExampleDialog { 

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

}

 
@Component({
  selector: 'ei-ap-parameter-description-dlg',
  templateUrl: 'ei-ap-parameter-description-dlg.html',
})
export class DescriptionDialog { 
  constructor(
    public dialogRef: MatDialogRef<DescriptionDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DescriptionDlgData) {}
}