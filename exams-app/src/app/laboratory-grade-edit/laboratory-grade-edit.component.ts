import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { NavigationService } from '../navigation.service';
import { UserLoginService } from '../user-login.service';
import { UserPreferencesService } from '../user-preferences.service';
import { db , storage  } from 'src/environments/environment';
import { FileLoadObserver } from "../load-observers/load-observers.module"
import { Laboratory, LaboratoryGrade, LaboratoryGradeStatus, LaboratoryGradeStudentData } from '../exams/exams.module';
import { ExamFormService } from '../exam-form.service';
import { DateFormatService } from '../date-format.service';

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

  videoUrl:[null]
  videoPath:[null]  

  path = "laboratoryGrades" 
  collectionPath = null

  constructor(
    private fb: FormBuilder
    ,private route: ActivatedRoute
    ,private dateFormatService:DateFormatService
    ,private userLoginService: UserLoginService
    ,private userPreferencesService: UserPreferencesService
    ,public dialog: MatDialog 
  ) {
    this.organizationId = this.userPreferencesService.getCurrentOrganizationId()
    if( this.userLoginService.hasRole("role-admin-" + this.organizationId) ){
      this.isAdmin = true
    }   
    if( this.userLoginService.getUserUid() ){
      this.isLoggedIn = true
    }
    this.laboratoryGradeId = this.route.snapshot.paramMap.get('laboratory_grade_id')
    this.collectionPath = "laboratoryGrades/" + this.laboratoryGradeId + "/studentData" 
    
  }
  ngAfterViewInit(): void {

    db.collection("laboratoryGrades").doc(this.laboratoryGradeId).get().then( doc =>{
      this.laboratoryGrade  = doc.data() as LaboratoryGrade
      this.loadLaboratory( this.laboratoryGrade.materia_id, this.laboratoryGrade.laboratory_id )
      this.unsubscribe = db.collection("laboratoryGrades/" + this.laboratoryGradeId + "/studentData" ).doc("practiceData").onSnapshot( snapshot =>{
        var laboratoryGradeStudentData:LaboratoryGradeStudentData = snapshot.data() as LaboratoryGradeStudentData
        this.laboratoryGrade.studentData = laboratoryGradeStudentData
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
  }

  ngOnInit(): void {

 
    
  }


  selectFile(event) {

    
    var selectedFiles = event.target.files;
    const property = event.srcElement.name
    this.laboratoryGrade[property + "Url"] = null
    this.laboratoryGrade[property + "Path"] = null

    

    const organizationPath = "organizations/" + this.organizationId + "/" 
    const pathCollection = "laboratoryGrades/" + this.laboratoryGrade.id + "/studentData" 
    const bucketName = organizationPath + pathCollection + "/studentVideo/" + property + ".jpg"

    var file:File = selectedFiles[0]

    if( file.size > 200 * 1024*1024) {
      alert( "El archivo es muy grande")
      return
    }
    var storageRef = storage.ref( bucketName )

    var uploadTask = storageRef.put(file)
    var element = document.getElementById(property + "Status")
    var fileLoadObserver = new FileLoadObserver(storageRef, pathCollection , "studentVideo", property, element );
    uploadTask.on("state_change", fileLoadObserver)
  }   
  removePropertyValue(property){
    const json = {}
    json[property + "Url"] = null
    json[property + "Path"] = null

    
    db.collection("laboratoryGrades" ).doc(this.laboratoryGradeId).update( json ).then( () =>{
      console.log("property was removed")
    })
  }

  onCompleted(){
    const data = {
      status:LaboratoryGradeStatus.requestGrade,
      requestedDay:this.dateFormatService.getDayId(new Date()),
      requestedMonth:this.dateFormatService.getMonthId(new Date()),
      requestedYear:this.dateFormatService.getYearId(new Date()) 
    }   
    db.collection("laboratoryGrades").doc(this.laboratoryGradeId).update(data).then( data =>{
      alert("su video ha sido enviado a revision")
      this.laboratoryGrade.status = LaboratoryGradeStatus.requestGrade
    })
  }

  onReleased(){
    db.collection("laboratoryGrades").doc(this.laboratoryGradeId).update({ status:LaboratoryGradeStatus.accepted}).then( data =>{
      this.laboratoryGrade.status = LaboratoryGradeStatus.accepted
    })
  }  
  onRework(){
    db.collection("laboratoryGrades").doc(this.laboratoryGradeId).update({ status:LaboratoryGradeStatus.rework}).then( data =>{
      this.laboratoryGrade.status = LaboratoryGradeStatus.rework
    })
  }  

}
