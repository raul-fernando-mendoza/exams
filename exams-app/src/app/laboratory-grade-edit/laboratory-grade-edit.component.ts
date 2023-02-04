import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { NavigationService } from '../navigation.service';
import { UserLoginService } from '../user-login.service';
import { UserPreferencesService } from '../user-preferences.service';
import { db , storage  } from 'src/environments/environment';
import { getLaboratoryStatusName, Laboratory, LaboratoryGrade, LaboratoryGradeStatus, LaboratoryGradeStudentData } from '../exams/exams.module';
import { ExamFormService } from '../exam-form.service';
import { DateFormatService } from '../date-format.service';
import { Observer } from 'rxjs';
import { FileLoadObserver } from '../load-observers/load-observers.module';


@Component({
  selector: 'app-laboratory-grade-edit',
  templateUrl: './laboratory-grade-edit.component.html',
  styleUrls: ['./laboratory-grade-edit.component.css']
})
export class LaboratoryGradeEditComponent implements OnInit {

  public LaboratoryGradeStatus = LaboratoryGradeStatus
  organizationId = null
  isAdmin = false
  isLoggedIn = false
  materiaId = null
  laboratoryGradeId = null
  laboratoryGrade:LaboratoryGrade = null
  laboratory:Laboratory = null
  unsubscribe = null
  unsubscribeStudentData = null

  videoUrl:[null]
  videoPath:[null]  

  path = "laboratoryGrades" 

  constructor(
    private fb: FormBuilder
    ,private route: ActivatedRoute
    ,private dateFormatService:DateFormatService
    ,private userLoginService: UserLoginService
    ,private userPreferencesService: UserPreferencesService
    ,public dialog: MatDialog
    ,private router:Router
  ) {
    this.organizationId = this.userPreferencesService.getCurrentOrganizationId()
    if( this.userLoginService.hasRole("role-admin-" + this.organizationId) ){
      this.isAdmin = true
    }   
    if( this.userLoginService.getUserUid() ){
      this.isLoggedIn = true
    }
    this.laboratoryGradeId = this.route.snapshot.paramMap.get('laboratory_grade_id')
  
    
  }
  ngAfterViewInit(): void {

    this.unsubscribe = db.collection("laboratoryGrades").doc(this.laboratoryGradeId).onSnapshot( doc =>{
      this.laboratoryGrade  = doc.data() as LaboratoryGrade
      this.loadLaboratory( this.laboratoryGrade.materia_id, this.laboratoryGrade.laboratory_id )
      if( this.unsubscribeStudentData ){ 
        this.unsubscribeStudentData() 
      }
      this.unsubscribeStudentData = db.collection("laboratoryGrades/" + this.laboratoryGradeId + "/studentData" ).doc("practiceData").onSnapshot( snapshot =>{
        var laboratoryGradeStudentData:LaboratoryGradeStudentData = snapshot.data() as LaboratoryGradeStudentData
        if( laboratoryGradeStudentData == null ){
          this.laboratoryGrade.studentData = {
            videoPath:null,
            videoUrl:null 
          }
        }
        else{
          this.laboratoryGrade.studentData = laboratoryGradeStudentData
        }
      })
    })


    

  }
  loadLaboratory(materia_id:string, laboratory_id:string){

    db.collection("materias/" + materia_id + "/laboratory/" ).doc(laboratory_id).get().then( 
      doc =>{
        this.laboratory = doc.data() as Laboratory
      },
      error=>{
        console.log("ERROR reading materia")
    })    
    
    
  }

  ngOnDestroy(): void {
    this.unsubscribe()
    if( this.unsubscribeStudentData ){
      this.unsubscribeStudentData()
    }
  }

  ngOnInit(): void {

  }


 


  onCompleted(){
    const data = {
      status:LaboratoryGradeStatus.requestGrade,
      requestedDay:this.dateFormatService.getDayId(new Date()),
      requestedMonth:this.dateFormatService.getMonthId(new Date()),
      requestedYear:this.dateFormatService.getYearId(new Date()),
      updatedon:new Date()
    }   
    db.collection("laboratoryGrades").doc(this.laboratoryGradeId).update(data).then( data =>{
      alert("su video ha sido enviado a revision")
      this.laboratoryGrade.status = LaboratoryGradeStatus.requestGrade
      this.router.navigate(['/home'])
    })
  }

  onReleased(){
    db.collection("laboratoryGrades").doc(this.laboratoryGradeId).update({ status:LaboratoryGradeStatus.accepted}).then( data =>{
      this.laboratoryGrade.status = LaboratoryGradeStatus.accepted
      this.router.navigate(["/laboratory-grade-list"])
    })
  }  
  onRework(){
    db.collection("laboratoryGrades").doc(this.laboratoryGradeId).update({ status:LaboratoryGradeStatus.rework}).then( data =>{
      this.laboratoryGrade.status = LaboratoryGradeStatus.rework
      this.router.navigate(["/laboratory-grade-list"])
    })
  }  

  getLaboratoryGradeStatusName(laboratoryGradeStatus:LaboratoryGradeStatus){
    return getLaboratoryStatusName(laboratoryGradeStatus)
  }

  fileLoaded(path){
    console.log("file loaded:" + path)
    this.laboratoryGrade.studentData.videoPath = null
    this.laboratoryGrade.studentData.videoUrl = null
    
    let storageRef = storage.ref( path )
    storageRef.getDownloadURL().then( url =>{
        
        var data = {
          videoPath:path,
          videoUrl:url
        }        
        db.collection("laboratoryGrades/" + this.laboratoryGradeId + "/studentData" ).doc("practiceData").set(data).then( ()=>{
          this.laboratoryGrade.studentData.videoPath = path
          this.laboratoryGrade.studentData.videoUrl = url
          console.log("studentdata update")
        })
    })     

 
  }
  fileDeleted(path){
    console.log("file deleted:" + path)

    let oldVideoPath = this.laboratoryGrade.studentData.videoPath

    var transactions = []
    //first erase the old file if it exists and is different from the old one
    if( oldVideoPath && oldVideoPath != path){
        let storageRef = storage.ref( oldVideoPath )
        var trans_del = storageRef.delete().then( () =>{
            console.log("old video removed")
        })
        .catch( reason =>{
            console.log("old video can not be erased")
        })
        transactions.push(trans_del)        
    } 
    Promise.all( transactions ).then( () =>{
      this.laboratoryGrade.studentData.videoPath = null
      this.laboratoryGrade.studentData.videoUrl = null
      var data = {
        videoPath:null,
        videoUrl:null
      }        
      db.collection("laboratoryGrades/" + this.laboratoryGradeId + "/studentData" ).doc("practiceData").update(data).then( ()=>{
        console.log("studentdata update")
      })
    })      
  }
  getBasePath(){
    return "organizations/" + this.organizationId + "/laboratoryGrades/" + this.laboratoryGradeId + "/studentData/" + "practiceData"
  }
/*
  createLaboratoryGrade( ){
    const id = uuid.v4()
    if( l.laboratoryGrade == null){
      var lgNew:LaboratoryGrade = {
        student_uid:this.userUid,
        materia_id:this.materiaid,
        organization_id:this.organization_id,
        laboratory_id:l.laboratory.id, 
        status:LaboratoryGradeStatus.initial
      }
      this.createLaboratoryGrade( lgNew )
    }

    laboratoryGrade.id = id

    laboratoryGrade.createdDay = this.dateFormatService.getDayId(new Date())
    laboratoryGrade.createdMonth = this.dateFormatService.getMonthId(new Date())
    laboratoryGrade.createdYear = this.dateFormatService.getYearId(new Date())

    db.collection("laboratoryGrades").doc(id).set(laboratoryGrade).then(data =>{
      this.openLaboratoryGrade( id )
    })
  }
*/
}
