import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserLoginService } from '../user-login.service';
import { db } from 'src/environments/environment';
import { Career } from '../exams/exams.module';
import { convertUpdateArguments } from '@angular/compiler/src/compiler_util/expression_converter';


@Component({
  selector: 'app-career-edit',
  templateUrl: './career-edit.component.html',
  styleUrls: ['./career-edit.component.css']
})
export class CareerEditComponent implements OnInit {

  id = null

  c = this.fb.group({
    id: [null, Validators.required],
    career_name:[null, Validators.required],   
    description:[null],
  })

  constructor(
      private fb: FormBuilder
    , private route: ActivatedRoute
    , private userLoginService:UserLoginService
    ) { 
      this.id = this.route.snapshot.paramMap.get('id')

    }

  ngOnInit(): void {
    this.loadCareer()
  }
  

  async loadCareer(){
    const careerRef = db.collection('careers').doc(this.id)
    const doc = await careerRef.get();
    if (doc.exists) {
      console.debug(doc.data())
      this.c.controls["id"].setValue(doc.data().id)  
      this.c.controls["career_name"].setValue(doc.data().career_name)

    } else {
      console.log('Document data:', doc.data());

    }

  }

  onChange(careerFormGroup){
    var career_name = careerFormGroup.controls["career_name"].value
    db.collection("careers").doc(this.id).update({"career_name":career_name}).then(
      result =>{
        console.log("careers updated:" + result)
      }
    ) 
    this.loadCareer()    

  }

}
