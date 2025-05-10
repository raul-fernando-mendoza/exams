import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Laboratory, LaboratoryGrade, LaboratoryGradeStatus, User} from '../exams/exams.module';
import { db   } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { UserLoginService } from '../user-login.service';
import { UserPreferencesService } from '../user-preferences.service';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { DateFormatService } from '../date-format.service';
import { MatLegacyTable as MatTable } from '@angular/material/legacy-table';
import * as uuid from 'uuid';

interface LaboratoryGradeItem{
  laboratoryGrade:LaboratoryGrade
  laboratory:Laboratory
  user:User
}

@Component({
  selector: 'app-laboratory-grade-list',
  templateUrl: './laboratory-grade-list.component.html',
  styleUrls: ['./laboratory-grade-list.component.css']
})
export class LaboratoryGradeListComponent implements OnInit{
  
  laboratoryGrades:Array<LaboratoryGradeItem> = [] 
  organization_id = null
  isReleased = false

  selectedDay:number|null = null
  filterUid = null
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
  }
  ngOnInit(): void {
    this.selectedDay = this.dateFormatService.getDayId( new Date() )
    this.update()
  }
  getUser( userUid ):Promise<User>{
    return new Promise<User>((resolve, reject) =>{
      return this.examenesImprovisacionService.getUser(userUid).then( user =>{
        resolve(user)
      },
      reason =>{
        reject(null)
      })
    })
  }

  getLaboratory( materiaId, laboratoryId ):Promise<Laboratory>{
    return new Promise<Laboratory>((resolve, reject) =>{
      db.collection("materias/" + materiaId + "/laboratory").doc(laboratoryId).get().then( doc =>{
        var l:Laboratory = doc.data() as Laboratory
        resolve(l)
      },
      reason =>{
        console.log("error reading laboratory:" + reason)
        reject(null)
      })  
    })

  }


  update():Promise<void>{
    return new Promise<void>( (resolve, reject) =>{
      var d = new Date();
      this.laboratoryGrades.length = 0
      var qry = db.collection("laboratoryGrades")
      .where("organization_id", "==", this.organization_id )
  
      if( this.filterUid ){
        qry = qry.where("student_uid","==", this.filterUid)
      }
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
  
      qry.orderBy("requestedDay","desc")
  
      qry.limit(1000)


      qry.get().then( set => {
        this.laboratoryGrades.length = 0
        var allPromises = []
        set.docs.map( doc =>{
          var laboratoryGrade:LaboratoryGrade = doc.data() as LaboratoryGrade

          var lgi:LaboratoryGradeItem = {
            laboratoryGrade:laboratoryGrade,
            laboratory:null,
            user:null
          }
          this.laboratoryGrades.push( lgi )
          var userPromise = this.getUser( lgi.laboratoryGrade.student_uid )
            .then( user =>{
              lgi.user = user
            })
          allPromises.push( userPromise )  

          var laboratoryPromise = this.getLaboratory( laboratoryGrade.materia_id, laboratoryGrade.laboratory_id).then( laboratory =>{
            lgi.laboratory = laboratory
          })
          allPromises.push( laboratoryPromise)
                
            
        })
        Promise.all( allPromises ).then( ()=>{
          this.laboratoryGrades.sort( (a:LaboratoryGradeItem, b:LaboratoryGradeItem ) =>{
            if (a.user.displayName == null){
              console.log("null")
            }
            if( a.user.displayName > b.user.displayName ) 
              return 1
            else
              return -1
          } )
          this.matTable.renderRows()
          resolve()
        })
      })    
  
    })
    
  }


  onOpenLaboratoryGrade( laboratoryGrade:LaboratoryGrade){
      this.openLaboratoryGrade( laboratoryGrade.id )
  }
  /*
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
  */
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
