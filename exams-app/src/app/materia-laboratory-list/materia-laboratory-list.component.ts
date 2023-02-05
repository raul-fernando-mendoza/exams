import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Exam, getLaboratoryStatusName, Laboratory, LaboratoryGrade, LaboratoryGradeStatus } from '../exams/exams.module';
import { UserLoginService } from '../user-login.service';
import { UserPreferencesService } from '../user-preferences.service';
import { db } from 'src/environments/environment';
import { DialogNameDialog } from '../name-dialog/name-dlg';
import { MatDialog } from '@angular/material/dialog';
import * as uuid from 'uuid';
import { Router } from '@angular/router';
import { DateFormatService } from '../date-format.service';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';

interface LaboratoryItem{
  laboratory:Laboratory
  laboratoryGrade:LaboratoryGrade
}

@Component({
  selector: 'app-materia-laboratory-list',
  templateUrl: './materia-laboratory-list.component.html',
  styleUrls: ['./materia-laboratory-list.component.css']
})
export class MateriaLaboratoryListComponent implements OnInit, OnDestroy {
  @Input() materiaid:string = null
  organization_id:string
  isAdmin = false
  unsubscribe = null
  submitting = false
  isEnrolled = false
  laboratoryList:Array<LaboratoryItem> = []
  userUid = null

  constructor(
      private userPreferenceService:UserPreferencesService
    , private userLoginService:UserLoginService
    , public dialog: MatDialog 
    , private router: Router 
    , private dateFormatService:DateFormatService  
    , private examenesImprovisacionService:ExamenesImprovisacionService
  ) { 
    this.organization_id = this.userPreferenceService.getCurrentOrganizationId()
    this.isAdmin = this.userLoginService.hasRole("role-admin-" + this.organization_id)
    this.userUid = this.userLoginService.getUserUid()

  }

  ngOnDestroy(): void {
    this.unsubscribe()
  }

  ngOnInit(): void {
    if( this.materiaid != null){
      this.examenesImprovisacionService.hasMateriaEnrollment(this.organization_id, this.materiaid, this.userUid).then( isEnrolled => {
        this.isEnrolled = isEnrolled
        this.loadLaboratories(this.materiaid)
      })
    }
  }
  loadLaboratories(materia_id:string):Promise<void>{
    return new Promise<void>((resolve, reject) =>{

      this.submitting = true
      this.unsubscribe = db.collection("materias/" + materia_id + "/laboratory")
      .where("isDeleted","==", false).onSnapshot( snapshot =>{
        this.submitting = false
        this.laboratoryList.length = 0
        snapshot.docs.map( doc =>{
          const laboratory = doc.data() as Laboratory
          var laboratoryItem:LaboratoryItem = {
            laboratory:laboratory,
            laboratoryGrade:null
          }
          this.laboratoryList.push(laboratoryItem)
          if( this.isEnrolled ){
            this.getLaboratoryGrade( laboratory.id ).then( laboratoryGrade =>{
              laboratoryItem.laboratoryGrade =laboratoryGrade
            },
            reason =>{
              //do nothing
            })
          }
        })
        
        this.laboratoryList.sort( (a,b) => {
          return a.laboratory.label > b.laboratory.label ? 1:-1})
        resolve()
      },
      reason =>{
        console.log("ERROR reading Laboratory:" + reason)
        reject()
      })
    })
  }
  getLaboratoryGrade( laboratory_id ):Promise<LaboratoryGrade>{
    return new Promise<LaboratoryGrade>( (resolve, reject ) =>{
      db.collection("laboratoryGrades")
      .where("organization_id", "==", this.organization_id )
        .where("student_uid","==", this.userUid)
        .where("materia_id","==", this.materiaid)
        .where("laboratory_id","==", laboratory_id).get().then( set =>{
          if( set.docs.length > 0){
            let laboratory = set.docs[0].data() as LaboratoryGrade
            resolve( laboratory )
          }
          else{
            reject( null )
          }
        })
      })    
  }

  onOpenLaboratoryGrade( li:LaboratoryItem){
    if( li.laboratoryGrade == null ){
      this.createLaboratoryGrade(li.laboratory).then( laboratoryGrade =>{
        this.onEditLaboratoryGrade( laboratoryGrade.id )
      })
    }
    else{
      this.onEditLaboratoryGrade( li.laboratoryGrade.id )
    }
  }

  createLaboratoryGrade(laboratory:Laboratory):Promise<LaboratoryGrade>{
    return new Promise<LaboratoryGrade>( (resolve, reject) =>{
      const id =uuid.v4()
      const laboratoryGrade:LaboratoryGrade= {
        id:id,
        organization_id:this.organization_id,
        materia_id:this.materiaid,
        laboratory_id:laboratory.id,
        student_uid:this.userUid,
        status:LaboratoryGradeStatus.initial,
        createdDay:this.dateFormatService.getDayId(new Date()),
        createdMonth:this.dateFormatService.getMonthId(new Date()),
        createdYear:this.dateFormatService.getYearId(new Date()),
      }   
      db.collection("laboratoryGrades").doc(id).set(laboratoryGrade).then( () =>{
        resolve(laboratoryGrade)
      },
      reason=>{
        alert("error:" + reason)
      })
    })
  }  

  onEditLaboratoryGrade(laboratory_grade_id){
    this.router.navigate(['/laboratory-grade-edit',{laboratory_grade_id:laboratory_grade_id}]);
  }

  getStatusName( lg:LaboratoryGrade ){
    if( lg ){
      return getLaboratoryStatusName( lg.status )
    }
    else return ""
  }

  onCreateLaboratory(){
    const dialogRef = this.dialog.open(DialogNameDialog, {
      height: '400px',
      width: '250px',
      data: { label:"Leccion Interactiva", name:""}
    });
  
    dialogRef.afterClosed().subscribe(data => {
      console.log('The dialog was closed');
      if( data != undefined ){
        console.debug( data )
        this.createLaboratory(data.name).then( (id)=>{
          this.router.navigate(['/laboratory-edit',{materia_id:this.materiaid, laboratory_id:id}]);
        },
        reason =>{
          alert("ERROR: removing level")
        })
      }
      else{
        console.debug("none")
      }
    });
  }
  
 
  

  createLaboratory( laboratory_Label ):Promise<string>{
    return new Promise<string>( (resolve, reject) =>{
      const id =uuid.v4()
      var laboratory:Laboratory = {
        id:id,
        label:laboratory_Label,
        isDeleted:false     
      }
      this.submitting = true
      db.collection("materias/" + this.materiaid + "/laboratory").doc(id).set(laboratory).then( () =>{
        this.submitting = false
        console.log("materia created")
        resolve( id )
      },
      reason =>{
        this.submitting = false
        alert("ERROR: Can not create materia:" + reason)
        reject( reason )
      })
    })
  }

  onDeleteLaboratory(laboratory_id:string){
    db.collection("materias/" + this.materiaid + "/laboratory").doc(laboratory_id).update({"isDeleted":true}).then(
      result =>{
        console.log("exam delted")
      }
    )
  }  
  onEditLaboratory(laboratory_id){
    this.router.navigate(['/laboratory-edit',{materia_id:this.materiaid, laboratory_id:laboratory_id}]);
  }


}
