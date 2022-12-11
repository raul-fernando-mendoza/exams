import { Component, OnInit } from '@angular/core';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { UserLoginService } from '../user-login.service';

import { db } from 'src/environments/environment';
import { Career, copyObj, Exam, ExamGrade, Laboratory, LaboratoryGrade, Materia, MateriaEnrollment, LaboratoryGradeStatus } from '../exams/exams.module';
import { SortingService } from '../sorting.service';
import { ExamgradesReportComponent } from '../examgrades-report/examgrades-report.component';
import { ActivatedRoute, RouteConfigLoadEnd, Router } from '@angular/router';
import { UserPreferencesService } from '../user-preferences.service';
import { map } from 'rxjs/operators';
import * as uuid from 'uuid';
import { ExamFormService } from '../exam-form.service';
import { DateFormatService } from '../date-format.service';

interface MyExam {
  examGrade_id:string
  exam_name:string
  isReleased:boolean
  isRequired:boolean
}

interface MyLaboratory {
  laboratoryGrade_id:string
  laboratory_name:string
  isReleased:boolean
  isRequired:boolean
}

interface MyEnrollment {
  enrollment_id:string
  materia_name:string
  certificateUrl:string
  iconCertificateUrl:string
  certificateBadgeUrl?:string
  exams:MyExam[],
  laboratories:LaboratoryGrade[]
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
    , private dateFormatService:DateFormatService
    , private sortingService:SortingService
    , private userPreferencesService:UserPreferencesService
    , private examFormService:ExamFormService) { 
      this.organization_id = userPreferencesService.getCurrentOrganizationId()
    }

  
  myEnrollments:MyEnrollment[] = []
  materias:Array<Materia> = []
  organization_id:string = null
  careers:Career[] = null
  

  ngOnInit(): void {
    this.loadCareers()
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

    if( this.userLoginService.getUserUid() ){
      db.collection("materiaEnrollments")
      .where("organization_id", "==", this.organization_id)
      .where("student_uid","==",this.userLoginService.getUserUid())
      .where("isDeleted",'==',false)
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
              certificateUrl:materiaEnrollment.certificateUrl,
              iconCertificateUrl:materia.materiaIconUrl,
              certificateBadgeUrl: materiaEnrollment.certificateBadgeUrl,
              exams:[],
              laboratories:[]
            }
            
            this.loadExamsForRow(materia_id, myEnrollment.exams)    
            this.loadLaboratoriesForRow(materia_id, myEnrollment.laboratories)      
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
          .where("organization_id", "==", this.organization_id )
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

  loadLaboratoriesForRow(materia_id:string, laboratories:Array<LaboratoryGrade>):Promise<void>{

    var _resolve
    var _reject

    return new Promise<void>((resolve, reject) =>{
      _resolve = resolve
      _reject = reject
      const query = db.collection("materias/" + materia_id + "/laboratory")
      .where("isDeleted","==",false)
      query.get().then( set => {
  
        var map = set.docs.map( doc =>{
  
          var laboratory:Laboratory = doc.data() as Laboratory
          var laboratoryGrade:LaboratoryGrade = { 
            id:null, 
            organization_id:this.organization_id,
            materia_id:materia_id,
            laboratory_id:laboratory.id,          
            laboratory_name:laboratory.label,
            student_uid:this.userLoginService.getUserUid(),
            status:LaboratoryGradeStatus.initial,
            studentData:null
          }
          laboratories.push(laboratoryGrade)

          const grades = db.collection("laboratoryGrades")
          .where("organization_id", "==", this.organization_id )
          .where("student_uid","==", this.userLoginService.getUserUid())
          .where("materia_id","==", materia_id)
          .where("laboratory_id","==",laboratory.id)
    
          return grades.get().then( snapshot => {
  
            snapshot.docs.map( doc =>{
              var existingLaboratoryGrade:LaboratoryGrade = doc.data() as LaboratoryGrade
              laboratoryGrade.id = existingLaboratoryGrade.id
              laboratoryGrade.status = existingLaboratoryGrade.status
            })
          })
        })
        Promise.all(map).then(()=>{ 
          laboratories.sort( (a,b)=>{return a.laboratory_name > b.laboratory_name ? 1 : -1})
          _resolve()
        })
      },
      reason =>{
        console.error("ERROR: ")
      })

    })
  }

  onOpenExamGrade( examGrade_id ){
    this.router.navigate(['/report',{examGrade_id:examGrade_id}]);
  }

  loadMaterias(){
    this.materias.length = 0
    db.collection("materias")
    .where("organization_id","==",this.userPreferencesService.getCurrentOrganizationId())
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

  onMateriaDetalles(materia_id){
      this.router.navigate(['/materia-edit',{materia_id:materia_id}])
  }

  loadCareers(){
    this.careers = []
    db.collection("careers")
    .where( "organization_id" , "==", this.organization_id)
    .where( "isDeleted", "==", false)
    .get().then( set =>{
      set.docs.map( doc =>{
        const career:Career = doc.data() as Career
        this.careers.push( career)
      })
      this.careers.sort( (a,b) =>{ return a.career_name > b.career_name?1:-1 })
      
    })
  }

  onCareerDetails(career_id:string){
    this.router.navigate(['career-edit',{ id:career_id }])
  }

  onCareerMyProgress(career_id:string){
    this.router.navigate(['career-user',{ user_uid:this.userLoginService.getUserUid(), career_id:career_id }])
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
  laboratoryStatusName( status:LaboratoryGradeStatus ):string{
    var statusName:string = ""
    switch( status ){
      case LaboratoryGradeStatus.initial: statusName = "Pending"
        break
      case LaboratoryGradeStatus.accepted: statusName = "Approvado"
        break
      case LaboratoryGradeStatus.requestGrade: statusName = "Enviado"
        break
      case LaboratoryGradeStatus.rework: statusName = "Retrabajo"
        break
    }
    return statusName
  }
}
