import {  Component,  Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';

export interface DataPropertySelect {
  label:string
  value:string
  property:string
  options:Array<any>  
}

@Component({
    selector: 'list-select-dialog',
    templateUrl: 'list-select-dialog.html',
  })
  export class DialogListSelectDialog { 
    constructor(
      public dialogRef: MatDialogRef<DialogListSelectDialog>,
      @Inject(MAT_DIALOG_DATA) public data:DataPropertySelect) {}

      onSelectionChange($event){
        this.data.value = $event.value
      }
  }
  