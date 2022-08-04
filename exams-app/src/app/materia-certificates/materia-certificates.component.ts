import { AfterViewInit, Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { MateriaCertificatesDataSource, NodeTableRow } from './materia-certificates-datasource';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { db } from 'src/environments/environment';
import { UserPreferencesService } from '../user-preferences.service';
import { SortingService } from '../sorting.service';
import { UserLoginService } from '../user-login.service';
import { copyObj, Materia, MateriaEnrollment, User, ExamGrade, Exam } from '../exams/exams.module';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';

import * as uuid from 'uuid';
import { RouterLinkWithHref } from '@angular/router';

@Component({
  selector: 'app-materia-certificates',
  templateUrl: './materia-certificates.component.html',
  styleUrls: ['./materia-certificates.component.css']
})
export class MateriaCertificatesComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<NodeTableRow>;
  dataSource: MateriaCertificatesDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['student_name', 'approved', 'certificate_url'];

  studentsListener = null
  materiaListener = null
  examListener = null

  nodeList = Array<NodeTableRow>()
  open_transactions:Set<string> = new Set()

  constructor(
      private userPreferencesService:UserPreferencesService
    , private sortingService:SortingService
    , private userLoginService:UserLoginService
    , public dialog: MatDialog
    , private examImprovisacionService: ExamenesImprovisacionService
  ){}
  ngOnInit() {
  
  }

  ngAfterViewInit() {
    this.loadStudents().then( () =>{
      this.update()
    })
  }

  update(){
    this.dataSource = new MateriaCertificatesDataSource(this.nodeList)
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource; 
  }

  loadStudents():Promise<void>{

    return new Promise<void>((resolve, reject) =>{
      this.nodeList.length = 0
      
      var request = {
      }

      this.userLoginService.getUserIdToken().then( token =>{
        this.examImprovisacionService.authApiInterface("getUserList", token, request).then(
          data => {
            var users = data["result"]
            for( const user of users){
              var u:User =
              {
                uid:user.uid,
                displayName:user.displayName,
                email:user.email,
                claims:user.claims

              }
              var userNode:NodeTableRow = {
                user:u,
                opened:false,
                children:null,
                nodeClass:"User",
                isLeaf:false
              }
              this.nodeList.push(userNode)
            }
            resolve()
          },
          error => {
            alert("error retriving the users:" + error.error)
            reject()
          }
        );
      },
      reason =>{
        console.error("token invalido")
      })
    })
    
  }  

  loadEnrollmentForRow(row:NodeTableRow){
    if(row.children != null){
      row.children.length = 0
    }
    else{
      row.children = []
    }
    
    const query = db.collection("materiaEnrollments").
    where("isActive","==",true).
    where("student_uid","==",row.user.uid)

    query.get().then( recordset =>{
      var children:NodeTableRow[] = []
      const resultMap = recordset.docs.map( (doc) => {

        const materiaEnrollment:MateriaEnrollment = doc.data() as MateriaEnrollment

        var n:NodeTableRow = {
          user:row.user,
          materiaEnrollment:materiaEnrollment,
          opened:false,
          nodeClass:"MateriaEnrollment",
          children:null,
          isLeaf:false
        }
        return db.collection("materias").doc(materiaEnrollment.materia_id).get().then( doc =>{
          var materia:Materia = doc.data() as Materia
          n.materia = materia
          children.push(n)
           
        },
        reason =>{
          console.error("ERROR error reading materias:"+reason)
        }) 
      })
      Promise.all(resultMap).then( result =>{
        children.sort( (a,b) => { return a.materia.materia_name>b.materia.materia_name ? 1:-1})
        children.map( value => row.children.push(value))
        row.opened = true
        this.update()
      },
      reason =>{
        console.error("ERROR reasing materia name:" + reason)
      })  
    },
    reason =>{
      console.error("ERROR reading materiaEnrollement:" + reason )
    }) 
  }

  onMateriaClick(row:NodeTableRow){
    if(row.opened == false){
      this.loadExamsForRow(row)
    }
    else{
      row.children.length=0
      row.opened=false
    }

  }  

  loadExamsForRow(row:NodeTableRow){
    if(row.children != null){
      row.children.length = 0
    }
    else{
      row.children = []
    }
    
    const query = db.collection("materias/" + row.materia.id + "/exams").
    where("isDeleted","==",false)
    query.get().then( set => {
      var children:NodeTableRow[] = []
      var transaction = set.docs.map( doc =>{

        var exam:Exam = doc.data() as Exam
        var n:NodeTableRow = {
          user:row.user,
          materiaEnrollment: row.materiaEnrollment,
          materia:row.materia,
          exam:exam,
          examGrade:null,
          opened:false,
          nodeClass:"Exam",
          children:null,
          isLeaf:true
        }
        children.push(n)   
        
        const grades = db.collection("examGrades")
        .where("student_uid","==", row.user.uid)
        .where("materia_id","==", row.materia.id)
        .where("exam_id","==",exam.id)
        .where("isDeleted","==",false)
        
  
        return grades.get().then( grades => {

          for( var j=0; j<grades.docs.length; j++){
            const g:ExamGrade = grades.docs[j].data() as ExamGrade
            if( n.examGrade == null){
              n.examGrade = g
            }
            else if( g.isReleased == true && g.applicationDate > n.examGrade.applicationDate ){
              n.examGrade = g
            }
          }          

        },
        reason=>{
          console.log("ERROR reading examGrades:" + reason)
        })
      })

      Promise.all(transaction).then(()=>{
        children.sort( (a,b) =>{ return a.exam.label > b.exam.label ? 1:-1})
        row.opened = true 
        children.map( value => row.children.push(value))
        this.update() 
      })
    },
    reason =>{
      console.log("ERROR:loading exams:" + reason)
    })
  }

  getMateriaGrades(materia_id:string, exam_id:string, student_uid:string, materiaGrade:ExamGrade){
    var aspect_resolve = null
    return new Promise<void>((resolve, reject) =>{
      aspect_resolve = resolve 
      db.collection("examGrades")
      .where("materia_id","==",materia_id)
      .where("exam_id","==",exam_id)
      .where("student_uid","==", student_uid)
      //.where("isDeleted","==",false)    
      .get().then( set =>{
        var map = set.docs.map( doc =>{
          let mg = doc.data()
          copyObj(materiaGrade,mg)
          aspect_resolve()
        })
      },
      reason =>{
        alert("ERROR: " + reason)
        reject()
      })
    })             
  }   

  onStudentClick(row:NodeTableRow){
    if(row.opened == false){
      this.loadEnrollmentForRow(row)
    }
    else{
      row.children.length=0
      row.opened=false
    }

  }

  /**** Student */

  onMateriaEnroll(row){
    var materiaEnrollment:MateriaEnrollment = {
      organization_id: this.userPreferencesService.getCurrentOrganizationId(),
      id:null,
      student_uid:row.user.uid,
      materia_id:null
    }

    const dialogRef = this.dialog.open(DialogEnrollMateriaDialog, {
      height: '400px',
      width: '250px',
      data: materiaEnrollment
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if( result != undefined ){
        console.debug( result )
        this.examImprovisacionService.createMateriaEnrollment(this.userPreferencesService.getCurrentOrganizationId(), result.materia_id, result.student_uid).then( ()=>{
          this.loadEnrollmentForRow(row)
        })
             
      }
      else{
        console.debug("none")
      }
    });
  }
  
  
  onMateriaUnEnroll(row:NodeTableRow){
    db.collection("materiaEnrollments").doc(row.materiaEnrollment.id).update({isActive:false}).then( () =>{
      console.log("removing materiaEnrollment:")
      this.loadStudents().then( ()=>{
        this.update()
      })
    },
    reason =>{
      console.error("ERROR removing materiaEnrollment")
    })
  }  
  onEnrollmentEdit(student){
    const dialogRef = this.dialog.open(DialogEnrollMateriaDialog, {
      height: '400px',
      width: '250px',
      data: {id:student.id, student_name:student.nivel_name }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if( result != undefined ){
        console.debug( result )
        db.collection('students').doc(result.id).update(
          {
            student_name:result.student_name,
            email:result.email
          });
      }
      else{
        console.debug("none")
      }
    });
  }
  onCopyToClipboard(){
    alert("url ha sido copiada al portapapeles")
  }  
  onExamWaiver(row){
    console.log(row)
    if( row.examGrade != null ){
      let examGrade:ExamGrade = {
        isCompleted:true,
        isReleased:true,
        isApproved:true,
        updated_on:new Date()
      }
      db.collection("examGrades").doc(row.examGrade.id).update(
        examGrade
      ).then( () =>{
        row.examGrade.isCompleted = true
        row.examGrade.isReleased = true
        row.examGrade.isApproved = true
        this.loadStudents().then(()=>{
          this.update()
        })
      })
    }
    else{
      let id = uuid.v4()
      db.collection("examGrades").doc(id ).set( {id:id} ).then( ()=>{

        let examGrade:ExamGrade = {
          id:id, 
          exam_id:row.exam.id,
          materia_id:row.materia.id, 
          isCompleted: true,
          applicationDate:new Date(),
          student_uid:row.user.uid, 
          title:"acreditado por:" + this.userLoginService.getDisplayName(),
          expression:"ninguna",
          score:10,
          isDeleted:false, 
          isReleased:true, 
          isApproved:true,
          created_on:new Date(),
          updated_on:new Date()   
        }
        db.collection("examGrades").doc(id ).update( examGrade ).then( ()=>{
          row.examGrade = examGrade
          this.loadStudents().then(()=>{
            this.update()
          })
        })
      })
    }
  }


}

/****** student dlg */
/* do not forget to add the dialog to the app.module.ts*/
@Component({
  selector: 'enroll-materia-dlg',
  templateUrl: 'enroll-materia-dlg.html',
})
export class DialogEnrollMateriaDialog implements OnInit{ 

  materiasList:Array<Materia> = null
  constructor(
    private userLoginService: UserLoginService
    ,public dialogRef: MatDialogRef<DialogEnrollMateriaDialog>,
    @Inject(MAT_DIALOG_DATA) public data: MateriaEnrollment) {}

  ngOnInit(): void {
    this.LoadMaterias()
  }

  async LoadMaterias(){
    this.materiasList = []
    const query = db.collection("materias").
    where("isDeleted","==",false)

    var listMaterias = await query.get()
      
    listMaterias.forEach(doc =>{
      var materia:Materia = {
        id:doc.data().id,
        materia_name:doc.data().materia_name
      }
      this.materiasList.push(materia)
    })
    this.materiasList.sort((a,b) => {return a.materia_name > b.materia_name ? 1:-1})
  }
}

