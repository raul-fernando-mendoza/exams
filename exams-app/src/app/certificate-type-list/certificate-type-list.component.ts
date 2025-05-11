import { Component, OnDestroy, OnInit } from '@angular/core';
import { CertificateType } from '../exams/exams.module';
import { UserLoginService } from '../user-login.service';
import { UserPreferencesService } from '../user-preferences.service';
import { db } from 'src/environments/environment';
import * as uuid from 'uuid';
import { DialogNameDialog } from '../name-dialog/name-dlg';
import { MatDialog  } from '@angular/material/dialog';
import { Router } from '@angular/router';


@Component({
  selector: 'app-certificate-type-list',
  templateUrl: './certificate-type-list.component.html',
  styleUrls: ['./certificate-type-list.component.css']
})
export class CertificateTypeListComponent implements OnInit, OnDestroy {

  certificateTypes:Array<CertificateType> = [] 
  organization_id:string
  unsubscribe


  constructor(
    private preferences:UserPreferencesService,
    private user:UserLoginService,
    public dialog: MatDialog,
    private router:Router
  ) { 
    this.organization_id = preferences.getCurrentOrganizationId()
  }
  ngOnDestroy(): void {
    this.unsubscribe()
  }

  ngOnInit(): void {

    this.unsubscribe = db.collection("organizations/" + this.organization_id + "/certificateTypes").onSnapshot( certificateTypesSet =>{
      this.certificateTypes.length = 0
      certificateTypesSet.docs.map( certificateTypeDoc =>{
        const certificateType:CertificateType = certificateTypeDoc.data() as CertificateType
        this.certificateTypes.push(certificateType)
      })
    })
    
  }

  onCreate(){
    const dialogRef = this.dialog.open(DialogNameDialog, {
      height: '400px',
      width: '250px',
      data: {  label:"Certificate Type", name:""}
    });
  
    dialogRef.afterClosed().subscribe(data => {
      console.log('The dialog was closed');
      if( data != undefined ){
        console.debug( data )
        this.createCertificateType(data.name).then( ()=>{
          
        },
        reason =>{
          alert("ERROR: creando certificado")
        })
      }
      else{
        console.debug("none")
      }
    });

  }
  createCertificateType(name):Promise<void>{

    const nameCleaned = name.replace(" ", "_")
    const id = uuid.v4()
    const certificateType:CertificateType = {
      id:id,
      certificateTypeName:nameCleaned,
      certificateTypeUrl:null,
      certificateTypePath:null,
      label1:"",
      label2:"",
      label3:"",
      label4:"",
      color1:"",
      color2:""
    
    }
    return db.collection("organizations/" + this.organization_id + "/certificateTypes" ).doc(id).set( certificateType )
  }
  onEdit( certificateType_id ){
    this.router.navigate(['certificate-type-edit',{"certificateTypeId":certificateType_id}])
  }

  onRemove( certificateTypeId, name ){
    if( !confirm("Esta seguro de querer borrar el certificado:" +  name) ){
      return
    }    
    db.collection("organizations/" + this.organization_id + "/certificateTypes" ).doc(certificateTypeId).delete().then( ()=>{
      console.log("certificate has been erased")
    },
    reason =>{
      alert("Error certificado no pudo ser borrado:" + reason)
    })
  }    

}
