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
import { Router, RouterLinkWithHref } from '@angular/router';
import { NONE_TYPE } from '@angular/compiler';

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
  displayedColumns = ['student_name', 'approved', 'certificate_public_url'];

  studentsListener = null
  materiaListener = null
  examListener = null

  nodeList = Array<NodeTableRow>()
  open_transactions:Set<string> = new Set()

  organization_id = null

  constructor(
      private userPreferencesService:UserPreferencesService
    , private sortingService:SortingService
    , private userLoginService:UserLoginService
    , public dialog: MatDialog
    , private examImprovisacionService: ExamenesImprovisacionService
    , private userPreferencesServide: UserPreferencesService
    , private router: Router
  ){
    this.organization_id = this.userPreferencesService.getCurrentOrganizationId()
  }
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
                isLeaf:false,
                parent:null
              }

              if( "role-estudiante-" + this.organization_id in u.claims ){
                this.nodeList.push(userNode)
              }
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

  loadEnrollmentForRow(row:NodeTableRow):Promise<void>{
    return new Promise<void>((resolve, reject)=>{

      if(row.children != null){
        row.children.length = 0
      }
      else{
        row.children = []
      }
      
      const query = db.collection("materiaEnrollments").
      where("organization_id","==", this.organization_id).
      where("isDeleted","==",false).
      where("student_uid","==",row.user.uid)

      query.get().then( recordset =>{
        var children:NodeTableRow[] = []
        const resultMap = recordset.docs.map( (doc) => {

          const materiaEnrollment:MateriaEnrollment = doc.data() as MateriaEnrollment
          console.log("public_url:" + materiaEnrollment.certificate_public_url)

          var n:NodeTableRow = {
            user:row.user,
            materiaEnrollment:materiaEnrollment,
            opened:false,
            nodeClass:"MateriaEnrollment",
            children:null,
            isLeaf:false,
            parent:row
          }
          children.push(n)
          return db.collection("materias").doc(materiaEnrollment.materia_id).get().then( doc =>{
            var materia:Materia = doc.data() as Materia
            n.materia = materia                        
          },
          reason =>{
            console.error("ERROR error reading materias:"+reason)
            reject()
          }) 
        })
        Promise.all(resultMap).then( result =>{
          children.sort( (a,b) => { return a.materia.materia_name>b.materia.materia_name ? 1:-1})
          children.map( value => row.children.push(value))
          row.opened = true
          resolve()
        },
        reason =>{
          console.error("ERROR reasing materia name:" + reason)
          reject()
        })  
      },
      reason =>{
        console.error("ERROR reading materiaEnrollement:" + reason )
      }) 
    })

  }

  onMateriaClick(row:NodeTableRow){
    if(row.opened == false){
      this.loadExamsForRow(row).then(()=>{
        this.update()
      })
    }
    else{
      row.children.length=0
      row.opened=false
    }

  }  

  loadExamsForRow(row:NodeTableRow):Promise<void>{
    return new Promise((resolve, reject)=>{
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
            isLeaf:true,
            parent:row
          }
          children.push(n)   
          
          const grades = db.collection("examGrades")
          .where("organization_id","==", this.organization_id)
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
            reject()
          })
        })

        Promise.all(transaction).then(()=>{
          children.sort( (a,b) =>{ return a.exam.label > b.exam.label ? 1:-1})
          row.opened = true 
          children.map( value => row.children.push(value))
          resolve() 
        })
      },
      reason =>{
        console.log("ERROR:loading exams:" + reason)
        reject()
      })
    })
  }

  getMateriaGrades(materia_id:string, exam_id:string, student_uid:string, materiaGrade:ExamGrade){
    var aspect_resolve = null
    return new Promise<void>((resolve, reject) =>{
      aspect_resolve = resolve 
      db.collection("examGrades")
      .where("organization_id", "==", this.organization_id)
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
      this.loadEnrollmentForRow(row).then( () =>{
        this.update()
      })
    }
    else{
      row.children.length=0
      row.opened=false
      this.update()
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
          this.loadEnrollmentForRow(row).then(()=>{
            this.update()
          })
        })
             
      }
      else{
        console.debug("none")
      }
    });
  }
  
  
  onMateriaUnEnroll(row:NodeTableRow){
    db.collection("materiaEnrollments").doc(row.materiaEnrollment.id).delete().then( () =>{
      console.log("removing materiaEnrollment:")
      this.loadEnrollmentForRow(row.parent).then( ()=>{
        this.update()
      })
    },
    reason =>{
      console.error("ERROR removing materiaEnrollment")
    })
  }  
  /*
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
  */
  onCopyToClipboard(){
    alert("url ha sido copiada al portapapeles")
  }  
  onExamWaiver(row:NodeTableRow){
    console.log(row)
    
    var observer = db.collection("materiaEnrollments").doc( row.parent.materiaEnrollment.id ).onSnapshot( 
      doc =>{
        console.log("changes are pending:" + doc.metadata.hasPendingWrites)
        var materiaEnrollmentRow = row.parent
        db.collection("materiaEnrollments").doc( row.parent.materiaEnrollment.id ).get().then(doc =>{
          row.parent.materiaEnrollment.certificate_public_url = doc.data().certificate_public_url 
        })
        
      })
    setTimeout(observer, 10000);

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
      })
    }
    else{
      let id = uuid.v4()
      let d = new Date().toISOString().split('T')[0]
      let today =  new Date( d )
      let examGrade:ExamGrade = {
        id:id, 
        organization_id:this.organization_id,
        exam_id:row.exam.id,
        materia_id:row.materia.id, 
        isCompleted: true,
        applicationDate: today,
        student_uid:row.user.uid, 
        title:"acreditado por:" + this.userLoginService.getDisplayName(),
        expression:"ninguna",
        score:10,
        isDeleted:false, 
        isReleased:true, 
        isApproved:true,
        isWaiver:true,
        created_on:new Date(),
        updated_on:new Date()   
      }
      db.collection("examGrades").doc(id ).set( examGrade ).then( ()=>{
        row.examGrade = examGrade    
        this.loadExamsForRow(row.parent).then(()=>{
          this.update()
        })
      })
    }
  }

  onRemoveExamWaiver(row:NodeTableRow){
    console.log(row)

    var observer = db.collection("materiaEnrollments").doc( row.parent.materiaEnrollment.id ).onSnapshot( 
      doc =>{
        console.log("changes are pending:" + doc.metadata.hasPendingWrites)
        var userRow = row.parent.parent
        var materiaEnrollmentRow = row.parent
        db.collection("materiaEnrollments").doc( row.parent.materiaEnrollment.id ).get().then(doc =>{
          row.parent.materiaEnrollment.certificate_public_url = doc.data().certificate_public_url 
        })
      })
    setTimeout(observer, 10000);
      
    if( row.examGrade.isWaiver ){
      db.collection("examGrades").doc(row.examGrade.id ).update({isDeleted:true}).then(()=>{
        this.loadExamsForRow(row.parent).then(()=>{
          this.update()
        })
      })
    }
    else{
      alert("Este examen no es una acreditacion")
    }
  }

  printDate(date){
      return this.examImprovisacionService.printDate(date)
  }

  onCertificateRemove(row:NodeTableRow){
    var req = {
      "materiaEnrollment_id":row.materiaEnrollment.id
    }
    var observer = db.collection("materiaEnrollments").doc( row.materiaEnrollment.id ).onSnapshot( 
      doc =>{
        console.log("changes are pending:" + doc.metadata.hasPendingWrites)
        db.collection("materiaEnrollments").doc( row.materiaEnrollment.id ).get().then(doc =>{
          row.materiaEnrollment.certificate_public_url = doc.data().certificate_public_url 
        })
      })
    setTimeout(observer, 10000);
      

    console.log(JSON.stringify(req,null,2))
    
    this.userLoginService.getUserIdToken().then( token => {

      this.examImprovisacionService.certificateDeleteInterface("create", token, req).subscribe(data => {
        if( data["result"] ){
          console.log("certification deleted")

        } 
        else{
          alert("Error:" + data["error"])
        }       
      },
      error => {
        alert("Error deleting certificate"  + error.statusText)
        console.log( "error:" + error.statusText )
      }) 
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    
    })      
  }
  onCertificateCreate(row:NodeTableRow){
    var req = {
      "materiaEnrollment_id":row.materiaEnrollment.id
    }
    var observer = db.collection("materiaEnrollments").doc( row.materiaEnrollment.id ).onSnapshot( 
      doc =>{
        console.log("changes are pending:" + doc.metadata.hasPendingWrites)
        db.collection("materiaEnrollments").doc( row.materiaEnrollment.id ).get().then(doc =>{
          row.materiaEnrollment.certificate_public_url = doc.data().certificate_public_url 
        })
      })
    setTimeout(observer, 10000);
      

    console.log(JSON.stringify(req,null,2))
    
    this.userLoginService.getUserIdToken().then( token => {

      this.examImprovisacionService.certificateCreateInterface("create", token, req).subscribe(data => {
        if( data["result"] ){
          console.log("certification created")

        } 
        else{
          alert("Error creando certificado:" + data["error"])
        }       
      },
      error => {
        alert("Error creando certificado devolvio error"  + error.statusText)
        console.log( "error:" + error.statusText )
      }) 
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    
    })      
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
    where("organization_id","==", this.data.organization_id ).
    where("isDeleted","==",false)

    var listMaterias = await query.get()
      
    listMaterias.forEach(doc =>{
      var materia:Materia = {
        id:doc.data().id,
        organization_id:this.data.organization_id,
        materia_name:doc.data().materia_name
      }
      this.materiasList.push(materia)
    })
    this.materiasList.sort((a,b) => {return a.materia_name > b.materia_name ? 1:-1})
  }
}

