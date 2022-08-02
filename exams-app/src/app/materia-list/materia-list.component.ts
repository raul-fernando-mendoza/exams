import { Component, OnInit } from '@angular/core';
import { Exam, ExamRequest, Materia, MateriaRequest } from '../exams/exams.module';
import { db } from 'src/environments/environment';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { UserLoginService } from '../user-login.service';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-materia-list',
  templateUrl: './materia-list.component.html',
  styleUrls: ['./materia-list.component.css']
})
export class MateriaListComponent implements OnInit {

  materias:Materia[] = []
 
  submitting = false

  constructor(
     private examImprovisacionService: ExamenesImprovisacionService
    , private userLoginService:UserLoginService
    , private fb: FormBuilder    
    , private router: Router
  ) { }

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
      .where("isDeleted","==", false)
      .get().then( snapshot =>{
        var transaction = snapshot.docs.map( doc =>{
          const materia = doc.data() as Materia
          this.materias.push(materia)
          return this.loadExams(materia)
        })
        Promise.all(transaction).then( () => {
          this.materias.sort( (a,b) => {return a.materia_name > b.materia_name? 1:-1})
          resolve()
        })
      },
      reason =>{
        reject()
      })
    })
  }

  loadExams(materia:Materia):Promise<void>{
    return new Promise<void>((resolve, reject) =>{

      materia.exams = []
      db.collection("materias/" + materia.id + "/exams")
      .where("isDeleted","==", false)
      .get().then( snapshot =>{
        var transaction = snapshot.docs.map( doc =>{
          const exam = doc.data() as Exam
          materia.exams.push(exam)
        })
        Promise.all(transaction).then( () => {
          materia.exams.sort( (a,b) => {return a.label > b.label? 1:-1})
          resolve()
        })
      },
      reason =>{
        console.log("ERROR reading exams:" + reason)
        reject()
      })
    })
  }
  onDeleteExam(materia:Materia, exam:Exam){
    db.collection("materias/" + materia.id + "/exams").doc(exam.id).update({"isDeleted":"true"}).then(
      result =>{
        console.log("exam delted")
        this.update()
      }
    )
  }
  onDuplicateExam(materia:Materia, exam:Exam){
    this.submitting = true
    
    this.duplicateExam(materia, exam).then( () =>{
      this.submitting = false
      this.update()
    },
    reason=>{
      alert("duplicate failed" + reason)
      this.submitting = false
    })
  }

  duplicateExam(materia:Materia, exam:Exam):Promise<void>{
    
    var _resolve
    var _reject
    return new Promise<null>((resolve, reject)=>{
      _resolve = resolve
      _reject = reject
      var req = {
        materias:{
          id:materia.id,
          exams:
            {
              id:exam.id,
              label:exam.label + "_copy"
            }
          
        }
      }
      this.userLoginService.getUserIdToken().then( token => {
        this.examImprovisacionService.firestoreApiInterface("dupSubCollection", token, req).subscribe(
          data => { 
            var exam:Exam = data["result"]
            this.update()
            _resolve()
          },   
          error => {  
            console.error( "ERROR: duplicando examen:" + JSON.stringify(req))
            _reject()
          }
        )
      },
      error => {
        alert("Error in token:" + error.errorCode + " " + error.errorMessage)
        this.submitting = false
      }) 
    }) 
       
  }

  onEdit(materia:Materia, exam:Exam){
    this.router.navigate(['/ei-tipo-edit',{materia_id:materia.id, exam_id:exam.id}]);
  }
}
