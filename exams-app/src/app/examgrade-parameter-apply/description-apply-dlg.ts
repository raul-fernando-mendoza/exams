import { Component , Inject} from "@angular/core";
import {  MAT_DIALOG_DATA, MatDialogRef as MatDialogRef } from "@angular/material/dialog";

export interface DescriptionDlgData {
    description: string
}
/* do not forget to add the dialog to the app.module.ts*/
@Component({
    selector: 'description-apply-dlg',
    templateUrl: 'description-apply-dlg.html',
  })
  export class DescriptionApplyDialog { 
    constructor(
      public dialogRef: MatDialogRef<DescriptionApplyDialog>,
      @Inject(MAT_DIALOG_DATA) public data: DescriptionDlgData) {}
  }