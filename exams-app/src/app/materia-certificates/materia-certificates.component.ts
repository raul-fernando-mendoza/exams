import { AfterViewInit, Component, OnInit, ViewChild, signal, ChangeDetectorRef, inject, Inject } from '@angular/core';
import { MatPaginator  } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTable, MatTableModule } from '@angular/material/table';
import { MateriaCertificatesDataSource, NodeTableRow } from './materia-certificates-datasource';
import { MatDialog , MatDialogRef as MatDialogRef,  MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import { db } from 'src/environments/environment';
import { UserPreferencesService } from '../user-preferences.service';
import { SortingService } from '../sorting.service';
import { UserLoginService } from '../user-login.service';
import { copyObj, Materia, MateriaEnrollment, User, ExamGrade, Exam, Career } from '../exams/exams.module';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';

import * as uuid from 'uuid';
import { Router } from '@angular/router';
import { DateFormatService } from '../date-format.service';
import {MatPaginatorModule} from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSelectModule} from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';
import { DownloadService } from "../download.service"

@Component({
  selector: 'app-materia-certificates',
  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule      
    ,MatPaginatorModule
    ,MatDialogModule 
    ,MatToolbarModule 
    ,MatSelectModule
    ,MatProgressSpinnerModule 
    ,MatTableModule
    ,MatPaginatorModule 
    ,MatSortModule 
    ,MatMenuModule 
  ], 

  templateUrl: './materia-certificates.component.html',
  styleUrls: ['./materia-certificates.component.css'],

})
export class MateriaCertificatesComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<NodeTableRow>;

  nodeList = Array<NodeTableRow>()
  dataSource = signal<MateriaCertificatesDataSource>(new MateriaCertificatesDataSource(this.nodeList));

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['student_name', 'approved', 'actions'];

  studentsListener = null
  materiaListener = null
  examListener = null

  
  open_transactions:Set<string> = new Set()

  organization_id = null

  submitting = signal(false)

  durationInSeconds = 5
  
  canCopyImages = signal(false)

  private _snackBar = inject(MatSnackBar);

  constructor(
      private userPreferencesService:UserPreferencesService
    , private sortingService:SortingService
    , private userLoginService:UserLoginService
    , public dialog: MatDialog
    , private examImprovisacionService: ExamenesImprovisacionService
    , private userPreferencesServide: UserPreferencesService
    , private router: Router
    , private dateFormatService:DateFormatService
    , private changeDetectorRef: ChangeDetectorRef
    ,private clipboard: Clipboard
    ,private downloads: DownloadService
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
    
    this.dataSource.set(new MateriaCertificatesDataSource(this.nodeList))
    this.dataSource().sort = this.sort;
    this.dataSource().paginator = this.paginator;
    this.table.dataSource =this.dataSource(); 
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
                displayName:user.claims ? user.claims["displayName"] || user.displayName || user.email : "not found",
                email:user.email,
                claims:user.claims ? user.claims : {}

              }
              var userNode:NodeTableRow = {
                user:u,
                opened:false,
                children:[],
                nodeClass:"User",
                isLeaf:false,
                parent:null
              }

              this.nodeList.push(userNode)
            }
            this.nodeList.sort( (a,b) =>{ return a.user.displayName>b.user.displayName?1:-1})
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
          

          var n:NodeTableRow = {
            user:row.user,
            materiaEnrollment:materiaEnrollment,
            opened:false,
            nodeClass:"MateriaEnrollment",
            children:null,
            isLeaf:false,
            parent:row
          }
          return db.collection("materias").doc(materiaEnrollment.materia_id).get().then( doc =>{
            if (doc.exists == true){
              var materia:Materia = doc.data() as Materia
              n.materia = materia 
              if(materia.isDeleted == false){
                children.push(n)  
              }
            }
          },
          reason =>{
            console.error("ERROR error reading materias:"+reason)
            reject()
          }) 
        })
        Promise.all(resultMap).then( result =>{
          children.sort( (a,b) => { return a.materia?.materia_name>b.materia?.materia_name ? 1:-1})
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
    if(this.submitting() == false && row.opened == false){
      this.submitting.set(true)
      row.opened = true
      this.loadExamsForRow(row).then(()=>{
        this.submitting.set(false)
        this.update()
      })
    }
    else if ( this.submitting() == false && row.opened == true) {
      row.opened=false
      row.children.length=0
      this.update()
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
        let children:NodeTableRow[] = []
        
        let allexams = set.docs.map( doc =>{

          let exam:Exam = doc.data() as Exam
          let n:NodeTableRow = {
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
          
          let transactions = []
          let examsGrades:Array<ExamGrade> = []
          //now get the grades for the exams version 1
          const tV1 = db.collection("examGrades")
          .where("organization_id","==", this.organization_id)
          .where("student_uid","==", row.user.uid)
          .where("materia_id","==", row.materia.id)
          .where("exam_id","==",exam.id)
          .where("isDeleted","==",false).get().then( set => {

            set.forEach( g =>{
              if( g.exists ){
                let eg = g.data() as ExamGrade
                examsGrades.push( eg )
              }
            })
          },
          reason=>{
            console.log("ERROR reading examGrades:" + reason)
            reject()
          })
          transactions.push( tV1 )

          //now get the grades for the exams version 1
          const tV2 = db.collection("examGrades")
          .where("organization_id","==", this.organization_id)
          .where("studentUids","array-contains", row.user.uid)
          .where("materia_id","==", row.materia.id)
          .where("exam_id","==",exam.id)
          .where("isDeleted","==",false).get().then( set => {

            set.forEach( g =>{
              if( g.exists ){
                let eg = g.data() as ExamGrade
                examsGrades.push( eg )
              }
            })
          },
          reason=>{
            console.log("ERROR reading examGrades:" + reason)
            reject()
          })
          transactions.push( tV2 )          

          return Promise.all(transactions).then( ()=>{
            for( var j=0; j<examsGrades.length; j++){
              const g:ExamGrade = examsGrades[j] as ExamGrade
              if( n.examGrade == null){
                n.examGrade = g
              }
              else if( g.isReleased == true && g.applicationDate > n.examGrade.applicationDate ){
                n.examGrade = g
              }
            }            
          })
        })
        Promise.all(allexams).then( ()=>{
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
    row.children.length = 0
    
    var careersNode:NodeTableRow = {
      user:row.user,
      opened:false,
      children:[],
      nodeClass:"Careers",
      isLeaf:false,
      parent:row
    }   
    row.children.push( careersNode )

    var skillsNode:NodeTableRow = {
      user:row.user,
      opened:false,
      children:[],
      nodeClass:"Materias",
      isLeaf:false,
      parent:row
    } 
    row.children.push( skillsNode)  
    
    this.update()
  }

  onCareersClick(row:NodeTableRow){
    row.children.length = 0
    db.collection("careers")
    .where("organization_id", "==", this.organization_id)
    .where("isDeleted","==",false)
    .get().then(set => {
      set.docs.map( doc  =>{
        const career = doc.data() as Career
        var carrerNode:NodeTableRow = {
          user:row.user,
          career:career,
          opened:false,
          children:[],
          nodeClass:"Career",
          isLeaf:true,
          parent:row
        }                 
        row.children.push( carrerNode )                
      })
      row.children.sort((a,b)=>{ return a.career.career_name>b.career.career_name?1:-1})
      this.update()
    })

  }

  onMateriasClick(row:NodeTableRow){
    console.log("opening materias:" + "submmiting:" + this.submitting + "row oppened:" + row.opened)
    if(this.submitting() == false && row.opened == false){
      this.submitting.set(true)
      this.loadEnrollmentForRow(row).then( () =>{
        this.submitting.set(false)
        this.update()


      },
      reason =>{
        this.submitting.set(false)
        alert("error loading rows")
        
      })
    }
    else if( this.submitting() == false && row.opened == true ){
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
          },
          reason=>{
            alert("Error loading enrollment:" + reason)
          })
        },
        reason =>{
          alert("ERROR enroll en materia faile:" + reason)
        })
             
      }
      else{
        console.debug("none")
      }
    });
  }
  
  
  onMateriaUnEnroll(row:NodeTableRow){
    if( !confirm("Esta seguro de querer eliminar el enrollamiento de:" +  this.userLoginService.getDisplayNameForUser(row.user)) ){
      return
    }        
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
  onExamWaiver(row:NodeTableRow){
    console.log(row)
    
    var observer = db.collection("materiaEnrollments").doc( row.parent.materiaEnrollment.id ).onSnapshot( 
      doc =>{
        console.log("changes are pending:" + doc.metadata.hasPendingWrites)
        var materiaEnrollmentRow = row.parent
        db.collection("materiaEnrollments").doc( row.parent.materiaEnrollment.id ).get().then(doc =>{
          row.parent.materiaEnrollment.certificateUrl = doc.data().certificateUrl 
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
        id: id,
        organization_id: this.organization_id,
        exam_id: row.exam.id,
        materia_id: row.materia.id,
        isCompleted: true,
        applicationDate: today,
        applicationDay: this.dateFormatService.getDayId(today),
        student_uid: row.user.uid,
        title: "acreditado por:" + this.userLoginService.getDisplayName(),
        expression: "ninguna",
        score: 10,
        isDeleted: false,
        isReleased: true,
        isApproved: true,
        isWaiver: true,
        created_on: new Date(),
        updated_on: new Date()
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
          row.parent.materiaEnrollment.certificateUrl = doc.data().certificateUrl 
        })
      })
    setTimeout(observer, 10000);
      
    if( row.examGrade.isWaiver ){
      db.collection("examGrades").doc(row.examGrade.id ).update(
        {
          isDeleted:true,
          updated_on:new Date()
        }).then(()=>{
        this.loadExamsForRow(row.parent).then(()=>{
          this.update()
        })
      })
    }
    else{
      alert("Este examen no es una acreditacion")
    }
  }

  printDate(date:any){
      return this.dateFormatService.formatDate(date.toDate())
  }

  onCertificateRemove(row:NodeTableRow){
    var req = {
      "materiaEnrollment_id":row.materiaEnrollment.id
    }
    var observer = db.collection("materiaEnrollments").doc( row.materiaEnrollment.id ).onSnapshot( 
      doc =>{
        console.log("changes are pending:" + doc.metadata.hasPendingWrites)
        db.collection("materiaEnrollments").doc( row.materiaEnrollment.id ).get().then(doc =>{
          row.materiaEnrollment.certificateUrl = doc.data().certificateUrl 
          this.update()
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
          row.materiaEnrollment.certificateUrl = doc.data().certificateUrl 
          this.update();
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
  onCareerClick(row:NodeTableRow){
    this.router.navigate(["career-user",{ career_id:row.career.id , user_uid:row.user.uid}])
  }

  onExamGrade( row:NodeTableRow ){
    console.log( row.materia.id, row.exam.id, row.examGrade.id )
    if( row.examGrade ){
      if(row.examGrade.isReleased ){
        this.router.navigate(['report',{ materia_id:row.materia.id, exam_id:row.exam.id, examGrade_id:row.examGrade.id}])
      }
      else{
        this.router.navigate(['examGrade-parameterGrade-apply',{ materia_id:row.materia.id, exam_id:row.exam.id, examGrade_id:row.examGrade.id}])
      }
    }
  }
  onCopyUrlToClipboard(url){
    this.clipboard.copy(url);
    this._snackBar.open("copiado al clipboard", "X",{
      duration: 3000
    });
  }   
  download( url:string,row:NodeTableRow): void {
    let user_name= this.userLoginService.getDisplayNameForUser(row.user).replace(" ","_")
    let materia_name = row.materia.materia_name
    this.downloads
      .download(url)
      .subscribe(blob => {
        const a = document.createElement('a')
        const objectUrl = URL.createObjectURL(blob)
        a.href = objectUrl
        a.download = user_name + "_" + materia_name + '.jpeg';
        a.click();
        URL.revokeObjectURL(objectUrl);
      })
  } 
}

/****** student dlg */
/* do not forget to add the dialog to the app.module.ts*/
@Component({
  selector: 'enroll-materia-dlg',
  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule 
    ,FormsModule  
    ,MatDialogModule
    ,MatSelectModule   
  ],   
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

