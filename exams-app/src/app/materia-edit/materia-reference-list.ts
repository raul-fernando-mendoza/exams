import { Component, Input, OnDestroy, OnInit, ViewChild } from "@angular/core"
import { MatDialog } from "@angular/material/dialog"
import { MateriaReference } from "../exams/exams.module"
import { UserLoginService } from "../user-login.service"
import { db , storage} from 'src/environments/environment';
import { UserPreferencesService } from "../user-preferences.service"
import { MateriaReferenceDialog } from "./materia-reference-edit"
import { MatTable } from "@angular/material/table";


/* do not forget to add the dialog to the app.module.ts*/
@Component({
    selector: 'materia-reference-list',
    templateUrl: 'materia-reference-list.html',
    styleUrls: ['materia-reference-list.css']
  })

export class MateriaReferenceComponent implements OnInit, OnDestroy{ 
   
  @Input() materia_id:string
  @ViewChild(MatTable) table: MatTable<any>;

  isAdmin:boolean = false
  organization_id:string = null
  isLoggedIn:boolean = false

  unsubscribe = null

  references = Array<MateriaReference>()

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
    this.unsubscribe()
  }


  ngOnInit(): void {
    if ( this.materia_id ){
      this.unsubscribe = db.collection("materias/" + this.materia_id + "/materiaReference").onSnapshot( 
        snapshot =>{
          this.references.length = 0
          snapshot.docs.map( doc=>{
            var materiaReference:MateriaReference =  doc.data() as MateriaReference
            this.references.push(materiaReference)
          })
          this.references.sort( (a,b) => a.label >= b.label ? 1 : -1 )
          this.table.renderRows()

        },
        error=>{
          console.log("ERROR reading materia")
        })
    }
    
  }

  onCreateMateriaReference(){
    var data = {
      materia_id: this.materia_id,
      id:null,
      label:"",
      desc:"",
      fileUrl:null,
      filePath:null
    }
    const dialogRef = this.dialog.open(MateriaReferenceDialog, {
      height: '400px',
      width: '250px',
      data: data
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  onMateriaReferenceEdit(materiaReference:MateriaReference){
    var data = {
      materia_id: this.materia_id,
      id:materiaReference.id,
      label:materiaReference.label,
      desc:materiaReference.desc,
      fileUrl:materiaReference.fileUrl,
      filePath:materiaReference.filePath
    }    
    const dialogRef = this.dialog.open(MateriaReferenceDialog, {
      height: '400px',
      width: '250px',
      data: data
    });
  
    dialogRef.afterClosed().subscribe(materiaReference => {
      console.log('The dialog was closed');
    });
  }

  onMateriaReferenceDelete( materiaReference:MateriaReference ):Promise<void>{
    return new Promise<void>( ( resolve, reject) => {
        let transactions = []
        if( materiaReference.filePath  ){
            let storageRef = storage.ref( materiaReference.filePath )
        
            var trans_delete = storageRef.delete().then( () =>{
                console.log("previous file removed")
            }) 
            .catch( reason =>{
                console.log("previous file not found")
            })  
            transactions.push( trans_delete )
        }
        Promise.all( transactions ).then( () => {
            db.collection("materias/" + this.materia_id + "/materiaReference").doc(materiaReference.id).delete().then( ()=>{
                console.log("materiaReference has been deleted")
            })
        })
    })
}

}

  

  


  