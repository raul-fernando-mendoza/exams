import { Component } from '@angular/core';
import { FormBuilder, FormControl,FormArray, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { MatDialog } from '@angular/material/dialog'; 
import { ReasonSelectionComponent } from '../reason-selection/reason-selection.component';
//import { ReasonSelectionComponent } from '../reason-selection/reason-selection.component';



@Component({
  selector: 'app-exam-application',
  templateUrl: './exam-application.component.html',
  styleUrls: ['./exam-application.component.css']
})
export class ExamApplicationComponent {
 
  posicionesForm = this.fb.group({

    id: null,
    posicionesArray: this.fb.array([])  
  });


  get posicionesArray() : FormArray {
    return this.posicionesForm.get("posicionesArray") as FormArray
  }

  newPosicion(
    id:number, 
    label:string, 
    movimiento:number, 
    pies:number, 
    shimmi:number, 
    palomas:number,
    portDebra:number,
    craneo:number ): FormGroup {

    var group = this.fb.group({
      id: id,
      label: label,
      movimiento: new FormControl(movimiento),
      pies: new FormControl(pies),
      shimmi: new FormControl(shimmi),
      palomas: new FormControl(palomas),
      portDebra: new FormControl(portDebra),
      craneo: new FormControl(craneo)
    });
    return group;
    
 }

  db_posiciones = [
      
    {
      id:1,
      label:"movimiento 1",
      movimiento: 1,
      pies: 0,
      shimmi: 1,
      palomas: 0,
      portDebra: 1,
      craneo: 0     
    },
    {
      id:2,
      label:"movimiento 2",
      movimiento: 0,
      pies: 1,
      shimmi: 0,
      palomas: 1,
      portDebra: 0,
      craneo: 1  
    }
  ];     

  initializeFormControls(){
    
    var i = 0;
    for (i=0; i<this.db_posiciones.length; i++) {
      var p = this.db_posiciones[i]
      console.debug(p.id + " " + p.label);
      this.posicionesArray.push(this.newPosicion(
        p.id,
        p.label,
        p.movimiento,
        p.pies,
        p.shimmi,
        p.palomas,
        p.portDebra,
        p.craneo          
        )
      )
    }
  

    //return JSON.stringify(o);
  } 
  exam_id: number;
  constructor(private fb: FormBuilder, private route: ActivatedRoute
    , public dialog: MatDialog
    ) {}

  ngOnInit() {
    this.exam_id = Number(this.route.snapshot.paramMap.get('exam_id'));
    this.initializeFormControls();
    //alert( "receive:" + this.exam_id)
  }

  onSubmit() {
    alert('Thanks!');
  }

  onChange(label:string, column:string, index:number, checked:boolean){
    alert("change:" + label + " " + column + " " + index + " " + checked);
    
    let dialogRef = this.dialog.open(ReasonSelectionComponent, {
      height: '400px',
      width: '600px',
    });    
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`); // Pizza!
    }) 
    
  }

}
