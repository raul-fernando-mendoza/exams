import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';

import * as uuid from 'uuid';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class ExamsModule { }

export function copyObj( to:{}, from:{} ) {
  var result = {}
  for(const i in Object.keys(to)){
    const key = Object.keys(to)[i]

    if( key in from ){
      if( 
         typeof from[key] == "string" ||
         typeof from[key] == "number" ||         
         typeof from[key] == "boolean" ||
         (from[key] instanceof Date) ||        
         Array.isArray(from[key]) && from[key].every(i => (typeof i === "string"))
        ){
          result[key] = from[key]
          to[key] = from[key]
      }
      else if( from[key]!= null && "seconds" in from[key]  ){
        result[key] = new Date(from[key].toDate())
        to[key] = new Date(from[key].toDate())
      }
    }
  }
  return result
}

export function copyFromForm(to:{}, from:FormGroup) {
  var result = {}
  for(const i in Object.keys(to)){
    const key = Object.keys(to)[i]

    if( key in from.controls ){
      if( 
         typeof from.controls[key].value == "string" ||
         typeof from.controls[key].value == "number" ||         
         typeof from.controls[key].value == "boolean" ||
         (from.controls[key].value instanceof Date) ||
         Array.isArray(from.controls[key].value) && from.controls[key].value.every(i => (typeof i === "string"))
      ){
          result[key] = from.controls[key].value
          to[key] = from.controls[key].value
      }      
    }
  }
  return result
}

export interface User{
  uid:string 
  email?:string 
  displayName?:string
  claims?:{}
}

export interface Aspect{
  id:string
  idx?:number
  label?:string
  description?:string
}
export interface Criteria{
  id:string
  idx?:number  
  label?:string
  description?:string
  initiallySelected?:boolean
  aspects?: Aspect[]
}
export interface Parameter{
  id:string 
  idx?:number
  label?:string
  scoreType?:string
  description?:string
  criterias?: Criteria[]

  
}
export interface Exam{
  materia_id?:string 

  id:string 
  label?:string 
  description?:string 
  isRequired?:boolean 
  owners?:Array<string> 
  isDeleted?:boolean 
  

  parameters?: Parameter[] 

  required_in_carrers_ids?:Array<string> 
}

export interface Materia{
  group_id?:string 

  id:string 
  materia_name?:string 
  isDeleted?:boolean 
  owners?:Array<string> 

  typeCertificate?:string 
  iconCertificate?:string 

  description?:string 
  videoUrl?:string 
  isEnrollmentActive?:boolean 

  label1?:string 
  label2?:string 
  label3?:string 
  label4?:string 
  color1?:string 
  color2?:string 
  required_in_carrers_ids?:Array<string>

  exams?:Exam[]
}
export interface MateriaRequest{
  materias:Materia
}
export interface Group{
  nivel_id?: string

  id:string
  group_name?:string
  owners?:Array<string>
  isDeleted?:false

  evaluation_type?:number
}

export interface Nivel{
  organization_id?:string

  id:string
  nivel_name?:string
  owners?:Array<string>
  isDeleted?:boolean
}

export interface Career{
  organization_id?:string

  id:string
  career_name?:string
  isDeleted?:boolean
  owners?:Array<string>
}
/*
export class Student{
  organization_id?:string
  id:string
  student_name?:string
  email?:string
  isActive?:boolean
  owners?:Array<string>
}
*/

export interface MateriaEnrollment{
  organization_id?:string
  id:string
  materia_id?:string
  materia?:Materia
  student_uid?:string
  student?:User
  isActive?:boolean
  owners?:Array<string>
  certificate_url?:string
}

export interface ExamRequest{
  materias:{
    id:string
    exams:Exam
  }
}

export interface ExamMultipleRequest{
  exams:Exam[]
  orderBy?:{
    field:string
    direction?:string
    startAfterId?:string
    pageSize?:string
  }
}
export interface ParameterRequest{
  materias:{
    id:string
    exams:{
      id:string
      parameters:Parameter
    }
  }
}

export interface CriteriaRequest{
  materias:{
    id:string,
    exams:{
      id:string,
      parameters:{
        id:string
        criterias:Criteria
      }
    }
  }
}

export interface AspectRequest{
  materias:{
    id:string,
    exams:{
      id:string,
      parameters:{      
        id: string, 
        criterias:{  
          id:string
          aspects:Aspect
        }
      }
    }
  }
}

export interface AspectGrade{
  id:string
  idx?:number  
  label?: string 
  description?:string 
  isGraded?:boolean 
  score?:number
  hasMedal?:boolean
  missingElements?:string 
}

export interface CriteriaGrade{
  id:string 
  idx?:number 
  label?: string 
  description?: string 
  isSelected?:boolean 
  score?:number 
  aspectGrades?: AspectGrade[] 
}

export type ScoreType =  "starts" | "status"

export interface ParameterGrade{
  id:string 
  
  owners?:Array<string> 
  idx?: number 
  label?: string 
  description?:string 
  scoreType?:ScoreType 
  score?:number 
  evaluator_uid?:string 
  evaluator?:User
  applicationDate?:Date 

  isCompleted?:boolean 
  evaluator_comment?:string

  criteriaGrades?: CriteriaGrade[] 
}


export interface ExamGrade{
  id:string 
  owners?:Array<string> 

  exam_id?:string
  exam?:Exam

  materia_id?:string 
  materia?:Materia;

  isCompleted?: boolean 
  applicationDate?:Date 

  student_uid?:string 
  student?:User

  title?:string 
  expression?:string 

  score?:number 
  certificate_url?:string 


  isDeleted?:boolean 
  isReleased?:boolean 
  isApproved?:boolean 
  parameterGrades?:ParameterGrade[] 
}
export interface AspectGradeRequest{
  examGrades:{
    id:string,
    parameterGrades:{
      id:string,
      criteriaGrades:{
        id:string,
        aspectGrades:AspectGrade
      }
    }
  }
}
export interface CriteriaGradeRequest{
  examGrades:{
    id:string,
    parameterGrades:{
      id:string,
      criteriaGrades:CriteriaGrade      
    }
  }  
  
}
export interface ParameterGradeRequest{
  examGrades:{
    id:string,
    parameterGrades:ParameterGrade
  }
}
export interface ExamGradeRequest{
  examGrades:ExamGrade
}

export interface ExamGradeMultipleRequest{
  examGrades:ExamGrade[]
  orderBy?:{
    field:string
    direction?:string
    startAfterId?:string
    pageSize?:string
  }
}

export interface TypeCertificate{
  value: string
  label: string
}

export interface Organization{
  id:string
  organization_name?:string
  isDeleted?:boolean
}

export interface OrganizationRequest{
  materia:Organization
}
export interface OrganizationMultipleRequest{
  materia:Organization[]
  orderBy?:{
    field:string
    direction?:string
    startAfterId?:string
    pageSize?:string
  }
}
