import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

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
    templateUrl: './parameterGrade-comment-dlg.html',
    styleUrls: ['./parameterGrade-comment-dlg.css']
  })
  export class ParameterGradeCommentDialog { 
  
    constructor(
      public dialogRef: MatDialogRef<ParameterGradeCommentDialog>,
      @Inject(MAT_DIALOG_DATA) public data: ParameterGradeCommentDialogData) {}
  
  }