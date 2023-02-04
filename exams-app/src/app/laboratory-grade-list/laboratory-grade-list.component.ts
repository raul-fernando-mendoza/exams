import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LaboratoryGrade, LaboratoryGradeStatus} from '../exams/exams.module';
import { db   } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { UserLoginService } from '../user-login.service';
import { UserPreferencesService } from '../user-preferences.service';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { DateFormatService } from '../date-format.service';
import { MatTable } from '@angular/material/table';
import * as uuid from 'uuid';

@Component({
  selector: 'app-laboratory-grade-list',
  templateUrl: './laboratory-grade-list.component.html',
  styleUrls: ['./laboratory-grade-list.component.css']
})
export class LaboratoryGradeListComponent implements OnInit, OnDestroy{
  @Input() materiaid:string = null
  @Input() useruid:string = null
  
  laboratoryGrades:Array<LaboratoryGrade> = [] 
  organization_id = null
  isReleased = false

  selectedDay:number|null = null
  filterUid = null
  unsubscribe = null
  isEnrolled = false

  columnsToDisplay = ['laboratory_name','student.displayName','status'];
  @ViewChild(MatTable) matTable:MatTable<LaboratoryGrade>

  constructor(   
     private router: Router
    ,private userLoginService:UserLoginService
    ,private userPreferencesService: UserPreferencesService
    ,private examenesImprovisacionService:ExamenesImprovisacionService
    ,private dateFormatService:DateFormatService
    ,private examenesImprovisationService:ExamenesImprovisacionService
  ) { 
    this.organization_id = this.userPreferencesService.getCurrentOrganizationId()
    this.useruid = this.userLoginService.getUserUid()
  }
  ngOnDestroy(): void {
    this.unsubscribe()
  }


  ngOnInit(): void {
    this.examenesImprovisationService.hasMateriaEnrollment( this.organization_id, this.materiaid, this.useruid).then( isEnrolled  =>{
      if( this.useruid ){
        this.columnsToDisplay = ['laboratory_name','status'];
        
      }
      else{
        this.selectedDay = this.dateFormatService.getDayId( new Date() )
      }
      this.update()
    })
  }

  update(){

    var d = new Date();
    this.laboratoryGrades.length = 0
    var qry = db.collection("laboratoryGrades")
    .where("organization_id", "==", this.organization_id )

    if( this.useruid ){
      qry = qry.where("student_uid","==", this.useruid)
      qry = qry.where("materia_id","==", this.materiaid)
    }
    else{
      if( !this.isReleased ){
        qry = qry.where("status","in", [LaboratoryGradeStatus.requestGrade, LaboratoryGradeStatus.rework])
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
    }  

    qry.orderBy("requestedDay","desc")

    qry.limit(1000)
    this.unsubscribe = qry.onSnapshot( set => {
      this.laboratoryGrades.length = 0
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


  onOpenLaboratoryGrade( laboratoryGrade:LaboratoryGrade){
    if( laboratoryGrade.id == null){
      this.createLaboratoryGrade( laboratoryGrade )
    }
    else{
      this.openLaboratoryGrade( laboratoryGrade.id )
    }
  }
  createLaboratoryGrade( laboratoryGrade:LaboratoryGrade ){
    const id = uuid.v4()
    laboratoryGrade.id = id

    laboratoryGrade.createdDay = this.dateFormatService.getDayId(new Date())
    laboratoryGrade.createdMonth = this.dateFormatService.getMonthId(new Date())
    laboratoryGrade.createdYear = this.dateFormatService.getYearId(new Date())

    db.collection("laboratoryGrades").doc(id).set(laboratoryGrade).then(data =>{
      this.openLaboratoryGrade( id )
    })
  }
  openLaboratoryGrade( laboratory_grade_id ){
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
  getStatusText(id):string{
    const laboratoryGradeStatusText = [ "inicial" , "Solicitud de calificacion" , "Retrabajo" , "Aceptado" ]
    return laboratoryGradeStatusText[id]
  }
    
  
}
