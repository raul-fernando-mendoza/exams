import { Component } from '@angular/core';
import { FormBuilder, FormControl,FormArray , Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import {ThemePalette} from '@angular/material/core';
import { group } from '@angular/animations';



@Component({
  selector: 'app-exam-application',
  templateUrl: './exam-application.component.html',
  styleUrls: ['./exam-application.component.css']
})
export class ExamApplicationComponent {
 
  hideRequiredControl = new FormControl(false);

  questionsForm: FormGroup;

  addressForm = this.fb.group({

    id: null,
    questions: this.fb.array([])  
  });


  get questions() : FormArray {
    return this.addressForm.get("questions") as FormArray
  }

  newQuestion(value:boolean, label:string): FormGroup {
    var f:FormControl = new FormControl();
    f.setValue(value);

    var group = this.fb.group({
      id: f,
      label: new FormControl(false),
    });
    return group;
    
 }

 i:boolean = true;
 addQuestion() {
    this.questions.push(this.newQuestion(this.i, "hole" + this.i));
    if( this.i == true)
      { this.i = false}
    else {
       this.i = true;
    }
  }

  toJson(o){
    return JSON.stringify(o);
  } 
  exam_id: number;
  constructor(private fb: FormBuilder, private route: ActivatedRoute) {}

  ngOnInit() {
    this.exam_id = Number(this.route.snapshot.paramMap.get('exam_id'));
    //alert( "receive:" + this.exam_id)
  }

  onSubmit() {
    alert('Thanks!' + this.hideRequiredControl.value);
  }


}
