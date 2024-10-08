import { Injectable } from '@angular/core';
import { UntypedFormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Aspect, AspectGrade, Criteria, CriteriaGrade, Exam, ExamGrade, Parameter, ParameterGrade } from './exams/exams.module';
import { db, environment } from 'src/environments/environment';
import { MatSelectChange } from '@angular/material/select';

@Injectable({
  providedIn: 'root'
})
export class ExamFormService {

  constructor(private fb: UntypedFormBuilder) { }
  
  

  replacer(key, value) {
    // Filtrando propiedades 
    if (key === "applicationDate") {
      return value.slice(0, 10);
    }
    return value;
  }  
  
  onPropertyChange(collection_path:string, id:string, event){

    var propertyName = event.srcElement.attributes.formControlname.value
    var value = event.target.value      
    if( id ){   
      var values = {}
      values[propertyName]=value                       
      db.collection(collection_path).doc(id).update(values).then( () =>{
        console.log("property has been update:" + collection_path + "/" + propertyName + "=" + value)
      },
      reason =>{
        alert("ERROR: writing property:" + reason)
      })
    }      
  }

  onCheckboxChange(collection_path:string, id:string,event){

    var propertyName = event.source.name
    var value = event.checked     
    if( id ){   
      var values = {}
      values[propertyName]=value                       
      db.collection(collection_path).doc(id).update(values).then( () =>{
        console.log("property has been update:" + collection_path + "/" + propertyName + " " + value)
      },
      reason =>{
        alert("ERROR: writing property:" + reason)
      })
    }      
  }

  onSelectChange(collection_path:string, id:string, event:MatSelectChange){
    console.log("onSelectChange")
    var propertyName = event.source.ngControl.name
    var value = event.source.ngControl.value      

    
    var values = {}

    if( id ){ 
      var values = {}
      values[propertyName]=value                                  
      db.collection(collection_path).doc(id).update(values).then( () =>{
        console.log("property has been update:" + collection_path + "/"+ propertyName + " " + value)
      },
      reason =>{
        alert("ERROR: writing property:" + reason)
      })   
    }
  }  
  

}
