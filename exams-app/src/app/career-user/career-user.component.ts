import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserPreferencesService } from '../user-preferences.service';
import { db } from 'src/environments/environment';
import { Career, CareerAdvance, Group, GroupGrade, GROUP_GRADES_TYPES, Level, Materia, MateriaEnrollment, User } from '../exams/exams.module';
import { UserLoginService } from '../user-login.service';
import { ExamenImprovisacionFormComponent } from '../examen-improvisacion-form/examen-improvisacion-form.component';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@Component({
  selector: 'app-career-user',
  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule   
    ,MatCardModule 
    ,MatProgressSpinnerModule 
  ],   
  templateUrl: './career-user.component.html',
  styleUrls: ['./career-user.component.css']
})
export class CareerUserComponent implements OnInit {
  
  @Input() careerid:string
  @Input() useruid:string
  user_displayName:string
  organization_id:string

  isAdmin:boolean = false

  careerUser = null

  submitting = false

  constructor(
    private route:ActivatedRoute,
    private userPreferences:UserPreferencesService,
    private userLogin:UserLoginService,
    private examImprovisationService:ExamenesImprovisacionService,
    private router:Router
  ) { 

    this.organization_id = this.userPreferences.getCurrentOrganizationId()

    if( this.careerid == null){
      this.careerid = this.route.snapshot.paramMap.get("career_id")
      this.useruid = this.route.snapshot.paramMap.get("user_uid")
    }
    
    if( this.userLogin.hasRole("role-admin-" + this.organization_id) ){
      this.isAdmin = true
    }
  }

  ngOnInit(): void {
    this.update()
    
  }

  update(){
    this.examImprovisationService.getUser(this.useruid).then( user =>{
      this.user_displayName = user.displayName
      this.loadCareers()
    })    
  }

  loadCareers(){
    db.collection("careers").doc( this.careerid ).get().then( doc =>{
       
      const career = doc.data() as Career
      const levels = []
      

      this.careerUser = {
        career:career,
        careerAdvance:null,
        levels:levels       
      }
      this.getCarrerAdvance(this.organization_id, this.careerid, this.useruid).then( careerAdvance =>{
        this.careerUser.careerAdvance = careerAdvance
        this.loadLevels( this.careerid, this.careerUser.levels)
      })


      
    })
  }
  loadLevels( career_id, levels){
    db.collection("careers/" + career_id + "/levels").get().then( set =>{
      set.docs.map( doc =>{
        const level:Level = doc.data() as Level
        var e = { level:level, groups:[] }
        levels.push( e )
        this.loadGroups( career_id, level.id, e.groups )
      })
      levels.sort( (a,b) => { return a.level.level_name > b.level.level_name ? 1:-1})
    })
  }
  loadGroups( career_id, level_id, groups ){
    db.collection("careers/" + career_id + "/levels/" + level_id + "/groups").get().then( set =>{
      set.docs.map( doc =>{
        const group:Group = doc.data() as Group
        var e = { 
          group:group, 
          groupGrade:null,
          materias:[] } 
        groups.push( e )
        if( this.careerUser.careerAdvance){
          this.loadGroupGrade( this.organization_id, career_id, this.useruid, level_id, group.id).then( groupGrade =>{
            e.groupGrade = groupGrade
          })
        }
        this.loadMaterias( career_id, level_id, group.id , e.materias)
      })
      groups.sort( (a,b) => { return a.group.group_name > b.group.group_name ? 1:-1})
    })    
  }
  loadMaterias( career_id, level_id, group_id, materias){
    db.collection("careers/" + career_id + "/levels/" + level_id + "/groups/" + group_id + "/materias").get().then( set =>{
      var map = set.docs.map( doc =>{
        const materia = doc.data()

        return db.collection( "materias").doc(materia["materia_id"]).get().then( doc =>{
          const materiaDetail = doc.data() as Materia
          var e = { materia:materiaDetail, materiaEnrollment:null } 
          materias.push( e )
          if( this.userLogin.getUserUid() ){
            db.collection("materiaEnrollments")
            .where("isDeleted","==",false)
            .where("organization_id","==", this.organization_id)
            .where("student_uid","==", this.useruid)
            .where("materia_id","==", materia.id)
            .get().then( set =>{
              set.docs.map( doc =>{
                const materiaEnrollment = doc.data() as MateriaEnrollment
                e.materiaEnrollment = materiaEnrollment
              })
            })
          }
        })
      })
      Promise.all( map ).then( ()=>{
        materias.sort( (a,b) => { return a.materia.materia_name > b.materia.materia_name ? 1:-1})
      })
    })   
  }

  getGroupGradeDescription(group_grade_type_id:number){
    var desc = "Not found"
    GROUP_GRADES_TYPES.map( ggt =>{
      if( ggt.id == group_grade_type_id){
        desc = ggt.description
      }
    })
    return desc
  }

  getCarrerAdvance( organization_id, career_id, user_uid):Promise<CareerAdvance>{
    return new Promise<CareerAdvance>(( resolve, reject)=>{
      db.collection("careerAdvance") 
      .where( "organization_id" , "==", organization_id) 
      .where( "career_id","==", career_id)
      .where( "student_uid", "==", user_uid)
      .get().then( set =>{
        var careerAdvance:CareerAdvance = null
        set.docs.map( doc =>{
          careerAdvance = doc.data() as CareerAdvance        
        })
        resolve(careerAdvance)
      },
      reason =>{
        alert("ERROR: error reading advance:" + reason)
        reject(null)
      })
      
    })
    
  }
  loadGroupGrade( organization_id, career_id, user_uid, level_id, group_id):Promise<GroupGrade>{
    return new Promise<GroupGrade>(( resolve, reject) =>{
      db.collection( "careerAdvance/" + organization_id + "-" + career_id + "-" + user_uid + "/levels/" + level_id + "/groups").doc(group_id).get().then( doc =>{
        var groupGrade:GroupGrade = doc.data() as GroupGrade
        resolve( groupGrade )
      },
      reason =>{
        alert("ERROR: reading groupGrade:" + reason)
        reject( null )
      })
    })
  }

  onMateriaDetalles(materia_id){
    this.router.navigate(['/materia-edit',{materia_id:materia_id}])
  }  

  to_json( o ){
    return JSON.stringify( o )
  }

  onCareerAdvanceUpdate(){
    var data = {
      organizationId:this.organization_id,
      careerId:this.careerid, 
      uid:this.useruid   
    }
    this.submitting = true
    var thiz = this
    this.examImprovisationService.examServiceApiInterface("careerAdvanceStudentUpdate","", data).subscribe( {
      next(response) { 
        alert(response["result"])
        thiz.submitting = false
        thiz.update()
      },
      error(err) { 
        alert('Error: ' + err.error.error); 
        thiz.submitting = false;
      },
      complete() { 
        console.log('Completado'); 
        thiz.submitting = false;        
      }
    })
  }

}
