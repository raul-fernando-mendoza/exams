import { Component, Inject } from "@angular/core";
import {  MAT_DIALOG_DATA, MatDialogRef as MatDialogRef } from "@angular/material/dialog";
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MatInputModule } from '@angular/material/input';
import { SoundfileEditComponent } from "../soundfile-edit/soundfile-edit.component";

export interface ParameterGradeCommentDialogData {
    calificacion: number,
    comentario: string,
    collection:string,
    id:string,
    property:string
  }

  
/* do not forget to add the dialog to the app.module.ts*/
@Component({
    selector: './parameterGrade-comment-dlg',
    standalone: true,
    imports: [
      CommonModule
      ,MatIconModule
      ,MatButtonModule   
     
      ,FormsModule
      ,ReactiveFormsModule
      ,MatFormFieldModule
      ,MatInputModule 
      ,SoundfileEditComponent
 
    ],      
    templateUrl: './parameterGrade-comment-dlg.html',
    styleUrls: ['./parameterGrade-comment-dlg.css']
  })
  export class ParameterGradeCommentDialog { 
  
    constructor(
      public dialogRef: MatDialogRef<ParameterGradeCommentDialog>,
      @Inject(MAT_DIALOG_DATA) public data: ParameterGradeCommentDialogData) {}
  
  }