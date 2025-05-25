import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { db, storage } from 'src/environments/environment';
import { ExamFormService } from '../exam-form.service';
import { CertificateType } from '../exams/exams.module';
import { UserPreferencesService } from '../user-preferences.service';
import { FileLoadObserver } from "../load-observers/load-observers.module"

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-certificate-type-edit',
  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule   
   
    ,FormsModule
    ,ReactiveFormsModule
    ,MatFormFieldModule
    ,MatInputModule 
  ],   
  templateUrl: './certificate-type-edit.component.html',
  styleUrls: ['./certificate-type-edit.component.css']
})
export class CertificateTypeEditComponent implements OnInit, OnDestroy {
  
  organization_id:string
  certificateTypeId:string

  ct:CertificateType
  ct_FG = null
  unsubscribe = null

  constructor( 
    private fb: UntypedFormBuilder,
    private preferences:UserPreferencesService,
    private formService:ExamFormService,
    private route: ActivatedRoute

  ) { 
    this.organization_id = preferences.getCurrentOrganizationId()
    this.certificateTypeId = this.route.snapshot.paramMap.get('certificateTypeId')
  }
  ngOnDestroy(): void {
    this.unsubscribe()
  }

  ngOnInit(): void {

    this.unsubscribe = db.collection("organizations/" + this.organization_id + "/certificateTypes").doc( this.certificateTypeId).onSnapshot( doc =>{
      this.ct = doc.data() as CertificateType
      this.ct_FG = this.fb.group({
        certificateTypeName:[this.ct.certificateTypeName, Validators.required], 
        label1:[this.ct.label1],
        label2:[this.ct.label2],
        label3:[this.ct.label3],
        label4:[this.ct.label4],
        color1:[this.ct.color1],
        color2:[this.ct.color2]       
      })
    })

  }
  onPropertyChange( $event ){
    var path = "organizations/" + this.organization_id + "/certificateTypes"
    this.formService.onPropertyChange(path, this.certificateTypeId, $event)
  }

  selectCertificateTypeFile(event) {
    var selectedFiles = event.target.files;
    const property = event.srcElement.name
    const path = "organizations/" + this.organization_id + "/certificateTypes"
    var file:File = selectedFiles[0]

    

    const bucketName = path + "/" + this.certificateTypeId + "/" + property + ".jpg"

    var storageRef = storage.ref( bucketName )

    var uploadTask = storageRef.put(file)
    var element = document.getElementById(property + "Status")
    var fileLoadObserver = new FileLoadObserver(storageRef, path, this.certificateTypeId, property, element );
    uploadTask.on("state_change", fileLoadObserver)
  } 

}
