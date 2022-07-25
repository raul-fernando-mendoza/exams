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

export class User{
  uid:string = null
  email:string = null
  displayName:string = null
  claims:{}
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
  owners?:Array<string>
  isDeleted?:boolean

  parameters?: Parameter[]

  required_in_carrers_ids?:Array<string>
}

export class Materia{


  group_id?:string = null

  id:string = null
  materia_name:string = null
  isDeleted?:boolean = false
  owners:Array<string> = null

  typeCertificate:string = null
  iconCertificate?:string = null

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

export class Student{
  organization_id?:string
  id:string
  student_name?:string
  email?:string
  isActive?:boolean
  owners?:Array<string>
}

export class MateriaEnrollment{
  organization_id?:string
  id:string
  materia_id:string
  student_id:string
  isActive?:boolean
  owners?:Array<string>
}

export interface ExamRequest{
  exams:Exam
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
  exams:{
    id:string
    parameters:Parameter
  }
}

export interface CriteriaRequest{
  exams:{
    id:string,
    parameters:{
      id:string
      criterias:Criteria
    }
  }
}

export interface AspectRequest{
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

export class AspectGrade{
  id:string = null
  idx:number = null 
  label: string = null
  description:string = null
  isGraded?:boolean = null
  score:number = null
  missingElements:string = null
}

export class CriteriaGrade{
  id:string = uuid.v4()
  idx:number  = null
  label: string = null
  description: string = null
  isSelected?:boolean = null
  score:number = null
  aspectGrades: AspectGrade[] = []
}

export type ScoreType =  "starts" | "status"

export class ParameterGrade{
  id:string = uuid.v4()


  grade_id:string = null
  owners:Array<string> = null;
  idx: number = null
  label: string = null
  description:string = null
  scoreType:ScoreType = null
  score:number = null
  evaluator_uid:string = null

  isCompleted:boolean = false

  criteriaGrades: CriteriaGrade[] = []
}


export class ExamGrade{
  id:string = uuid.v4()
  owners:Array<string> = null;

  exam_id:string = null;

  materia_id:string = null;

  isCompleted: boolean = false
  applicationDate:Date = null

  student_uid:string = null

  title:string = null
  expression:string = null

  score:number = 0
  certificate_url:string = null


  isDeleted:boolean = false
  isReleased:boolean = false
  isApproved:boolean = false
  parameterGrades:ParameterGrade[] = []
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
