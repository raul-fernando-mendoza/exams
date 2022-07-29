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
import { copyObj, Materia, MateriaEnrollment, User, ExamGrade } from '../exams/exams.module';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';

import * as uuid from 'uuid';

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

    this.update()
  }

  transactionStart(id){
    this.open_transactions.add(id)
  }
  transactionComplete(id){
    this.open_transactions.delete(id)
    if(this.open_transactions.size == 0){
      this.dataSource = new MateriaCertificatesDataSource(this.nodeList)
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.table.dataSource = this.dataSource; 
    }
  }  

  update(){
    this.loadStudents()
  }

  async loadStudents(){
    this.nodeList.length = 0
    var token = await this.userLoginService.getUserIdToken()
    var userList:NodeTableRow[] = []
    var request = {
    }

    this.transactionStart("users")

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
            obj:u,
            opened:false,
            children:null,
            nodeClass:"User",
            isLeaf:false
          }
          this.nodeList.push(userNode)
        }
        this.transactionComplete("users")
      },
      error => {
        alert("error retriving the users:" + error.error)
      }
    );
    
  }  

  loadEnrollmentForRow(row:NodeTableRow){
    if(row.children != null){
      row.children.length = 0
    }
    else{
      row.children = []
    }
    
    const query = db.collection("materiaEnrollments").
    where("owners","array-contains",this.userLoginService.getUserUid()).
    where("isActive","==",true).
    where("student_id","==",row.obj["uid"])

    this.transactionStart(row.obj["uid"])
/*
    console.log("start enrollments")
    query.get().then( recordset =>{
      const resultMap = recordset.docs.map( (enrollment) => {
        console.debug("materia" +  enrollment.data())
        return db.collection("materias").doc(enrollment.data().materia_id).get().then(
          m => {
            console.log("materia data:" + m)
          }
        )
      })

      Promise.all(resultMap).then( result =>{
        console.log("end all")
      })
      console.log("end all submaps.")
    })
    console.log("end enrollments")
*/

    query.get().then( recordset =>{
      const resultMap = recordset.docs.map( (ref) => {

        const enrollment = ref.data()
        console.log(enrollment)
        var materiaEnrollment = {
          organization_id:enrollment.organization_id,
          materia_id:enrollment.materia_id,
          materia_name:null,
          student_id:enrollment.student_id,
          id:ref.id,
          certificate_url:enrollment.certificate_url
        }
        var n:NodeTableRow = {
          obj:materiaEnrollment,
          opened:false,
          nodeClass:"MateriaEnrollment",
          children:null,
          isLeaf:false
        }
        return db.collection("materias").doc(enrollment.materia_id).get().then( ref =>{
          materiaEnrollment.materia_name = ref.data().materia_name
          row.children.push(n)
          row.opened = true 
          this.transactionComplete(row.obj["materia_id"]+row.obj["student_id"] )        
        }) 
      })
      Promise.all(resultMap).then( result =>{
        row.children = this.sortingService.sortBySubObject(row.children,"obj",["materia_name"])    
        this.transactionComplete(row.obj["uid"])
      })  
    }) 
  }

  onMateriaClick(row:NodeTableRow){
    if(row.opened == false){
      this.loadExamsForRow(row)
    }
    else{
      row.children.length=0
      row.opened=false
      this.transactionComplete(null)
    }

  }  

  loadExamsForRow(row:NodeTableRow){
    if(row.children != null){
      row.children.length = 0
    }
    else{
      row.children = []
    }
    
    const query = db.collection("exams").
    where("owners","array-contains",this.userLoginService.getUserUid()).
    where("isDeleted","==",false).
    where("materia_id","==",row.obj["materia_id"])
    this.transactionStart( row.obj["materia_id"])
    query.get().then( set => {

      var exams = set.docs.map( doc =>{

        var exam = {
          materia_id:doc.data().materia_id,
          label:doc.data().label,
          id:doc.data().id,
          isReleased:false
        }     
        var n:NodeTableRow = {
          obj:exam,
          opened:false,
          nodeClass:"Exam",
          children:null,
          isLeaf:true
        }
        row.children.push(n)   
        
        const grades = db.collection("examGrades").
        where("owners","array-contains",this.userLoginService.getUserUid())
        .where("student_uid","==", row.obj["student_id"])
        .where("materia_id","==", row.obj["materia_id"])
        .where("exam_id","==",exam.id)
        .where("isDeleted","==",false)
  
        return grades.get().then( grades => {

          for( var j=0; j<grades.docs.length; j++){
            const g = grades.docs[j].data()
            if( g.isReleased == true){
              exam["isReleased"] = true
              break;
            }
          }          

        })
      })

      Promise.all(exams).then(()=>{
        row.opened = true 
        row.children = this.sortingService.sortBySubObject(row.children,"obj",["label"])    
        this.transactionComplete(row.obj["materia_id"] )
      })
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
      this.transactionComplete(null)
    }

  }

  




  /**** Student */

  onMateriaEnroll(row){
    var materiaEnrollment:MateriaEnrollment = {
      organization_id: this.userPreferencesService.getCurrentOrganizationId(),
      id:null,
      student_id:row.obj.uid,
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
        this.createMateriaEnrollment(result.materia_id, result.student_id)
        this.loadEnrollmentForRow(row)     
      }
      else{
        console.debug("none")
      }
    });
  }
  
  async createMateriaEnrollment(materiaId:string, studentId:string){
    var id = uuid.v4()
  
    const materiaEnrollment:MateriaEnrollment = {
      organization_id:this.userPreferencesService.getCurrentOrganizationId(),
      id:id,
      student_id:studentId,
      materia_id:materiaId,
      owners:[this.userLoginService.getUserUid()],
      isActive:true
    }
    const res = await  db.collection('materiaEnrollments').doc(id).set(materiaEnrollment);
    
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
    where("owners","array-contains",this.userLoginService.getUserUid()).
    where("isDeleted","==",false)

    var listMaterias = await query.get()
      
    listMaterias.forEach(doc =>{
      var materia:Materia = new Materia()
      copyObj(materia, doc.data())
      this.materiasList.push(materia)

    })
  }



}

