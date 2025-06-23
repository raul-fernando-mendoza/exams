import { Component, Input, OnInit, signal } from '@angular/core';
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
import { MatToolbarModule } from '@angular/material/toolbar';

interface MateriaItem{ 
  materia:Materia 
  materiaEnrollment:MateriaEnrollment 
}


interface GroupItem{
  group:Group
  groupGrade:GroupGrade
  materias:Array<Materia>
}

interface LevelItem{
  level:Level
  groupItems:Array<GroupItem>
}

      


@Component({
  selector: 'app-career-user',
  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule   
    ,MatCardModule 
    ,MatProgressSpinnerModule 
    ,MatToolbarModule
  ],   
  templateUrl: './career-user.component.html',
  styleUrls: ['./career-user.component.css']
})
export class CareerUserComponent implements OnInit {
  
  @Input() career:Career
  @Input() useruid:string
  user_displayName:string
  organization_id:string

  isAdmin:boolean = false

  careerAdvance = signal<CareerAdvance>(null)
  levelItems = signal<Array<LevelItem>>(null)

  submitting = signal(false)

  constructor(
    private route:ActivatedRoute,
    private userPreferences:UserPreferencesService,
    private userLogin:UserLoginService,
    private examImprovisationService:ExamenesImprovisacionService,
    private router:Router
  ) { 

    this.organization_id = this.userPreferences.getCurrentOrganizationId()
    
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
      this.load()
    })    
  }

  load():Promise<void>{
    return new Promise<void>((resolve, reject) =>{
      let transactions = []

      let a = this.getCarrerAdvance(this.organization_id, this.career.id, this.useruid).then( careerAdvance =>{
        this.careerAdvance.set(careerAdvance)

      })
      transactions.push(a)
      let l =  this.loadLevels( this.career.id).then( levelItems =>{
          this.levelItems.set(levelItems)
      })        
      transactions.push(l)
      Promise.all(transactions).then( ()=>{
        resolve()
      })
    })
  }
  loadLevels( career_id ):Promise<Array<LevelItem>>{
    return new Promise<Array<LevelItem>>((resolve, reject) =>{
      
      db.collection("careers/" + career_id + "/levels").get().then( set =>{
        let levels = new Array<LevelItem>()
        let transactions = set.docs.map( doc =>{
          const level:Level = doc.data() as Level
          let levelItem:LevelItem = {
            level: level,
            groupItems: undefined
          }
          levels.push( levelItem )
          return this.loadGroups( career_id, level.id ).then( groupItems =>{
            levelItem.groupItems = groupItems
          })
        })
        Promise.all( transactions ).then( () =>{
          levels.sort( (a,b) => { return a.level.level_name > b.level.level_name ? 1:-1})
          resolve(levels)
        })
        
      })
    })
  }
  loadGroups( career_id, level_id ):Promise<Array<GroupItem>>{
    return new Promise<Array<GroupItem>>((resolve, reject) =>{
      db.collection("careers/" + career_id + "/levels/" + level_id + "/groups").get().then( set =>{
        let transactions = []
        let groupItems = Array<GroupItem>()
        set.docs.map( doc =>{
          const group:Group = doc.data() as Group
          var e:GroupItem = {
            group: undefined,
            groupGrade: undefined,
            materias: []
          } 
          groupItems.push( e )
          let t = this.loadGroupGrade( this.organization_id, career_id, this.useruid, level_id, group.id).then( groupGrade =>{
              e.groupGrade = groupGrade
          })
          transactions.push(t)
          let t2 = this.loadMaterias( career_id, level_id, group.id , e.materias)
          transactions.push(t2)
        })
        Promise.all(transactions).then( () =>{
          groupItems.sort( (a,b) => { return a.group.group_name > b.group.group_name ? 1:-1})
          resolve(groupItems)
        }) 
      })  
    })
  }
  loadMaterias( career_id, level_id, group_id, materias):Promise<Array<MateriaItem>>{
    return new Promise<Array<MateriaItem>>((resolve, reject)=>{
      db.collection("careers/" + career_id + "/levels/" + level_id + "/groups/" + group_id + "/materias").get().then( set =>{
        let materiaItems = Array<MateriaItem>()
        var map = set.docs.map( doc =>{
          const materia = doc.data() as Materia
          let materiaItem:MateriaItem= { materia:materia, materiaEnrollment:null }
          materiaItems.push( materiaItem )

          return db.collection( "materias").doc(materia["materia_id"]).get().then( doc =>{
            const materia = doc.data() as Materia
            
            if( this.userLogin.getUserUid() ){
              db.collection("materiaEnrollments")
              .where("isDeleted","==",false)
              .where("organization_id","==", this.organization_id)
              .where("student_uid","==", this.useruid)
              .where("materia_id","==", materia.id)
              .get().then( set =>{
                set.docs.map( doc =>{
                  const materiaEnrollment = doc.data() as MateriaEnrollment
                  materiaItem.materiaEnrollment = materiaEnrollment
                })
              })
            }
          })
        })
        Promise.all( map ).then( ()=>{
          materias.sort( (a,b) => { return a.materia.materia_name > b.materia.materia_name ? 1:-1})
          resolve( materiaItems )
        })
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
      careerId:this.career.id, 
      uid:this.useruid   
    }
    this.submitting.set(true)
    var thiz = this
    this.examImprovisationService.examServiceApiInterface("careerAdvanceStudentUpdate","", data).subscribe( {
      next(response) { 
        alert(response["result"])
        thiz.submitting.set(false)
        thiz.update()
      },
      error(err) { 
        alert('Error: ' + err.error.error); 
        thiz.submitting.set(false);
      },
      complete() { 
        console.log('Completado'); 
        thiz.submitting.set(false);        
      }
    })
  }

}
