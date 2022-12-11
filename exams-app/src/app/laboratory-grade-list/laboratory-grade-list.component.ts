import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LaboratoryGrade, LaboratoryGradeStatus} from '../exams/exams.module';
import { db   } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { UserLoginService } from '../user-login.service';
import { UserPreferencesService } from '../user-preferences.service';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { DateFormatService } from '../date-format.service';
import { MatTable } from '@angular/material/table';

@Component({
  selector: 'app-laboratory-grade-list',
  templateUrl: './laboratory-grade-list.component.html',
  styleUrls: ['./laboratory-grade-list.component.css']
})
export class LaboratoryGradeListComponent implements OnInit{

  laboratoryGrades:Array<LaboratoryGrade> = [] 
  organization_id = null
  isReleased = false

  selectedDay:number|null = null
  filterUid = null

  columnsToDisplay = ['laboratory_name','student.displayName','status'];
  @ViewChild(MatTable) matTable:MatTable<LaboratoryGrade>

  constructor(   
     private router: Router
    ,private userPreferencesService: UserPreferencesService
    ,private examenesImprovisacionService:ExamenesImprovisacionService
    ,private dateFormatService:DateFormatService
  ) { 
    this.organization_id = this.userPreferencesService.getCurrentOrganizationId()
    this.selectedDay = this.dateFormatService.getDayId( new Date() )
  }


  ngOnInit(): void {
    this.update()
  }

  update(){

    var d = new Date();
    this.laboratoryGrades.length = 0
    var qry = db.collection("laboratoryGrades")
    .where("organization_id", "==", this.organization_id )
    if( !this.isReleased ){
      qry = qry.where("status","==", LaboratoryGradeStatus.requestGrade)
    }
    

    if( this.selectedDay && this.selectedDay.toString().length == 8 ){
      qry = qry.where("requestedDay", "==", this.selectedDay )
    }
    else if( this.selectedDay && this.selectedDay.toString().length == 6){
      qry = qry.where("requestedMonth", "==", this.selectedDay )
    }
    else if( this.selectedDay && this.selectedDay.toString().length == 4){
      qry = qry.where("requestedYear", "==", this.selectedDay )
    } 
    
    if( this.filterUid ){
      qry = qry.where("student_uid","==", this.filterUid)
    }

    qry.orderBy("requestedDay","desc")

    qry.limit(1000)
    qry.get().then( set => {
      
      var m:Promise<void>[] = set.docs.map( doc =>{
        var laboratoryGrade:LaboratoryGrade = doc.data() as LaboratoryGrade
        this.laboratoryGrades.push( laboratoryGrade )
        return this.loadLaboratoryGrade( laboratoryGrade )
      })
      Promise.all( m ).then( ()=>{
        this.laboratoryGrades.sort( (a:LaboratoryGrade, b:LaboratoryGrade ) =>{
          if (a.student == null){
            console.log("null")
          }
          if( a.student.displayName > b.student.displayName ) 
            return 1
          else
            return -1
        } )
        this.matTable.renderRows()
      })
    })    
    
  }

  loadLaboratoryGrade( laboratoryGrade ):Promise<void>{
    return this.examenesImprovisacionService.getUser(laboratoryGrade.student_uid).then( user =>{
      laboratoryGrade.student = user
    })
  }


  onOpenLaboratoryGrade( laboratory_grade_id ){
    this.router.navigate(['/laboratory-grade-edit',{laboratory_grade_id:laboratory_grade_id}]);
  }

  onReleased(){
    this.update()
  }
  
  onDateSelect($event){
    console.log("query changed" + $event)
    this.selectedDay = $event
    this.update()
  }

  onUserSelected(uid){
    console.log("filter:" + uid)
    this.filterUid = uid
    this.update()
  }
}
