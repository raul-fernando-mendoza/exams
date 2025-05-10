import {  Component,  Inject } from '@angular/core';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';

export interface DataName {
  label:string
  name:string
}

@Component({
    selector: 'name-dlg',
    templateUrl: 'name-dlg.html',
  })
  export class DialogNameDialog { 
    constructor(
      public dialogRef: MatDialogRef<DialogNameDialog>,
      @Inject(MAT_DIALOG_DATA) public data:DataName) {}
  }
  