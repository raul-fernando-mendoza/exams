 
import { Component, Inject } from "@angular/core";
import {  MAT_DIALOG_DATA, MatDialogRef as MatDialogRef } from "@angular/material/dialog";
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { MatDialogModule } from '@angular/material/dialog';

export interface ParameterGradeDescriptionDlgData {
  description: string
}

@Component({
  selector: 'parameterGrade-description-dlg',
  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule   

    ,MatDialogModule  
  ],   
  templateUrl: 'parameterGrade-description-dlg.html',
})
export class ParameterGradeDescriptionDialog {  
  constructor(
    public dialogRef: MatDialogRef<ParameterGradeDescriptionDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ParameterGradeDescriptionDlgData) {}
}