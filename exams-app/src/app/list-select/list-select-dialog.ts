import { CommonModule } from '@angular/common';
import {  Component,  Inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog , MatDialogRef as MatDialogRef,  MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

export interface DataPropertySelect {
  label:string
  value:string
  property:string
  options:Array<any>  
}

@Component({
    selector: 'list-select-dialog',
    standalone: true,
    imports: [
      CommonModule
      ,MatIconModule
      ,MatButtonModule   
     
      ,FormsModule
      ,ReactiveFormsModule
      ,MatFormFieldModule
      ,MatInputModule 
  
      ,MatDialogModule  
      ,MatSelectModule
    ],     
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
  