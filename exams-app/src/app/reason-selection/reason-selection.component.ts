import { Component } from '@angular/core';
import { FormBuilder, FormControl,FormArray, FormGroup } from '@angular/forms';
import { Output, EventEmitter, Inject, OnInit} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-reason-selection',
  templateUrl: './reason-selection.component.html',
  styleUrls: ['./reason-selection.component.css']
})
export class ReasonSelectionComponent {

  constructor(private fb: FormBuilder 
    ,public dialogRef: MatDialogRef<ReasonSelectionComponent>
    ,@Inject(MAT_DIALOG_DATA) public data: any
    ) {}

  
  reasonForm = this.fb.group({
    reasons : this.fb.array([
      this.fb.group({
        id:1,
        label:"cabeza debe ir arriba",
        isSelected: true    
      }),
      this.fb.group({
        id:2,
        label:"torso debe ir erguido",
        isSelected: false  
      }),
      this.fb.group({
        id:3,
        label:"otra",
        isSelected: true
      })
    ]),
    otra: new FormControl("") 
  })

  get reasonsArr() { return this.reasonForm.get('reasons') as FormArray; }
 

  initializeFormControls(parameter_questions){
    //alert( "initialicing" );
    
    var i = 0;
    this.reasonForm.get("otra").setValue(parameter_questions.otra);
    var fa = this.reasonForm.get("reasons") as FormArray;
    fa.clear();

    for (i=0; i<parameter_questions.questionsArr.length; i++) {
      var p = parameter_questions.questionsArr[i]
      console.debug(p.id + " " + p.label);
      var n = {
        id: p.id,
        label: p.label,
        isSelected: p.isSelected
      }
      fa.push( this.fb.group(n) );
    }
    

    //return JSON.stringify(o);
  } 



  ngOnInit() {    
    //alert( this.data )
    this.initializeFormControls( this.data.questions);
  }

  onSubmit() {
    var fa = this.reasonForm.get("reasons") as FormArray;
    var selectedQuestions = {
      questionsArr: [],
      otra: "",
      isClean: true,
    };
    for(var i = 0; i < fa.controls.length; i++)
    {
      var question = fa.at(i);
      var n = {
        id: question.get("id").value,
        label:question.get("label").value,
        isSelected: question.get("isSelected").value 
      }   
      selectedQuestions.questionsArr.push( n );
      if( n.isSelected == true){
        selectedQuestions.isClean = false;
      }
    }
    selectedQuestions.otra = this.reasonForm.get("otra").value;
    if( !(selectedQuestions.otra === "") ){
      selectedQuestions.isClean = false;
    }

    //var result = JSON.stringify(resultArray);
    this.dialogRef.close(selectedQuestions);
    //alert('Thanks!');
  }

  onChangeReason(idx:number, currentValue, $event){
    //alert( idx );
    var fa = this.reasonForm.get("reasons") as FormArray;
    if( currentValue == false){
      //var fa:FormArray;
      
      fa.at(idx).get("isSelected").setValue(true);
      //$event.target.textContent= "close";
    }
    else{
       //$event.target.textContent = "check_box_outline_blank";
       fa.at(idx).get("isSelected").setValue(false);
    }
  }
  getIsSelectedFor(idx:number){
    var fa = this.reasonForm.get("reasons") as FormArray;
    return fa.at(idx).get("isSelected").value;
  }
}
