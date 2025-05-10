 
import { Component, Inject } from "@angular/core";
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from "@angular/material/legacy-dialog";

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