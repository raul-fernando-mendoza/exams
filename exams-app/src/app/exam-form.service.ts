import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Aspect, AspectGrade, Criteria, CriteriaGrade, Exam, ExamGrade, Parameter, ParameterGrade } from './exams/exams.module';

@Injectable({
  providedIn: 'root'
})
export class ExamFormService {

  constructor(private fb: FormBuilder) { }

  
  formatDate(d:Date) {
    var 
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
  
    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;
  
    return [year, month, day].join('-');
  }
  replacer(key, value) {
    // Filtrando propiedades 
    if (key === "applicationDate") {
      return value.slice(0, 10);
    }
    return value;
  }  
  

}
