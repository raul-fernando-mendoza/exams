 
import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

export interface ParameterGradeDescriptionDlgData {
  description: string
}

@Component({
  selector: 'parameterGrade-description-dlg',
  templateUrl: 'parameterGrade-description-dlg.html',
})
export class ParameterGradeDescriptionDialog {  
  constructor(
    public dialogRef: MatDialogRef<ParameterGradeDescriptionDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ParameterGradeDescriptionDlgData) {}
}