import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class ExamsModule { }



export interface User{
  uid:string
  email:string
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
  id:string
  label?:string
  description?:string
  parameters?: Parameter[]

}

export interface ExamRequest{
  exams:Exam
}

export interface ExamMultipleRequest{
  exams:Exam[]
  orderBy?:{
    id?:string,
    label?:string
  }
}

export interface ExamParameterRequest{
  exams:{
    id:string
    parameters:Parameter
  }
}

export interface ParameterCriteriaRequest{
  parameters:{
    id:string
    criterias:Criteria
  }
}

export interface CriteriaAspectRequest{
  criterias:{
    id:string
    aspects:Aspect
  }
}

export interface ParameterRequest{
  parameters:Parameter
}

export interface CriteriaRequest{
  criterias:Criteria
}

export interface AspectRequest{
  aspects:Aspect
}

export interface AspectGrade{
  id:string
  idx?:number  
  label?: string
  description?:string
  isGraded?:boolean
  score?:number
  hasMedal?:boolean
  medalDescription?:string
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

export interface ParameterGrade{
  id: string
  idx?: number
  label?: string
  description?:string
  type?:string
  scoreType?: string
  score?:number
  evaluator_uid?:string
  evaluator_name?:string
  evaluator_comment?:string

  completed?:boolean
  

  criteriaGrades?: CriteriaGrade[] 
}


export interface ExamGrade{
  id: string

  exam_id?:string
  exam_label?:string

  course?: string
  completed?: string
  applicationDate?:Date

  student_uid?:string
  student_name?:string

  title?:string
  expression?:string

  score?:number

  parameterGrades?:ParameterGrade[]
}
export interface AspectGradeRequest{
  aspectGrades:AspectGrade
}
export interface CriteriaGradeRequest{
  criteriaGrades:CriteriaGrade
}
export interface ParameterGradeRequest{
  parameterGrades:ParameterGrade
}
export interface ExamGradeRequest{
  examGrades:ExamGrade
}

export interface ExamGradeMultipleRequest{
  examGrades:ExamGrade[]
  orderBy?:{
    applicationDate?:string
    id?:string
  }
}
