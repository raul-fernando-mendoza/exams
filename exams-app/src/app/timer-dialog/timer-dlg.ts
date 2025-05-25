import {  Component,  Inject, OnInit } from '@angular/core';
import { MatDialog , MatDialogRef as MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { MatDialogModule } from '@angular/material/dialog';

export interface TimeLeft {
  label:string
  timeLeft:number
}

@Component({
    selector: 'timer-dlg',
    standalone: true,
    imports: [
      CommonModule
      ,MatIconModule
      ,MatButtonModule   
     

      ,MatDialogModule  
    ],     
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
  