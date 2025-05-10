import {  Component,  Inject, OnInit } from '@angular/core';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';

export interface TimeLeft {
  label:string
  timeLeft:number
}

@Component({
    selector: 'timer-dlg',
    templateUrl: 'timer-dlg.html',
    styleUrls: ['timer-dlg.css']
  })
  export class TimerDialog implements OnInit{ 

    interval 
    constructor(
      public dialogRef: MatDialogRef<TimerDialog>,
      @Inject(MAT_DIALOG_DATA) public data:TimeLeft) {

    }

    ngOnInit(): void {
      this.interval = setInterval(() => {
        this.data.timeLeft--;
        if( this.data.timeLeft<=0){
          this.dialogRef.close(this.data);
        }
      },1000)
    }

  }
  