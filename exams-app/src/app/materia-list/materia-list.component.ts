import { Component, OnInit } from '@angular/core';
import { Exam, ExamRequest, Materia, MateriaRequest } from '../exams/exams.module';
import { db } from 'src/environments/environment';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { UserLoginService } from '../user-login.service';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { UserPreferencesService } from '../user-preferences.service';

@Component({
  selector: 'app-materia-list',
  templateUrl: './materia-list.component.html',
  styleUrls: ['./materia-list.component.css']
})
export class MateriaListComponent implements OnInit {

  materias:Materia[] = []
 
  submitting = false

  organization_id:string

  constructor(
 
      private router: Router
    , private usetPreferenceService:UserPreferencesService
  ) { 
    this.organization_id = this.usetPreferenceService.getCurrentOrganizationId()
  }

  ngOnInit(): void {

    this.update()
  }

  update(){
    this.loadMaterias()
  }

  loadMaterias():Promise<void>{
    this.materias.length = 0
    return new Promise<void>((resolve, reject) =>{
      db.collection("materias")
      .where("organization_id","==", this.usetPreferenceService.getCurrentOrganizationId())
      .where("isDeleted","==", false)
      .get().then( snapshot =>{
        snapshot.docs.map( doc =>{
          const materia = doc.data() as Materia
          this.materias.push(materia)
        })

        this.materias.sort( (a,b) => {return a.materia_name > b.materia_name? 1:-1})
        resolve()
      },
      reason =>{
        reject()
      })
    })
  }


  onEditMateria(materia:Materia){
    this.router.navigate(['/materia-edit',{materia_id:materia.id}]);
  }
  onCreateMateria(){
    this.router.navigate(['/materia-edit',{materia_id:null}]);
  }

  onRemoveMateria(materia_id, materia_name){
    if( !confirm("Esta seguro de querer borrar la materia:" + materia_name) ){
      return
    }
    else{
      this.submitting = true
      db.collection("materias").doc(materia_id).update({"isDeleted":true}).then(()=>{
        this.submitting = false
        this.update() 
      })

    }
    
  }  

}
