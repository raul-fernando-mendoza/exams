import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog  } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Revision, RevisionStatus, RevisionStatusNames, User } from '../exams/exams.module';
import { RevisionCreateDialog } from '../revision-create-dialog/revision-create-component';
import * as uuid from 'uuid';
import { db , storage  } from 'src/environments/environment';
import { BusinessService } from '../business.service';
import { MatTable } from '@angular/material/table';
import { DateFormatService } from '../date-format.service';
import { UserPreferencesService } from '../user-preferences.service';
import { UserLoginService } from '../user-login.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

interface RevisionItem{
  revision:Revision
  student:User
}

@Component({
  selector: 'app-revision-list',
  templateUrl: './revision-list.component.html',
  styleUrls: ['./revision-list.component.css']
})
export class RevisionListComponent implements OnInit, OnDestroy {
  @ViewChild(MatTable) matTable:MatTable<RevisionItem>

  collection="Revision"
  displayedColumns=["date","label", "student","status",'actions']
  organization_id = null
  isAdmin=false
  userUid=null

  dataSource:RevisionItem[] = []
  unsubscribe 

  filter_uid=null
  filter_all=true

  filterFG = this.fb.group({
    student_uid:[null]
  })

  submitting = false

  constructor(private router: Router
    ,private userLoginService:UserLoginService
    ,private userPreferencesService: UserPreferencesService
    ,private dateFormatService:DateFormatService
    , public dialog: MatDialog
    , private fb:FormBuilder
    ,private businessService: BusinessService
    ) { 
      this.organization_id = this.userPreferencesService.getCurrentOrganizationId()
      if( this.userLoginService.hasRole("role-admin-" + this.organization_id) ){
        this.isAdmin = true
      }   
      if( this.userLoginService.getUserUid() ){
        this.userUid = this.userLoginService.getUserUid()
      }    
  
    }
  ngOnDestroy(): void {
    if( this.unsubscribe ){
      this.unsubscribe()
    }
  }

  ngOnInit(): void {
    if( this.unsubscribe ){
      this.unsubscribe()
    }

    var qry = db.collection(this.collection )
    .where( "organization_id","==",this.organization_id)
    if( this.isAdmin ){
      if( !this.filter_all ){
        qry=qry.where( "status","==",RevisionStatus.requested)
      }
    }
    if( this.isAdmin ){
      if( this.filter_uid ){
        console.log("filter:" + this.filter_uid)
        qry=qry.where("student_uid","==", this.filter_uid)
      }
    }
    else{
      qry=qry.where("student_uid","==",this.userUid)
    }
    qry=qry.where("isDeleted","==",false)
    qry.orderBy( "date","desc")

    this.submitting = true
    this.unsubscribe =  qry.onSnapshot( set =>{
      this.submitting = false
      this.dataSource.length=0
      var transactions = []
      set.docs.map( doc =>{
        var revision:Revision = doc.data() as Revision
        var item:RevisionItem = {
          revision:revision,
          student:null
        } 
        var userTransaction = this.businessService.getUser( revision.student_uid).then(user =>{
          item.student = user          
        })
        this.dataSource.push( item )
        transactions.push( userTransaction )
      })
      Promise.all( transactions ).then( () =>{
        this.matTable.renderRows()
      })
      
    },
    reason =>{
      this.submitting = false
      console.log("ERROR:" + reason)
    })
  }

  onCreateRevision(){
    
    const dialogRef = this.dialog.open(RevisionCreateDialog, {
      height: '400px',
      width: '250px',
      data: "" 
    });
  
    dialogRef.afterClosed().subscribe(data => {
      console.log('The dialog was closed');
      if( data != undefined && data != ''){
        console.log(data)
        if( this.isAdmin ){
          this.router.navigate(['revision-edit',{ revisionId:data }])
        }
      }
      else{
        console.debug("none")
      }
    });

  }
  formatDate( date ){
    return this.dateFormatService.formatDate( new Date(date.seconds*1000) )
  }

  onRowClick(row){
    console.log(row.revision.id)
    if( this.isAdmin || row.revision.status == RevisionStatus.completed){
      this.router.navigate(['revision-edit',{ revisionId:row.revision.id }])
    }
    else{
      alert( "su video no ha sido revisado")
    }
  }

  onShowAll(event){
    this.ngOnInit()
  }
  onUserSelected(useruid){
    console.log( "useruid:" + useruid)
    this.filter_uid = useruid
    this.ngOnInit()
  }
  getStatusName( idx ){
    return RevisionStatusNames[idx]
  }

  onDelete(revision:Revision){
    if( !confirm("Esta seguro de querer borrar la revison:" + revision.label) ){
      return
    }     
    db.collection("Revision").doc(revision.id).update( {isDeleted:false} ).then( ()=>{
      console.log("the revision was deleted")
      this.router.navigate(["revision-list"])
    },
    reason=>{
      alert("ERROR:" + reason)
    })
  }
}
