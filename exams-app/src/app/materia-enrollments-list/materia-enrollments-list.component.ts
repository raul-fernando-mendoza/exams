import { Component, OnInit , OnDestroy} from '@angular/core';
import { LaboratoryGrade, Materia, MateriaEnrollment } from '../exams/exams.module';
import { UserLoginService } from '../user-login.service';
import { UserPreferencesService } from '../user-preferences.service';
import { db } from 'src/environments/environment';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface MyEnrollment {
  enrollment_id:string
  materia_id:string
  materia_name:string
  certificateUrl:string
  iconCertificateUrl:string
  certificateBadgeUrl?:string
}

@Component({
  selector: 'app-materia-enrollments-list',
  standalone: true,
  imports: [
    MatCardModule
    ,MatProgressSpinnerModule
  ],  

  templateUrl: './materia-enrollments-list.component.html',
  styleUrls: ['./materia-enrollments-list.component.css']
})
export class MateriaEnrollmentsListComponent implements OnInit , OnDestroy{

  unsubscribe = null
  organization_id = null
  isAdmin = false
  submitting = false
  userUid = null

  constructor(
      private userPreferenceService:UserPreferencesService
    , private userLoginService:UserLoginService
    , private router: Router

  ) { }
  ngOnDestroy(): void {
    this.unsubscribe()
  }

  myEnrollments = []

  ngOnInit(): void {
    this.organization_id = this.userPreferenceService.getCurrentOrganizationId()
    this.isAdmin = this.userLoginService.hasRole("role-admin-" + this.organization_id)
    this.userUid = this.userLoginService.getUserUid() 
    this.loadMateriaEnrollment()   
  }

  loadMateriaEnrollment(){
    

    if( this.userLoginService.getUserUid() ){
      this.submitting = true
      this.unsubscribe = db.collection("materiaEnrollments")
      .where("organization_id", "==", this.organization_id)
      .where("student_uid","==",this.userLoginService.getUserUid())
      .where("isDeleted",'==',false)
      .onSnapshot( set =>{
        this.myEnrollments.length = 0

        let transaction:Array<Promise<void>> = set.docs.map( doc =>{
          console.log("processing enrollment:" + doc.data())
          var materiaEnrollment:MateriaEnrollment = doc.data() as MateriaEnrollment
          

          const materia_id = doc.data().materia_id

          return db.collection("materias").doc(materia_id).get().then( doc=>{
            var materia:Materia = doc.data() as Materia
            materiaEnrollment.materia = materia
            var myEnrollment:MyEnrollment = {
              enrollment_id:materiaEnrollment.id,
              materia_id:materia_id,
              materia_name:materiaEnrollment.materia.materia_name,
              certificateUrl:materiaEnrollment.certificateUrl,
              iconCertificateUrl:materia.materiaIconUrl,
              certificateBadgeUrl: materiaEnrollment.certificateBadgeUrl
            }
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
          this.submitting = false
        })    
        console.log("materia end")      
      },
      reason =>{
        console.error("ERROR: materiaEnrollment failed:"+ reason)
      })
    }
  }
  onMateriaDetalles(materia_id){
    this.router.navigate(['/materia-edit',{materia_id:materia_id}])
  }

}
