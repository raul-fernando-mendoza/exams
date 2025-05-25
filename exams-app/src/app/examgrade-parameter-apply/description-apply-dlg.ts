import { Component , Inject} from "@angular/core";
import {  MAT_DIALOG_DATA, MatDialogRef as MatDialogRef } from "@angular/material/dialog";
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';

export interface DescriptionDlgData {
    description: string
}
/* do not forget to add the dialog to the app.module.ts*/
@Component({
    selector: 'description-apply-dlg',
    standalone: true,
    imports: [
      CommonModule
      ,MatIconModule
      ,MatButtonModule   

      ,MatDialogModule  
    ],      
    templateUrl: 'description-apply-dlg.html',
  })
  export class DescriptionApplyDialog { 
    constructor(
      public dialogRef: MatDialogRef<DescriptionApplyDialog>,
      @Inject(MAT_DIALOG_DATA) public data: DescriptionDlgData) {}
  }