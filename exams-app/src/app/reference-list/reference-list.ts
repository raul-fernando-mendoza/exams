import { Component, Input, OnDestroy, OnInit, ViewChild } from "@angular/core"
import { MatDialog  } from "@angular/material/dialog"
import { Reference } from "../exams/exams.module"
import { UserLoginService } from "../user-login.service"
import { db , storage} from 'src/environments/environment';
import { UserPreferencesService } from "../user-preferences.service"
import { MatTable } from "@angular/material/table";
import { ReferenceDialog } from "../reference-edit/reference-edit";
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from "@angular/material/menu";

/* do not forget to add the dialog to the app.module.ts*/
@Component({
    selector: 'reference-list',
    standalone: true,
    imports: [
      CommonModule
      ,MatIconModule
      ,MatButtonModule   

  
      ,MatTableModule
      ,MatMenuModule 
   
    ],    
    templateUrl: 'reference-list.html',
    styleUrls: ['reference-list.css']
  })

export class ReferenceComponent implements OnInit, OnDestroy{ 
   
  @Input() collection:string
  @ViewChild(MatTable) table: MatTable<any>;

  isAdmin:boolean = false
  organization_id:string = null
  isLoggedIn:boolean = false

  unsubscribe = null

  references = Array<Reference>()

  displayedColumns: string[] = ['label', 'description'];  

  constructor(
       private userLoginService: UserLoginService
      ,private userPreferencesService: UserPreferencesService
      ,public dialog: MatDialog
      ) {
    
    this.organization_id = this.userPreferencesService.getCurrentOrganizationId()
    if( this.userLoginService.hasRole("role-admin-" + this.organization_id) ){
      this.isAdmin = true
    }   
    if( this.userLoginService.getUserUid() ){
      this.isLoggedIn = true
    }
  }
  ngOnDestroy(): void {
    if( this.unsubscribe){
      this.unsubscribe()
    }
    
  }

 //"materias/" + this.materiaid + "/materiaReference"
  ngOnInit(): void {
    this.unsubscribe = db.collection(this.collection).onSnapshot( 
      snapshot =>{
        this.references.length = 0
        snapshot.docs.map( doc=>{
          var reference:Reference =  doc.data() as Reference
          this.references.push(reference)
        })
        this.references.sort( (a,b) => a.label >= b.label ? 1 : -1 )
        this.table.renderRows()

      },
      error=>{
        console.log("ERROR reading reference")
      })
    
  }

  onCreateReference(){
    var data = {
      collection: this.collection,
      id:null,
      label:"",
      desc:"",
      fileUrl:null,
      filePath:null
    }
    const dialogRef = this.dialog.open(ReferenceDialog, {
      height: '400px',
      width: '250px',
      data: data
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  onReferenceEdit(reference:Reference){
    var data = {
      collection: this.collection,
      id:reference.id,
      label:reference.label,
      desc:reference.desc,
      fileUrl:reference.fileUrl,
      filePath:reference.filePath
    }    
    const dialogRef = this.dialog.open(ReferenceDialog, {
      height: '400px',
      width: '250px',
      data: data
    });
  
    dialogRef.afterClosed().subscribe(materiaReference => {
      console.log('The dialog was closed');
    });
  }

  onReferenceDelete( reference:Reference ):Promise<void>{
    return new Promise<void>( ( resolve, reject) => {
        let transactions = []
        if( reference.filePath  ){
            let storageRef = storage.ref( reference.filePath )
        
            var trans_delete = storageRef.delete().then( () =>{
                console.log("previous file removed")
            }) 
            .catch( reason =>{
                console.log("previous file not found")
            })  
            transactions.push( trans_delete )
        }
        Promise.all( transactions ).then( () => {
            db.collection(this.collection).doc(reference.id).delete().then( ()=>{
              console.log("reference has been deleted")
            },
            reason =>{
              console.log("documento can not be erase")
            })
        })
    })
}

}

  

  


  