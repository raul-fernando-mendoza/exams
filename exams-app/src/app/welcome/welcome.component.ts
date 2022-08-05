import { Component, OnInit } from '@angular/core';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { UserLoginService } from '../user-login.service';

import { db } from 'src/environments/environment';
import { copyObj, Exam, ExamGrade, Materia, MateriaEnrollment } from '../exams/exams.module';
import { SortingService } from '../sorting.service';
import { ExamgradesReportComponent } from '../examgrades-report/examgrades-report.component';
import { RouteConfigLoadEnd, Router } from '@angular/router';
import { UserPreferencesService } from '../user-preferences.service';

interface MyExam {
  examGrade_id:string
  exam_name:string
  isReleased:boolean
  isRequired:boolean
}

interface MyEnrollment {
  enrollment_id:string
  materia_name:string
  certificate_public_url:string
  iconCertificate:string
  exams:MyExam[]
}

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

  
  myEnrollments:MyEnrollment[] = []
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
    this.myEnrollments.length = 0

    if( !this.isLoggedIn() ){
      return
    }

    db.collection("materiaEnrollments")
    .where("student_uid","==",this.userLoginService.getUserUid())
    .where("isActive",'==',true)
    .get().then( set =>{
      console.log("materia start")
      let transaction:Array<Promise<void>> = set.docs.map( doc =>{
        console.log("processing enrollment:" + doc.data())
        var materiaEnrollment:MateriaEnrollment = doc.data() as MateriaEnrollment
        

        const materia_id = doc.data().materia_id

        return db.collection("materias").doc(materia_id).get().then( doc=>{
          var materia:Materia = doc.data() as Materia
          materiaEnrollment.materia = materia
          var myEnrollment:MyEnrollment = {
            enrollment_id:materiaEnrollment.id,
            materia_name:materiaEnrollment.materia.materia_name,
            certificate_public_url:materiaEnrollment.certificate_public_url,
            iconCertificate:materia.iconCertificate,
            exams:[]
          }
          
          this.loadExamsForRow(materia_id, myEnrollment.exams)          
          this.myEnrollments.push(myEnrollment)      
        })
        
        
      })

      
      Promise.all(transaction).then(()=>{
        this.myEnrollments.sort( (a,b) => {
          if( a.materia_name > b.materia_name ){
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

  

  loadExamsForRow(materia_id:string, exams:Array<MyExam>):Promise<void>{

    var _resolve
    var _reject

    return new Promise<void>((resolve, reject) =>{
      _resolve = resolve
      _reject = reject
      const query = db.collection("materias/" + materia_id + "/exams")
      .where("isDeleted","==",false)
      query.get().then( set => {
  
        var map = set.docs.map( doc =>{
  
          var exam:Exam = doc.data() as Exam
          var myExam:MyExam = { 
            examGrade_id:null,           
            exam_name:exam.label,
            isReleased:false,
            isRequired:exam.isRequired
          }
          exams.push(myExam)

          const grades = db.collection("examGrades")
          .where("student_uid","==", this.userLoginService.getUserUid())
          .where("materia_id","==", materia_id)
          .where("exam_id","==",exam.id)
          .where("isDeleted","==",false)
    
          return grades.get().then( snapshot => {
  
            snapshot.docs.map( doc =>{
              var examGrade:ExamGrade = {
                id:doc.data().id,
                title:doc.data().title,
                isReleased:doc.data().isReleased
              }
              myExam.examGrade_id = examGrade.id
              myExam.isReleased = examGrade.isReleased
            })
          },
          reason =>{
            exams.sort((a,b) =>{ return a.exam_name > b.exam_name ? 1:-1 })
            console.error("ERROR reading examGrades:" + reason )
          })
        },
        reason =>{
          console.error("ERROR: ")
        })
        Promise.all(map).then(()=>{ 
          exams.sort( (a,b)=>{return a.exam_name > b.exam_name ? 1 : -1})
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
        var m:Materia = doc.data() as Materia
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
