import { Component,Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

export interface DialogData {
    calificacion: number,
    comentario: string,
    collection:string,
    id:string,
    property:string
}

/* do not forget to add the dialog to the app.module.ts*/
@Component({
    selector: 'comment-apply-dlg',
    templateUrl: 'comment-apply-dlg.html',
  })
  export class CommentApplyDialog { 
  
    constructor(
      public dialogRef: MatDialogRef<CommentApplyDialog>,
      @Inject(MAT_DIALOG_DATA) public data: DialogData) {}
  
  }