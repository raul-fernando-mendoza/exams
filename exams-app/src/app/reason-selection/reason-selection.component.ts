import { Component } from '@angular/core';
import { FormBuilder, FormControl,FormArray, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-reason-selection',
  templateUrl: './reason-selection.component.html',
  styleUrls: ['./reason-selection.component.css']
})
export class ReasonSelectionComponent {
  reasonForm = this.fb.group({
    id: null,
    reasonsArray: this.fb.array([]) 
  });

  get reasonsArray() : FormArray {
    return this.reasonForm.get("reasonsArray") as FormArray
  }

  newReason(
    id:number, 
    label:string,
    value:number ): FormGroup {

    var group = this.fb.group({
      id: id,
      label: label,
      control: new FormControl(value)
    });
    return group;  
 }

  db_reasons = [
      
    {
      id:1,
      label:"cabeza debe ir arriba",
      value: 0    
    },
    {
      id:2,
      label:"torso debe ir erguido",
      value: 0  
    },
    {
      id:3,
      label:"Pies deben ir juntos",
      value: 0  
    }
  ];     

  initializeFormControls(){
    //alert( "initialicing" );
    var i = 0;
    for (i=0; i<this.db_reasons.length; i++) {
      var p = this.db_reasons[i]
      console.debug(p.id + " " + p.label);
      this.reasonsArray.push(this.newReason(
        p.id,
        p.label,
        p.value          
        )
      )
    }
  

    //return JSON.stringify(o);
  } 
  exam_id: number;
  constructor(private fb: FormBuilder, private route: ActivatedRoute
    ,public dialogRef: MatDialogRef<ReasonSelectionComponent>
    ) {}

  ngOnInit() {
    //this.exam_id = Number(this.route.snapshot.paramMap.get('exam_id'));
    this.initializeFormControls();
    //alert( "receive:" + this.exam_id)
  }

  onSubmit() {
    this.dialogRef.close('Pizza!');
    //alert('Thanks!');
  }

  onChange(label:string, index:number, checked:boolean){
    alert("change:" + label + " "  + index + " " + checked);
  }
}
