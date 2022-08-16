import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserPreferencesService } from '../user-preferences.service';
import { db } from 'src/environments/environment';
import { Career, CareerAdvance, Group, GroupGrade, GROUP_GRADES_TYPES, Level, Materia, MateriaEnrollment, User } from '../exams/exams.module';
import { UserLoginService } from '../user-login.service';
import { ExamenImprovisacionFormComponent } from '../examen-improvisacion-form/examen-improvisacion-form.component';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';



@Component({
  selector: 'app-career-user',
  templateUrl: './career-user.component.html',
  styleUrls: ['./career-user.component.css']
})
export class CareerUserComponent implements OnInit {

  career_id:string
  user_uid:string
  user_displayName:string
  organization_id:string

  careerUser = null

  constructor(
    private route:ActivatedRoute,
    private userPreferences:UserPreferencesService,
    private userLogin:UserLoginService,
    private examImprovisationService:ExamenesImprovisacionService
  ) { 

    this.organization_id = this.userPreferences.getCurrentOrganizationId()

    this.career_id = this.route.snapshot.paramMap.get("career_id")
    
    if( this.userLogin.hasRole("role-admin-" + this.organization_id) ){
      this.user_uid = this.route.snapshot.paramMap.get("user_uid")
    }
    else{
      this.user_uid = this.userLogin.getUserUid()
    }
      
    
  }

  ngOnInit(): void {
    this.examImprovisationService.getUser(this.user_uid).then( user =>{
      this.user_displayName = user.displayName
      this.loadCareers()
    })    
    
  }

  loadCareers(){
    db.collection("careers").doc( this.career_id ).get().then( doc =>{
       
      const career = doc.data() as Career
      const levels = []
      

      this.careerUser = {
        career:career,
        careerAdvance:null,
        levels:levels       
      }
      this.getCarrerAdvance(this.organization_id, this.career_id, this.user_uid).then( careerAdvance =>{
        this.careerUser.careerAdvance = careerAdvance
        this.loadLevels( this.career_id, this.careerUser.levels)
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
          this.loadGroupGrade( this.organization_id, career_id, this.user_uid, level_id, group.id).then( groupGrade =>{
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
            .where("student_uid","==", this.user_uid)
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
}
