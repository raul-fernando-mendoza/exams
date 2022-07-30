import { Component, OnInit } from '@angular/core';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { UserLoginService } from '../user-login.service';

import { db } from 'src/environments/environment';
import { copyObj, Exam, ExamGrade, Materia } from '../exams/exams.module';
import { SortingService } from '../sorting.service';
import { ExamgradesReportComponent } from '../examgrades-report/examgrades-report.component';
import { RouteConfigLoadEnd, Router } from '@angular/router';
import { UserPreferencesService } from '../user-preferences.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {

  constructor(
      private router: Router
    , private userLoginService:UserLoginService
    , private examenesImprovisacionService:ExamenesImprovisacionService
    , private sortingService:SortingService
    , private userPreferencesService:UserPreferencesService) { }

  materiaEnrollments = []
  materias:Array<Materia> = []

  ngOnInit(): void {
    this.update()
  }

  update(){
    this.loadMaterias()
    this.loadMateriaEnrollment()  
  }
  isEmailVerified(): boolean{
    return this.userLoginService.getIsEmailVerified()
  }

  emailVerify(): void{
    this.userLoginService.sendEmailLink()
  }
  isLoggedIn() : boolean{
    return this.userLoginService.getIsloggedIn()
  }


  loadMateriaEnrollment(){
    this.materiaEnrollments.length = 0

    if( !this.isLoggedIn() ){
      return
    }

    db.collection("materiaEnrollments")
    .where("student_uid","==",this.userLoginService.getUserUid())
    .where("isActive",'==',true)
    .get().then( set =>{
      console.log("materia start")
      let map:Array<Promise<void>> = set.docs.map( doc =>{
        console.log("processing enrollment:" + doc.data())
        var json = doc.data()
        json["materia"] = new Materia()
        this.materiaEnrollments.push(json)

        const materia_id = doc.data().materia_id
        json["exams"] = new Array()
        this.loadExamsForRow(materia_id, json["exams"])

        return db.collection("materias").doc(materia_id).get().then( doc=>{
          console.log("materia name:" + doc.data().materia_name)
          copyObj(json["materia"], doc.data() )          
        })      
      })
      Promise.all(map).then(()=>{
        this.materiaEnrollments.sort( (a,b) => {
          if( a["materia"]["materia_name"] > b["materia"]["materia_name"] ){
            return 1
          }
          else return -1
        } )      
        console.log("end")
      })    
      console.log("materia end")      
    },
    reason =>{
      console.error("ERROR: materiaEnrollment failed:"+ reason)
    })
  }

  

  loadExamsForRow(materia_id:string, exams:Array<any>):Promise<void>{

    var _resolve
    var _reject

    return new Promise<void>((resolve, reject) =>{
      _resolve = resolve
      _reject = reject
      const query = db.collection("exams")
      .where("isDeleted","==",false)
      .where("materia_id","==",materia_id)
      query.get().then( set => {
  
        var map = set.docs.map( doc =>{
  
          var exam = {
            materia_id:doc.data().materia_id,
            label:doc.data().label,
            id:doc.data().id,
            isReleased:false
          }  
          
          exams.push(exam)
   
          
          const grades = db.collection("examGrades")
          .where("student_uid","==", this.userLoginService.getUserUid())
          .where("materia_id","==", materia_id)
          .where("exam_id","==",exam.id)
          .where("isDeleted","==",false)
    
          return grades.get().then( grades => {
  
            for( var j=0; j<grades.docs.length; j++){
              var eg = copyObj(new ExamGrade(), grades.docs[j].data())
              exam["examGrade"] = eg              
            }          
  
          },
          reason =>{
            exams.sort((a,b) =>{
              if( a.label > b.label){
                return 1
              }
              else{
                return -1
              }
            })
            console.error("ERROR reading examGrades:" + reason )
          })
        },
        reason =>{
          console.error("ERROR: ")
        })
        Promise.all(map).then(()=>{ 
          _resolve()
        })
      })
  
    })
  }

  onOpenExamGrade( examGrade_id ){
    this.router.navigate(['/report',{examGrade_id:examGrade_id}]);
  }

  loadMaterias(){
    this.materias.length = 0
    db.collection("materias")
    .where("isDeleted","==", false)
    .where("isEnrollmentActive", "==", true)
    .get().then( set =>{
      set.docs.map( doc =>{
        var m = new Materia()
        copyObj(m, doc.data())
        this.materias.push( m )
      })
      this.materias.sort( (a,b) => {
        if( a.materia_name > b.materia_name ){
          return 1
        }
        else return -1
      })
    })
  }

  onEnrollar(materia_id){
    if( this.isLoggedIn() ){
      this.examenesImprovisacionService.createMateriaEnrollment(this.userPreferencesService.getCurrentOrganizationId(), materia_id,this.userLoginService.getUserUid()).then( () =>{
        alert("Usted ha sido enrollado en esta materia.")
        this.update()
      },
      reason => {
        alert("usted ya esta enrollado en esta materia")
      })
    }
    else{
      this.router.navigate(['/loginForm'])
    }
  }
}
